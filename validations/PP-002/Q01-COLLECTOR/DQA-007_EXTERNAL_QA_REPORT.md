# DQA-007 — Independent offline QA of Q01-IMPL-001

Official outcome: **PASS**

Reviewer: DESIGN_QA / DQA-007. Return: PROJECT_CONTROL / PC-003.
Scope: frozen offline Q01 collector/guard contract only; no live execution or adoption.
Activation: `f26b93e685b9b7cd57afc16f1260e9dcfc6eb236`.
Candidate: `328e57035d34f98c4d8d417729e8b12f91894e95`.
Candidate parent: `565a197ce19d3ed140b002e1d709644cfbdda79e`.
Implementation report blob: `8f8e6b0a63b0bc5ad4c995134bf20f6d8a74ac76`.
Frozen design blob: `c72e0a6d0889ceee4e901126a33587072180017f`.
Authority: `control/PP-002_Q01_DQA-007_INDEPENDENT_QA_AUTHORIZATION.md`, blob `511437155a49d07916a71e8311e530f0967e24a9`.
Evidence root: `validations/PP-002/Q01-COLLECTOR/DQA-007/`.

## Verdict basis

DQA-007 independently retrieved the candidate and historical inputs through GitHub,
verified their identities, inspected all five delivered source files, reconstructed
historical defect oracles from raw values, and ran the complete unchanged offline
contract twice in separate materialized roots. Each invocation ran two fresh
fixture replays plus the original regressions. All mandatory families and negative
cases passed their expected acceptance/rejection oracle. Nineteen additional
reviewer assertions passed. No blocking defect, regression, skipped mandatory
family, semantic discrepancy, or missing execution dependency was observed.

This PASS is independent execution and source review, not adoption of the
implementer's self-test assertion. The unchanged runner labels its receipts
`SELF_TEST_COMPLETE` / `independent_qa=NOT_PERFORMED`; those literal inherited
fields are preserved. The independent adjudication is this report, based on the
reviewer's own observed executions and additional checks.

## Identity, custody and scope

Complete, nontruncated GitHub trees independently show 692 predecessor blobs
unchanged in path, mode and blob identity; no predecessor was removed. The candidate
adds exactly five source files, 586 evidence files and one implementation report.
All 590 entries of the implementation artifact manifest match candidate path,
Git blob and byte size. This whole-tree custody check does not pretend that every
development log's SHA-256 was separately recalculated. Raw byte verification was
performed on the complete executable corpus: 78 pinned inputs, five delivered
source files and the input manifest (84 files), matching candidate Git blobs;
the 78 inputs additionally matched declared byte lengths and SHA-256 hashes.

| Source under validation/pp002-q01-collector/ | Candidate Git blob |
|---|---|
| README.md | ce02a0f3b53decd85799c478554a06fda85196b2 |
| collector.py | 10d1407628539798ef93a2d354373eed3091fefd |
| guard.py | e0394656cf4ba1034f09e6bf34ccc6c4b9ec52e0 |
| test_guard.py | d84329edf65a2557d0e3a2ff6ecdd398ffb3a906 |
| run_contract.py | c63b4fa72493da9d2b1b29446e7e24a223e5bbeb |

The activation HEAD matched the supplied SHA at intake. QA output paths were
absent. No AGENTS.md was present in the candidate tree. The activation's authorization,
request and route are compatible with this candidate. Six protected refs matched
the frozen design baseline: main `54cc3aad246c89a29f2a18be63c539db68cae041`;
workspace-v0.1 and workspace-run-026 both `e11579950ef7ed20e4b6eeee88f9c3597c1f074b`;
ops Gate B `dd6e8bfecadab0a83c8008ea65300b1f0ba518f8`; ops R2
`0e679ad863076098d92d8a7704f6ca88948b651b`; ops Gate C
`9c508d06e3862b4b142e998708026a5ed8757fd0`.

`custody.json`, `tree-comparison.json`, `retrieval-index.json` and
`historical-verification.json` retain the independent source/tree observations and
source locators. Five fresh historical recursive tree responses were structurally
identical to the implementer's retained response objects. Their capture clocks
were not compared as if current retrieval were an original issuance event.
Direct original checkpoint reads at both refs, C-030 manifest at its publication,
and R2 intent at publication and recovery refs returned the same exact raw content
as the pinned corpus. The retained implementation report and design identities
also match the supplied blobs.

