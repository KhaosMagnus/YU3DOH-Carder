"""Synthetic, adversarial receipt/custody checks; no workflow or marker emission."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
import observer as o

class GateCChecks(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name);self.core=o.load_core();h='a'*40
        ops=[dict(logical_operation_id=x,parent_operation_id='NONE',role='ADMIN') for x in ('C-INTENT-PUBLISH','C-OPS-CREATE','C-EMIT')]
        ops += [dict(logical_operation_id='C-WORKFLOW',parent_operation_id='C-EMIT',role='WORKFLOW'),dict(logical_operation_id='C1-JOB',parent_operation_id='C-WORKFLOW',role='JOB')]
        steps=[]
        for role,name in self.core.STEPS['C1'].items():
            ops.append(dict(logical_operation_id='C1-'+role,parent_operation_id='C1-JOB',role=role))
            status='completed' if role=='EFFECT' else 'in_progress' if role=='HOLD' else 'pending'
            steps.append(dict(name=name,status=status,conclusion='success' if role=='EFFECT' else None,started_at='2026-10-29T18:00:00Z' if role in ('EFFECT','HOLD') else None,completed_at='2026-10-29T18:00:01Z' if role=='EFFECT' else None))
        wrapper=lambda response:dict(source_kind='GITHUB_API_RECEIPT',requested_at='2026-10-29T18:00:10Z',receipt_at='2026-10-29T18:00:11Z',response=response)
        wf=o.BASE+'raw/unit-workflow.json';js=o.BASE+'raw/unit-jobs.json';docs={o.INTENT:dict(input_control_sha=o.CONTROL,harness_sha=h,namespace='synthetic-only',planned_intent={'operations':ops})}
        docs[wf]=wrapper(dict(id=100,head_sha=h,run_attempt=1,head_branch='ops/pp-002-gate-c-actions',status='in_progress',conclusion=None))
        docs[js]=wrapper(dict(jobs=[dict(id=200,run_id=100,head_sha=h,run_attempt=1,name='C1 synthetic',status='in_progress',conclusion=None,steps=steps)]))
        admins={}
        for op in ops[:3]:
            path=o.BASE+'raw/'+op['logical_operation_id']+'.json';docs[path]=wrapper({'success':True});admins[op['logical_operation_id']]=path
        for name,value in docs.items():
            p=self.root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(value))
        self.manifest=dict(source_control_sha=o.CONTROL,context=dict(harness_sha=h,branch='ops/pp-002-gate-c-actions',run_id=100,run_attempt=1,workflow_source=wf,jobs_source=js,admin_sources=admins),files={n:o.digest((self.root/n).read_bytes()) for n in docs})
        self.e=o.Evidence(self.root,self.manifest);self.doc,self.result=o.build(self.e,self.core)
    def tearDown(self):self.tmp.cleanup()
    def row(self,oid):return next(r for r in self.doc['observed_state'] if r['logical_operation_id']==oid)
    def validate(self):return o.validate(self.doc,self.e,self.core)
    def rollover(self):
        return dict(ROLE='PROTOCOL_PORTABILITY',INSTANCE_ID='PP-002',SESSION_ID='PP-002/S01',successor_expected='PP-002/S02',CONTROL_SHA=o.CONTROL,harness_sha=self.e.context['harness_sha'],run_id=100,run_attempt=1,job_ids=[200],S01_STOP_AFTER_C020_PUBLICATION=True,accountable_instance='PP-002',coordinator='PROJECT_CONTROL / PC-003',NON_INHERITED=['unrecorded predecessor memory'],inherited_evidence_inventory=[o.INTENT],last_observation_source_ids=[self.e.context['workflow_source'],self.e.context['jobs_source']])
    def test_valid_single_case(self):self.assertEqual(self.result['result'],'PASS');self.assertEqual(len(self.doc['observed_state']),10)
    def test_stale_not_done(self):self.row('C1-HOLD')['lifecycle']='CONFIRMED_NOT_DONE';self.assertEqual(self.validate()['result'],'FAIL')
    def test_false_nonemission(self):self.row('C-EMIT')['acknowledgement']='NOT_EMITTED_CONFIRMED';self.assertEqual(self.validate()['result'],'FAIL')
    def test_assembly_time_substitution(self):self.row('C1-JOB')['receipt_at']=self.doc['recorded_at'];self.assertEqual(self.validate()['result'],'FAIL')
    def test_missing_source(self):self.row('C1-EFFECT')['source_id']='';self.assertEqual(self.validate()['result'],'FAIL')
    def test_unsupported_cleanup(self):self.row('C1-JOB')['cleanup']='CLEANUP_CONFIRMED';self.assertEqual(self.validate()['result'],'FAIL')
    def test_no_retry(self):self.row('C1-HOLD')['safe_next_action']='RETRY_JUSTIFIED';self.assertEqual(self.validate()['result'],'FAIL')
    def test_missing_child_uncertain(self):
        path=self.e.context['jobs_source'];d=json.loads((self.root/path).read_text());d['response']['jobs'][0]['steps']=[];(self.root/path).write_text(json.dumps(d));self.manifest['files'][path]=o.digest((self.root/path).read_bytes());e=o.Evidence(self.root,self.manifest);doc,res=o.build(e,self.core)
        self.assertEqual(next(x for x in doc['observed_state'] if x['logical_operation_id']=='C1-EFFECT')['lifecycle'],'UNCERTAIN')
    def test_wrong_attempt(self):
        m=copy.deepcopy(self.manifest);m['context']['run_attempt']=2
        with self.assertRaises(AssertionError):o.Evidence(self.root,m)
    def test_source_tampering(self):
        (self.root/self.e.context['jobs_source']).write_text('{}')
        with self.assertRaises(AssertionError):o.Evidence(self.root,self.manifest)
    def test_rollover_valid_custody(self):self.doc['rollover']=self.rollover();self.assertEqual(self.validate()['result'],'PASS')
    def test_rollover_cannot_change_instance(self):
        self.doc['rollover']=self.rollover();self.doc['rollover']['INSTANCE_ID']='PP-003'
        with self.assertRaises(AssertionError):self.validate()
    def test_rollover_stop_mandatory(self):
        self.doc['rollover']=self.rollover();self.doc['rollover']['S01_STOP_AFTER_C020_PUBLICATION']=False
        with self.assertRaises(AssertionError):self.validate()
    def test_rollover_job_identity(self):
        self.doc['rollover']=self.rollover();self.doc['rollover']['job_ids']=[201]
        with self.assertRaises(AssertionError):self.validate()

if __name__=='__main__':unittest.main()
