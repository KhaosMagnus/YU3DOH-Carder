const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = process.env.CANDIDATE_ROOT;
const sha = 'dd968ba05e579461962bbcced0e9cae3cd4c3d23';
const baseline = 'e07140d5a9555a17b7b2306a45625c14adfafc8e';
const git = (...args) => execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
const data = {head:git('rev-parse','HEAD'), status:git('status','--porcelain'), diff:git('diff','--exit-code'), cachedDiff:git('diff','--cached','--exit-code'), remote:git('ls-remote','origin','refs/heads/feature/workspace-run-025'), mergeBase:git('merge-base','HEAD',baseline), commitCount:git('rev-list','--count',baseline+'..HEAD'), changedPaths:git('diff','--name-only',baseline,'HEAD'), parents:git('show','-s','--format=%P','HEAD'), files:{}};
for (const file of ['package.json','yarn.lock','workspace-server/package.json','workspace-server/yarn.lock']) data.files[file]=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
fs.writeFileSync(path.join(process.env.ENV005_OUTPUT,'custody-'+process.argv[2]+'.json'),JSON.stringify(data,null,2));
assert.equal(data.head,sha); assert.equal(data.status,''); assert.equal(data.diff,''); assert.equal(data.cachedDiff,''); assert.equal(data.remote.split(/\s/)[0],sha); assert.equal(data.mergeBase,baseline); assert.equal(data.commitCount,'1'); assert.equal(data.changedPaths.split('\n').length,7); assert.equal(data.parents,baseline);
console.log(JSON.stringify(data,null,2));

const protectedExpected={'feature/workspace-run-025':sha,'feature/workspace-v0.1':baseline,'main':'54cc3aad246c89a29f2a18be63c539db68cae041'};
data.protectedRefs={};
for(const [ref,expected] of Object.entries(protectedExpected)){const observed=git('ls-remote','origin','refs/heads/'+ref).split(/\s/)[0];data.protectedRefs[ref]=observed;assert.equal(observed,expected);}
fs.writeFileSync(path.join(process.env.ENV005_OUTPUT,'custody-'+process.argv[2]+'.json'),JSON.stringify(data,null,2));
if(process.argv[2]==='final'){const pre=JSON.parse(fs.readFileSync(path.join(process.env.ENV005_OUTPUT,'custody-preflight.json')));assert.deepEqual(data.files,pre.files);}