## Independent historical oracles

Q01: the original C-030 manifest, independently recovered at
`65c3d4a949fb15416ad180176511f557577eddab`, declares checkpoint source_ref
`34011f6466ce096b310ef1c43c277d2bfd2af7aa`. The correction's attributed actual URL
selects `1352de4daddc6c2143943af2ad7142333f7be963`. Fresh memberships and direct
reads prove checkpoint blob `1b8055add2533d04e6c3b42e6344e3bee9c46614` at both
refs. Different refs with identical content do not establish identical request
history. Thus F05 must reject the original claim, including after classification,
cause and disposition prose is removed. The observed guard does so.

The original issuance envelope was not recovered. Correction times and actual
fetch attribution remain later attestation; fresh tree reads cannot repair that
absence. F06's new limited projection passes EXACT_CONTENT, preserves request ref
UNKNOWN, and remains UNKNOWN for EXACT_REQUEST_HISTORY. F31 rejects the known
contradiction while preserving incompleteness across the other legacy rows. No
claim that all 57 issuance histories were reconstructed is supported or made.

R2: the original plan's operation 0 names
`validations/PP-002/GATE-B-R2/000_INTENT.json`; the retained recovery read names
`validations/PP-002/GATE-B-R2/R2-000_INTENT.json`. The latter binds blob
`f2563ec430bce506abcf8d4bcc4d032a9272ee40` at recovery ref
`ac0e60ad0126945bd560c32ecb82596a360590bc`. Fresh membership independently
confirms its original publication at `e319d4b03cc04fd07dc88df90e06071bfff53ef2`.
These two refs remain distinct. The literal path mismatch requires F16 FAIL;
F17 can accept actual-locator content only with the scoped reconciliation and
separate publication membership. Observed results match. Namespace escape,
changed product subject, wrong operation and wrong publication remain blocked.
No lifecycle, effect, outcome or acknowledgement axis is changed by reconciliation.

## Commands and observed execution

Python 3.12.14, Clang 22.1.3, Linux 6.18.57 x86_64, glibc 2.39; standard library
only. No installation or online fixture download occurred inside test execution.
Actual top-level commands from `/workspace/scratch/fe530e35cbe8`:

```text
python3 -B materialized/validation/pp002-q01-collector/run_contract.py --input-root materialized --output materialized/validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001/dqa-independent-001
python3 -B isolated-second/validation/pp002-q01-collector/run_contract.py --input-root isolated-second --output isolated-second/validations/PP-002/Q01-COLLECTOR/Q01-IMPL-001/dqa-independent-002
DQA_INPUT_ROOT=/workspace/scratch/fe530e35cbe8/materialized python3 -B delivery/validations/PP-002/Q01-COLLECTOR/DQA-007/independent_checks.py
```

All three returned exit 0. Isolated-second was prepared from the verified input
corpus, excluding first-run outputs. Inputs were treated as read-only baseline
bytes; candidate audit hooks denied writes outside each fresh output root, and
all corpus/source hashes were rechecked afterward. Because the unchanged runner
hardcodes its scratch output namespace, local outputs use Q01-IMPL-001 inside
disposable roots. Published copies are exclusively under the authorized DQA-007
evidence namespace; no implementation evidence in GitHub was overwritten.

| Observation, per complete invocation | Actual result |
|---|---|
| F01–F31 | 31 families, 79 named subcases, 138 case/profile records per replay |
| Q01 unit suite | 31 tests, zero failures/errors, twice per invocation |
| Original R1 unit suite | 22 tests, exit 0 |
| Original R1 negative 010 | Expected exit 1; 53 violations; six mandatory controls detected |
| Original corrected R1 positive | Exit 0; 24 operations; zero violations |
| Original Gate C C-020 and C-060 | Exit 0 each; 10 operations each; zero violations |
| Original Gate C unit suite | 14 tests, exit 0 |
| Blocked/stale fake publication | Seven scenarios, zero callback invocations |
| Connected fake positive | One callback per replay |
| CLI semantics | Actual 0 / 1 / 2 / 3; occupied output rejected without overwrite |
| Audit | Eleven worker/nested records; zero capability denials |
| Complete invocation elapsed | 4.997501 s and 4.073565 s |

