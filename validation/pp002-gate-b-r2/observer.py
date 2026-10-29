"""Bounded live receipt adapter; byte-identical B-R1 validation core, no network.

Only the input adapter changes. Calls to GitHub remain explicit orchestrator actions.
Each build verifies source bytes, derives, checks, then stamps local verification.
"""
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
from datetime import datetime, timezone

CONTROL = '930dcab160df28c7606991cff4388fea29f351cf'
BASE = 'validations/PP-002/GATE-B-R2/'
INTENT = BASE + 'R2-000_INTENT.json'
R1_SHA256 = '0ebe717cb4830d376668a9d3ac193fd026399279c09a68af656e04d566247633'
UNKNOWN = 'UNKNOWN'

def now():
    return datetime.now(timezone.utc).isoformat()

def write_new(path, value):
    p = Path(path); p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        json.dump(value, f, indent=2, sort_keys=True); f.write('\n')

def digest(data):
    return {'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),
            'git_blob_sha':hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()}

def load_core():
    p=Path(__file__).resolve().parents[1]/'pp002-gate-b-r1'/'revalidate.py'
    assert hashlib.sha256(p.read_bytes()).hexdigest()==R1_SHA256, 'R1 core changed'
    spec=importlib.util.spec_from_file_location('r1_live_core',p)
    m=importlib.util.module_from_spec(spec); sys.modules[spec.name]=m; spec.loader.exec_module(m)
    m.CONTROL=CONTROL; m.INTENT=INTENT
    m.OBSERVED_FIELDS=m.OBSERVED_FIELDS | {'supplemental_source_ids'}
    m.bindings=bindings; m.expected=expected
    return m

class Evidence:
    def __init__(self, root, manifest):
        self.root=Path(root).resolve(); self.manifest=manifest; self.docs={}
        assert manifest['source_control_sha']==CONTROL
        for name, wanted in manifest['files'].items():
            p=(self.root/name).resolve(); assert p.is_relative_to(self.root)
            data=p.read_bytes(); assert digest(data)==wanted, 'Source bytes changed: '+name
            if name.endswith('.json'): self.docs[name]=json.loads(data)
        self.intent=self.docs[INTENT]; self.context=manifest['context']
        assert self.intent['input_control_sha']==CONTROL
        assert self.context['harness_sha']==self.intent['harness_sha']
        assert self.context['run_attempt']==1
        assert self.context['branch']=='ops/pp-002-gate-b-r2-actions'
        for key in ('workflow_source','jobs_source'):
            r=self.docs[self.context[key]]
            assert r['source_kind']=='GITHUB_API_RECEIPT'
            for t in ('requested_at','receipt_at'):
                assert r[t]==UNKNOWN or datetime.fromisoformat(r[t].replace('Z','+00:00')).tzinfo
        workflow=self.docs[self.context['workflow_source']]['response']
        assert workflow['id']==self.context['run_id']
        assert workflow['run_attempt']==1 and workflow['head_sha']==self.context['harness_sha']
        assert workflow['head_branch']==self.context['branch']
        assert all(j['run_id']==self.context['run_id'] and j['head_sha']==self.context['harness_sha'] and j['run_attempt']==1
                   for j in self.docs[self.context['jobs_source']]['response']['jobs'])
        self.package_cache={}

    def resolve(self, source):
        name,pointer=source.split('#',1); value=self.docs[name]
        for part in pointer.lstrip('/').split('/') if pointer else []:
            part=part.replace('~1','/').replace('~0','~')
            value=value[int(part)] if isinstance(value,list) else value[part]
        return value

    def package(self, case):
        if case in self.package_cache: return self.package_cache[case]
        directory=self.context.get('verified_packages',{}).get(case)
        if not directory: return None
        docs={n:self.docs[directory+'/'+n+'.json'] for n in ('marker','startup','cleanup','final','manifest')}
        for n in ('marker','startup','cleanup','final','manifest'):
            d=docs[n]
            assert d['namespace']==self.intent['namespace'] and d['case']==case
            assert d['harness_sha']==self.context['harness_sha'] and d['control_sha']==CONTROL
            assert int(d['run_id'])==self.context['run_id'] and d['run_attempt']=='1'
        for name, meta in docs['manifest']['files'].items():
            p=self.root/directory/name; actual=digest(p.read_bytes())
            assert actual['bytes']==meta['bytes'] and actual['sha256']==meta['sha256']
            assert directory+'/'+name in self.manifest['files']
        cleanup=docs['cleanup']; final=docs['final']
        assert cleanup['owned_marker_checked'] and cleanup['root_existed_before'] and cleanup['removed']
        assert cleanup['cleanup']=='CLEANUP_CONFIRMED'
        assert final['effect_creation_count']==1 and final['duplicate_effect_count']==0 and final['root_removed']
        assert docs['startup']['exclusive_marker_count']==1
        events=[json.loads(line) for line in (self.root/directory/'events.jsonl').read_text().splitlines()]
        assert sum(x['event']=='effect_created' for x in events)==1
        encoded=(json.dumps(docs['marker'],sort_keys=True)+'\n').encode()
        assert hashlib.sha256(encoded).hexdigest()==docs['startup']['marker_sha256']
        if case=='B3':
            child=self.docs[directory+'/partial.json']
            assert child['intentional'] and child['expected_exit_code']==23 and child['outcome']=='FAILURE'
        self.package_cache[case]=directory
        return directory

