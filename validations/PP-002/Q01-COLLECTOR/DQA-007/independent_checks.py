"""DQA-007 additional offline assertions. Candidate files remain untouched."""
import sys, json, hashlib, tempfile, os
from pathlib import Path
from copy import deepcopy
ROOT=Path(os.environ['DQA_INPUT_ROOT']).resolve()
os.environ['Q01_INPUT_ROOT']=str(ROOT)
sys.path.insert(0,str(ROOT/'validation/pp002-q01-collector'))
import guard as g
from test_guard import Fixture
rows=[]
def record(name, condition, detail):
    rows.append(dict(name=name,passed=bool(condition),detail=detail))
    assert condition,(name,detail)
def run_mutation(name, mutate=None, profile='EXACT_REQUEST_HISTORY',state='PASS',fresh=True,expected=0):
    f=Fixture()
    try:
        p=f.meta('content'); f.b['intended_publication']=[dict(path='validations/synthetic/output.json',source_id='content',profile=profile,dependencies=['read-1'],intended_path='NONE',**{k:p[k] for k in ('bytes','sha256','git_blob_sha')})]
        approval=g.approve(f.b,profile,f.root)
        sc=dict(result=state,bundle_sha256=approval['bundle_sha256'])
        if mutate: mutate(f,sc,approval)
        calls=[]
        out=g.use_if_approved(f.b,profile,f.root,approval,sc,lambda:calls.append(1),'565a197ce19d3ed140b002e1d709644cfbdda79e',fresh)
        record(name,len(calls)==expected,dict(callbacks=len(calls),outcome=out))
    finally:f.close()
run_mutation('positive connected exact-history fake control',expected=1)
run_mutation('stale authority',lambda f,s,a:f.b.update(authority_control_sha='f'*40))
run_mutation('stale accountable closer',lambda f,s,a:f.b.update(accountable_closer='other'))
run_mutation('stale source index origin',lambda f,s,a:f.meta('req').update(origin_locator='other'))
run_mutation('stale payload bytes',lambda f,s,a:(f.root/f.meta('content')['local_path']).write_bytes(b'changed\n'))
run_mutation('stale actual output path',lambda f,s,a:f.b['intended_publication'][0].update(path='validations/synthetic/other.json'))
run_mutation('stale dependency',lambda f,s,a:f.b['intended_publication'][0].update(dependencies=[]))
run_mutation('unbound passing state checker',lambda f,s,a:s.update(bundle_sha256='f'*64))
run_mutation('state checker UNKNOWN',state='UNKNOWN')
run_mutation('content-only cannot authorize fresh state',profile='EXACT_CONTENT')
run_mutation('content positive fake without freshness claim',profile='EXACT_CONTENT',fresh=False,expected=1)
f=Fixture()
try:
    f.no_request();a=g.validate_bundle(f.b,'EXACT_REQUEST_HISTORY',f.root);b=g.validate_bundle(f.b,'EXACT_CONTENT',f.root)
    record('unknown issuance preserved across profiles',a['verdict']=='UNKNOWN' and b['verdict']=='PASS' and b['verified_claims'][0]['request_identity']['ref']=='UNKNOWN',dict(history=a['verdict'],content=b['verdict']))
finally:f.close()
for field in ['recorded_at','verified_at']:
 f=Fixture()
 try:
    f.r['temporal_provenance']['receipt_at']=f.q('clock','/'+field);f.r['temporal_provenance']['receipt_at'].update(clock_role='receipt_at',clock_id='observer-clock')
    out=g.validate_bundle(f.b,'EXACT_REQUEST_HISTORY',f.root)
    record('equal numeric clock improper '+field,out['verdict']=='FAIL' and any(v['invariant_code']=='TIMESTAMP_ROLE_CONFLATION' for v in out['violations']),out['verdict'])
 finally:f.close()
f=Fixture()
try:
    out=g.validate_bundle(f.b,'EXACT_REQUEST_HISTORY',f.root)
    record('equal numeric clock proper independent pointers',out['verdict']=='PASS',out['verdict'])
    d=f.doc('resp');d['retrieval_id']='different-concurrent-request';f.replace('resp',d)
    out=g.validate_bundle(f.b,'EXACT_CONTENT',f.root)
    record('swapped correlation cannot pass content',out['verdict']=='FAIL',out['verdict'])
finally:f.close()
# Historical oracle from raw fields and fresh independently recovered membership;
# no candidate normalizer or expected-result labels supplies these comparisons.
base=ROOT/'validations/PP-002'
legacy=json.loads((base/'GATE-C/S02/source-recovery-manifest.json').read_bytes())
corr=json.loads((base/'GATE-C/S02/source-reference-audit-correction.json').read_bytes())['discrepancies'][0]
old=next(x for x in legacy['files'] if x['path']==corr['path'])
custody=json.loads((Path(__file__).parent/'custody.json').read_bytes())
members=custody['historical'];blobs=[]
for ref in (old['source_ref'],corr['actual_fetch_ref']):
    blobs.append(next(x['sha'] for x in members[ref]['members'] if x['path']==corr['path']))
record('raw Q01 wrong-ref identical-blob oracle',old['source_ref']!=corr['actual_fetch_ref'] and blobs==[old['git_blob_sha']]*2,dict(declared_ref=old['source_ref'],attested_actual_ref=corr['actual_fetch_ref'],blobs=blobs,request_issuance='UNKNOWN',timing_origin='LATER_ATTESTATION'))
intent=json.loads((base/'GATE-B-R2/R2-000_INTENT.json').read_bytes());reads=json.loads((base/'GATE-B-R2/recovery-entry.json').read_bytes());rec=json.loads((base/'GATE-B-R2/planning-path-reconciliation.json').read_bytes())
plan=intent['planned_intent']['operations'][0]['effect_output_namespace'];actual=next(x for x in reads['durable_recovery_reads'] if x['key']=='intent')
record('raw R2 administrative mismatch oracle',plan!=actual['path'] and rec['planned_literal_path']==plan and rec['actual_published_path']==actual['path'] and rec['actual_blob']==actual['sha'],dict(plan=plan,actual=actual['path'],read_ref=actual['ref'],publication_ref=rec['actual_publication'],effect_axes='UNCHANGED'))
record('raw R2 publication and later read are distinct memberships',all(any(x['path']==actual['path'] and x['sha']==actual['sha'] for x in members[ref]['members']) for ref in (actual['ref'],rec['actual_publication'])) and actual['ref']!=rec['actual_publication'],actual['sha'])
Path(__file__).with_name('independent-results.json').write_text(json.dumps(dict(checks=rows,count=len(rows),all_passed=True),indent=2)+'\n')
print(json.dumps(dict(checks=len(rows),all_passed=True)))