Exact argv, subprocess exits, stdout/stderr, nested receipts, regression diagnostics,
fixture source maps, pinned source bytes, coverage and semantic results are retained
under `execution-1/` and `execution-2/`. Their fixture archives allow reconstruction
from retained raw objects and per-case local-path maps. Empty temporary folders are
not published. Runtime is measured test execution time, not reviewer effort or a
performance/reliability estimate.

Four independently produced semantic files and the directly retrieved delivered
semantic file are exactly byte-identical: **590055 bytes**;
SHA-256 `fedaf391616e9501c5fa21003dd0e62aa7b158dd3c4159527167063f5aa3f8e3`;
Git blob `6995ab80a9d852d66436f3a14214f5922a5ebd6a`.
No semantic normalization was applied to hide differences. Environment metadata
and absolute scratch paths differ in execution receipts, as expected; these are
separate from semantic evidence.

## Guard review and additional tests

Reviewed collector capture copying/clock injection; guard source pins and strict
JSON pointers; case-sensitive commit/path/blob membership; URL authority and
escaping; request/response source and correlation bindings; explicit UNKNOWN;
timestamp role/pointer/origin checks; reconciliation; and approve/use composition.
`guard.py:596–620` recomputes current approval before callback and requires the
exact authority, profile, bundle/result digests and bound passing state check.
Content-only approval is blocked for fresh-state use.

F10/F11 correctly distinguish inappropriate recorded/verified receipt pointers
from legitimately equal clock values. F19 rejects swapped concurrent responses.
F21 rejects malformed paths, symlink escapes, hostile/ambiguous URLs and duplicate
keys; unsupported immutable-history facts remain UNKNOWN. F23/F24 block stale
approvals and either failed checker. Raw bytes are hashed before JSON parsing;
result ordering and run-metadata exclusion are deterministic. No runtime import
of implementer expected-result JSON is used by guard.py.

The additional reviewer script shares the candidate's fixture-construction helper,
but authors its own assertions and mutations, and derives historical expectations
from raw fields and independently fetched memberships, without calling the
candidate's historical normalizer or consuming its expected-result labels.
Its 19 assertions include separate exact-history/content positive fake controls,
stale authority/closer/source-index/payload/path/dependency approvals, unbound or
UNKNOWN state results, content freshness blocking, missing issuance preservation,
both equal-clock negative pointers and the equal-clock positive, swapped response
correlation, and independent Q01/R2 fact comparisons. Results and script retained.

## Limits, discrepancies and disposition

No material discrepancy or reproduction blocker remains. Initial read-only
`git ls-remote` against the available mirror failed because anonymous credentials
were unavailable; GitHub connector reads successfully recovered the full required
corpus instead. No remote write was attempted through that mirror.

The trusted source index and retained connector-response binding remain external
trust anchors. Hashes cannot authenticate a malicious producer that forges both
receipts and pins; retained tree binding is not a reconstructed Git Merkle proof.
The collector does not durably persist issuance by itself. The injected wrapper
cannot prove every real publisher uses it or that an externally supplied state
checker is fresh. Python audit hooks plus source inspection are bounded containment,
not an OS sandbox proof against hostile code. No hostile-producer, live-pipeline,
real quota interruption, lost ACK, platform session separation, predecessor
inactivity or universal exactly-once property was established.

No candidate code, frozen validator, historical evidence, central index, product
ref or operational ref was modified by QA. No live workflow, retry, replacement,
cancellation or cleanup was launched. GitHub publication of this report/evidence
is the separately authorized administrative output, not a live experimental effect.
QA publication is append-only on meta/project-control with expected-head/CAS and
force=false. Its commit and report blob are returned externally after publication;
neither is self-embedded as a pre-existing observed fact. Artifact manifest excludes
itself and this report to avoid self-reference.

Recommend PC-003 accept the bounded offline implementation on this source-bound
PASS. Avoid promoting it to live recovery or protocol adoption. Next action is
PC-003's acceptance/disposition and any separately authorized follow-up.

Gate C: REVISE / UNCHANGED. Final PP-002 recommendation: REVISE / UNCHANGED.
P01: UNCERTAIN. P02: UNKNOWN. Generic Protocol v1.0 / PP-002 v2: FROZEN / UNCHANGED.
Protocol successor, adoption and live integration: NOT AUTHORIZED.
