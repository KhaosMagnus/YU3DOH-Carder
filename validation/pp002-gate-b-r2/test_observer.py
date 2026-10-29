"""Adversarial synthetic receipt tests, no external execution."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
import observer as o

class GuardTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(); self.root=Path(self.temp.name)
        self.core=o.load_core(); self.harness='a'*40
        ops=[{'logical_operation_id':'R2-INTENT-PUBLISH','parent_operation_id':'NONE','role':'ADMIN'},
             {'logical_operation_id':'R2-OPS-CREATE','parent_operation_id':'NONE','role':'ADMIN'},
             {'logical_operation_id':'R2-EMIT','parent_operation_id':'NONE','role':'ADMIN'},
             {'logical_operation_id':'R2-WORKFLOW','parent_operation_id':'R2-EMIT','role':'WORKFLOW'}]
        jobs=[]
        for i,case in enumerate(('B1','B2','B3')):
            ops.append({'logical_operation_id':case+'-JOB','parent_operation_id':'R2-WORKFLOW','role':'JOB'})
            steps=[]
            for role,name in self.core.STEPS[case].items():
                ops.append({'logical_operation_id':case+'-'+role,'parent_operation_id':case+'-JOB','role':role})
                if case=='B2':continue
                status='completed' if role in ('EFFECT','CHILD') else 'in_progress' if role=='HOLD' else 'pending'
                steps.append(dict(name=name,status=status,conclusion='failure' if role=='CHILD' else 'success' if status=='completed' else None,started_at=None if status=='pending' else '2026-10-29T12:00:00Z',completed_at='2026-10-29T12:00:01Z' if status=='completed' else None))
            jobs.append(dict(id=200+i,run_id=100,head_sha=self.harness,run_attempt=1,name=case+' synthetic',status='in_progress',conclusion=None,steps=steps))
        docs={o.INTENT:dict(input_control_sha=o.CONTROL,harness_sha=self.harness,namespace='synthetic-unit-only',planned_intent={'operations':ops})}
        wrapper=lambda response:dict(source_kind='GITHUB_API_RECEIPT',requested_at='2026-10-29T12:00:10Z',receipt_at='2026-10-29T12:00:11Z',response=response)
        wf=o.BASE+'raw/unit-workflow.json';js=o.BASE+'raw/unit-jobs.json'
        docs[wf]=wrapper(dict(id=100,head_sha=self.harness,run_attempt=1,head_branch='ops/pp-002-gate-b-r2-actions',status='in_progress',conclusion=None))
        docs[js]=wrapper(dict(jobs=jobs)); admins={}
        for op in ops[:3]:
            p=o.BASE+'raw/'+op['logical_operation_id']+'.json';docs[p]=wrapper({'success':True});admins[op['logical_operation_id']]=p
        for name,value in docs.items():
            p=self.root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(value))
        self.manifest=dict(source_control_sha=o.CONTROL,context=dict(harness_sha=self.harness,branch='ops/pp-002-gate-b-r2-actions',run_id=100,run_attempt=1,workflow_source=wf,jobs_source=js,admin_sources=admins),files={n:o.digest((self.root/n).read_bytes()) for n in docs})
        self.e=o.Evidence(self.root,self.manifest);self.doc,self.result=o.build(self.e,self.core)
    def tearDown(self):self.temp.cleanup()
    def row(self,oid):return next(r for r in self.doc['observed_state'] if r['logical_operation_id']==oid)
    def check(self):return o.validate(self.doc,self.e,self.core)
    def test_baseline(self):self.assertEqual(self.result['result'],'PASS')
    def test_active_parent_failed_child(self):
        self.assertEqual(self.row('B3-JOB')['lifecycle'],'STILL_RUNNING');self.assertEqual(self.row('B3-CHILD')['outcome'],'FAILURE');self.assertEqual(self.row('B3-CHILD')['safe_next_action'],'RECONCILE_EFFECT')
    def test_missing_child_not_inherited(self):
        self.assertEqual(self.row('B2-EFFECT')['lifecycle'],'UNCERTAIN');self.assertEqual(self.row('B2-EFFECT')['acknowledgement'],'UNKNOWN')
    def test_notdone_contradiction(self):
        self.row('B1-HOLD')['lifecycle']='CONFIRMED_NOT_DONE';self.assertEqual(self.check()['result'],'FAIL')
    def test_nonemission_contradiction(self):
        self.row('R2-EMIT')['acknowledgement']='NOT_EMITTED_CONFIRMED';self.assertEqual(self.check()['result'],'FAIL')
    def test_assembly_time_substitution(self):
        self.row('B1-JOB')['receipt_at']=self.doc['recorded_at'];self.assertEqual(self.check()['result'],'FAIL')
    def test_invented_request_time(self):
        self.row('B1-JOB')['requested_at']='2026-10-29T12:00:09Z';self.assertEqual(self.check()['result'],'FAIL')
    def test_missing_source(self):
        self.row('B1-JOB')['source_id']='';self.assertEqual(self.check()['result'],'FAIL')
    def test_crossbound_source(self):
        self.row('B1-JOB')['source_id']=self.row('B2-JOB')['source_id'];self.assertEqual(self.check()['result'],'FAIL')
    def test_lifecycle_not_success(self):
        self.row('B3-CHILD')['outcome']='SUCCESS';self.assertEqual(self.check()['result'],'FAIL')
    def test_runner_terminal_not_cleanup(self):
        self.row('B1-EFFECT')['cleanup']='CLEANUP_CONFIRMED';self.assertEqual(self.check()['result'],'FAIL')
    def test_no_retry_authority(self):
        self.row('B1-HOLD')['safe_next_action']='RETRY_JUSTIFIED';self.assertEqual(self.check()['result'],'FAIL')
    def test_dropped_operation(self):
        self.doc['observed_state'].pop();self.assertEqual(self.check()['result'],'FAIL')
    def test_source_byte_tamper(self):
        (self.root/self.manifest['context']['jobs_source']).write_text('{}')
        with self.assertRaises(AssertionError):o.Evidence(self.root,self.manifest)
    def test_foreign_identity(self):
        name=self.manifest['context']['workflow_source'];p=self.root/name;doc=json.loads(p.read_text());doc['response']['run_attempt']=2;p.write_text(json.dumps(doc));self.manifest['files'][name]=o.digest(p.read_bytes())
        with self.assertRaises(AssertionError):o.Evidence(self.root,self.manifest)
    def test_unknown_receipt_not_assembly(self):
        name=self.manifest['context']['workflow_source'];p=self.root/name;doc=json.loads(p.read_text());doc['receipt_at']='UNKNOWN';p.write_text(json.dumps(doc));self.manifest['files'][name]=o.digest(p.read_bytes());e=o.Evidence(self.root,self.manifest);d,r=o.build(e,self.core)
        self.assertEqual(next(x for x in d['observed_state'] if x['logical_operation_id']=='R2-WORKFLOW')['receipt_at'],'UNKNOWN')

if __name__=='__main__':unittest.main()