def bindings(e):
    core=sys.modules['r1_live_core']; result=[]
    jobs=e.docs[e.context['jobs_source']]['response']['jobs']
    for op in e.intent['planned_intent']['operations']:
        oid=op['logical_operation_id']; role=op['role']; parent=op['parent_operation_id']
        if role=='ADMIN':
            kind='PUBLICATION_ACK' if oid=='R2-INTENT-PUBLISH' else 'REF_ACK'
            source=e.context['admin_sources'][oid]+'#/response'
        elif role=='WORKFLOW':
            kind='WORKFLOW_QUERY_RECEIPT'; source=e.context['workflow_source']+'#/response'
        else:
            case=oid[:2]; matches=[(i,j) for i,j in enumerate(jobs) if j['name'].startswith(case+' ')]
            assert len(matches)==1, 'Missing/ambiguous job identity'
            i,job=matches[0]; source=e.context['jobs_source']+'#/response/jobs/'+str(i)
            if role=='JOB': kind='JOB_QUERY_RECEIPT'
            else:
                found=[k for k,s in enumerate(job.get('steps',[])) if s['name']==core.STEPS[case][role]]
                assert len(found)<=1
                kind='STEP_QUERY_RECEIPT' if found else 'ABSENT_CHILD_OBSERVATION'
                if found: source+='/steps/'+str(found[0])
        result.append(core.Binding(oid,parent,kind,source,role))
    return result

def expected(e,b):
    node=e.resolve(b.source_id); file=b.source_id.split('#')[0]; receipt=e.docs[file]
    result=dict(lifecycle='UNCERTAIN',outcome=UNKNOWN,effect='EFFECT_UNKNOWN',evidence='EVIDENCE_INSUFFICIENT',
                cleanup='CLEANUP_UNKNOWN',acknowledgement=UNKNOWN,requested_at=receipt.get('requested_at',UNKNOWN),
                responded_at=receipt.get('receipt_at',UNKNOWN),receipt_at=receipt.get('receipt_at',UNKNOWN),
                event_at=UNKNOWN,time_source_id=file+'#/receipt_at',temporal_support='Orchestrator boundary times retained with raw connector response')
    if b.kind=='ABSENT_CHILD_OBSERVATION': return result
    if b.kind in ('PUBLICATION_ACK','REF_ACK'):
        assert node.get('success') is True, 'No successful mutation acknowledgement'
        result.update(lifecycle='CONFIRMED_DONE',outcome='SUCCESS',effect='EFFECT_CONFIRMED',evidence='EVIDENCE_VERIFIED',
                      cleanup='CLEANUP_NOT_APPLICABLE',acknowledgement='EMITTED_ACKNOWLEDGED')
        return result
    status=node['status']; conclusion=node.get('conclusion')
    result['event_at']={k:node.get(k) or UNKNOWN for k in ('created_at','started_at','completed_at','updated_at') if k in node}
    result.update(evidence='EVIDENCE_VERIFIED',acknowledgement='EMITTED_ACKNOWLEDGED')
    if status in ('queued','in_progress','waiting','pending','requested') and b.kind!='STEP_QUERY_RECEIPT':
        result.update(lifecycle='STILL_RUNNING',effect='POSSIBLE_EFFECT')
    elif status=='in_progress':
        result.update(lifecycle='STILL_RUNNING',effect='POSSIBLE_EFFECT')
    elif status=='pending' and not node.get('started_at'):
        result.update(lifecycle='CONFIRMED_NOT_DONE',outcome='NOT_APPLICABLE',effect='NO_EFFECT_CONFIRMED',acknowledgement='NOT_EMITTED_CONFIRMED')
    elif status=='completed':
        result.update(lifecycle='CONFIRMED_DONE',outcome={'success':'SUCCESS','failure':'FAILURE','cancelled':'CANCELLED','skipped':'NOT_APPLICABLE'}.get(conclusion,UNKNOWN),
                      effect='NO_EFFECT_CONFIRMED' if conclusion=='skipped' else 'EFFECT_CONFIRMED')
    if b.role in ('HOLD','FINALIZE','UPLOAD','PARTIAL-UPLOAD','CHILD'):
        result['cleanup']='CLEANUP_NOT_APPLICABLE'
    if b.role in ('EFFECT','JOB','WORKFLOW','CLEANUP'):
        result['cleanup']='CLEANUP_REQUIRED' if result['lifecycle'] in ('CONFIRMED_DONE','STILL_RUNNING') else 'CLEANUP_UNKNOWN'
    cases=('B1','B2','B3') if b.role=='WORKFLOW' else (b.operation_id[:2],)
    packages=[e.package(c) for c in cases]
    if all(packages) and result['lifecycle']=='CONFIRMED_DONE':
        result['cleanup']='CLEANUP_CONFIRMED' if b.role in ('EFFECT','JOB','WORKFLOW','CLEANUP') else result['cleanup']
    return result

def action(proof,b,e):
    if proof['lifecycle']=='STILL_RUNNING': return 'KEEP_OBSERVING'
    if proof['lifecycle'] in ('UNCERTAIN','CONFIRMED_NOT_DONE'): return 'BLOCK'
    if proof['outcome'] in ('FAILURE','PARTIAL','CANCELLED'): return 'RECONCILE_EFFECT'
    if b.role in ('ADMIN','HOLD','UPLOAD','PARTIAL-UPLOAD'): return 'REUSE_RESULT'
    if b.role=='WORKFLOW': verified=all(e.package(c) for c in ('B1','B2','B3'))
    else: verified=e.package(b.operation_id[:2])
    return 'REUSE_RESULT' if verified and proof['outcome']=='SUCCESS' else 'RECONCILE_EFFECT'

def validate(document,e,core):
    result=core.validate(document,e)
    assert document.get('input_manifest')==e.manifest, 'Snapshot/source manifest mismatch'
    assert document.get('planned_intent')==e.intent['planned_intent'], 'Frozen intent identity mismatch'
    byid={b.operation_id:b for b in bindings(e)}
    for r in document.get('observed_state',[]):
        if r.get('logical_operation_id') in byid:
            b=byid[r['logical_operation_id']]
            if r.get('safe_next_action')!=action(expected(e,b),b,e):
                result['violations'].append(dict(logical_operation_id=b.operation_id,violated_invariant='UNSUPPORTED_SAFE_ACTION',source_evidence=[b.source_id],detail='Action must obey lifecycle/effect/evidence and no-retry authority'))
            assert r.get('supplemental_source_ids')==supplemental(e,b), 'Supplemental custody mismatch'
    result.update(validator='PP002-GATE-B-R2-source-adapter-v1 / unchanged R1 validate core',claim_scope='Source-receipt state at independently recorded read boundaries',
                  result='FAIL' if result['violations'] else 'PASS',invariant_violation_count=len(result['violations']),valid_current_observed_ledger=not result['violations'])
    return result

def supplemental(e,b):
    cases=('B1','B2','B3') if b.role=='WORKFLOW' else (b.operation_id[:2],)
    return [directory+'/'+n+'.json#' for c in cases if (directory:=e.package(c))
            for n in ('marker','startup','cleanup','final','manifest')]

def build(e,core):
    recorded=now(); rows=[]
    for b in bindings(e):
        p=expected(e,b)
        rows.append(dict(logical_operation_id=b.operation_id,parent_operation_id=b.parent,source_kind=b.kind,source_id=b.source_id,
                         **p,recorded_at=recorded,verified_at=UNKNOWN,state_as_of=p['receipt_at'],safe_next_action=action(p,b,e),
                         action_scope='No retry/replacement/cancel authority; read receipts are historical immediately after capture',
                         supplemental_source_ids=supplemental(e,b),
                         evidence_scope='Execution status receipt; exact marker/cleanup reuse requires verified artifact package'))
    doc=dict(schema='PP002-GATE-B-R2-source-ledger-v1',revalidation_control_sha=CONTROL,subject_control_sha=CONTROL,harness_sha=e.context['harness_sha'],
             recorded_at=recorded,verified_at=UNKNOWN,planned_intent=copy.deepcopy(e.intent['planned_intent']),observed_state=rows,
             input_manifest=copy.deepcopy(e.manifest))
    check=validate(doc,e,core); assert check['result']=='PASS',json.dumps(check)
    verified=now(); doc['verified_at']=verified
    for r in rows:r['verified_at']=verified
    return doc,validate(doc,e,core)

def main():
    p=argparse.ArgumentParser();p.add_argument('--root',default='.');p.add_argument('--manifest',required=True);p.add_argument('--output',required=True);p.add_argument('--result',required=True);p.add_argument('--ledger')
    a=p.parse_args(); core=load_core(); e=Evidence(a.root,json.loads(Path(a.manifest).read_text()))
    if a.ledger:doc=json.loads(Path(a.ledger).read_text());check=validate(doc,e,core)
    else:doc,check=build(e,core)
    write_new(a.output,doc);write_new(a.result,check)
    print(json.dumps({'result':check['result'],'operations':len(doc['observed_state']),'violations':check['invariant_violation_count']}))
    return 0 if check['result']=='PASS' else 1

if __name__=='__main__':sys.exit(main())
