# RUN 025 — DEPLOY-005 Operational Validation Request

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
DEPLOYMENT_VALIDATION / DEPLOY-005

run:
RUN 025

request:
CR-0001.4 / F-04 — Library Grid/List

exact_candidate:
feature/workspace-run-025 @ dd968ba05e579461962bbcced0e9cae3cd4c3d23

exact_baseline:
feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e

frozen_contract:
handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md

dqa_partial:
validations/RUN-025/DQA-004_EXTERNAL_QA_REPORT.md

dqa_disposition:
runs/RUN-025_DQA-004_PARTIAL_DISPOSITION.md

environment_ready:
runs/RUN-025_ENV-005_READY_DISPOSITION.md

gate_reconciliation:
control/RUN-025_GATE_RECONCILIATION.md

Purpose:
Produce independently reproducible, durable operational evidence for the exact RUN 025 candidate so DQA-004 can resume official acceptance adjudication.

DEPLOY-005 is evidence production only.
It does NOT issue the official RUN verdict.

## Exact custody

Before validation:
- verify feature/workspace-run-025 still equals dd968ba05e579461962bbcced0e9cae3cd4c3d23;
- verify feature/workspace-v0.1 still equals e07140d5a9555a17b7b2306a45625c14adfafc8e;
- verify main remains 54cc3aad246c89a29f2a18be63c539db68cae041;
- verify merge-base/parent relationship;
- use exact candidate checkout;
- clean tree before and after.

Any candidate movement:
VALIDATION BLOCKED / return to Project Control.

## Preferred execution substrate

Use GitHub-hosted Actions or an equivalently proven substrate.

ENV-005 proved:
- tsx-compatible Yarn execution;
- Chrome 155.0.8059.39;
- Service + Library reachability;
- screenshots;
- DOM/ARIA;
- HTTP capture;
- JSON evidence;
- durable artifact publication.

DEPLOY-005 may adapt the ENV-005 operational harness.

Recommended dedicated operational branch:
ops/run-025-deploy-005-actions

Operational harness changes must remain separate from product branches.

## Authoritative six-command gate

Execute literally against the exact candidate:

1. yarn compile
2. yarn build
3. yarn test:sc
4. yarn test:library
5. yarn --cwd workspace-server compile
6. yarn --cwd workspace-server test

All must exit 0 for EVIDENCE READY.

There is no required root yarn test command.

Record exact command, timestamps, exit codes, environment and logs.

## Required fixture

Use a disposable real Workspace Service fixture.

Requirements:
- at least 101 cards;
- enough data to exercise pagination with current page size 50;
- mixed card families;
- Token/null-password coverage;
- classifications/facets;
- readiness combinations;
- deterministic identity;
- no Owner Workspace data;
- cleanup after validation;
- before/after Workspace or Canonical non-mutation proof where required.

The existing committed RUN 025 fixture/harness may be used if it is independently executed and its behavior is observable.

## Required browser acceptance evidence

Execute all:

F04-B01 through F04-B26

exactly as frozen by:
handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md

At minimum retain durable proof for:

B01:
fresh LIST default at 1440×1000 DPR1.

B02:
GRID at 1440×1000 DPR1 with at least 3 columns and required card information.

B03:
GRID at 900×1000 DPR1 with at least 2 columns.

B04:
GRID at 390×844 DPR1 with exactly 1 column and no F-04 horizontal overflow.

B05:
LIST at narrow viewport with reachable Detail and Batch controls.

B06-B07:
search/facet/page state preservation and no extra browse/API request caused by pure mode switching.

B08-B10:
Batch membership, hidden selections, frozen expected revisions and checkbox state preservation across page/filter/view changes.

B11-B15:
pointer and keyboard separation for Batch, Detail and View controls; accessible roles/names and visible focus.

B16-B18:
selected Detail identity preservation under mode/page/filter changes and readiness consistency against authoritative API summaries.

B19-B22:
loading, empty-library, no-match, deterministic error/Retry, pagination and page-size behavior.

B23-B24:
non-color-only selected state and visible keyboard focus/accessibility evidence.

B25:
authoritative ordered ID/revision result equivalence across mode changes.

B26:
runtime cleanliness and Workspace/Canonical non-mutation proof.

## Required evidence forms

Retain:
- required screenshots;
- machine-readable before/after state JSON;
- relevant API request/response records;
- ordered card ID/revision snapshots;
- Batch IDs and expected revisions;
- hidden-selection counts;
- selected Detail identity;
- readiness summaries;
- viewport/DPR records;
- accessibility/ARIA or equivalent control metadata;
- page errors;
- console errors;
- failed-response log;
- Workspace/Canonical before/after hashes or equivalent proof;
- fixture cleanup record.

Screenshots alone are insufficient for machine-state cases.

## Evidence provenance

Record:
- exact CONTROL SHA consumed;
- exact candidate SHA;
- exact baseline;
- operational harness branch/head;
- Actions run/job IDs;
- artifact ID/digest;
- OS/runner;
- Node/Yarn;
- browser engine/version;
- fixture identity/card count;
- schema 8;
- Workspace format 1;
- all command results;
- every B01-B26 result with evidence references.

## Result taxonomy

Final DEPLOY-005 status must be exactly:

EVIDENCE READY

or

VALIDATION BLOCKED

EVIDENCE READY means all required evidence was produced and is durable enough for DQA-004 adjudication.

It does NOT mean QA PASS.

If any B case fails as observed product behavior:
preserve the evidence and still return it clearly; do not rewrite or conceal it.
Use VALIDATION BLOCKED only when evidence cannot be completed/reliably produced, not merely because observed behavior is adverse.

## Required publication

Publish:
validations/RUN-025/DEPLOY-005_VALIDATION_EVIDENCE.md

Preserve the complete evidence bundle under:
validations/RUN-025/DEPLOY-005/

A durable ZIP + manifest/hash is strongly preferred.

## Return

DEPLOYMENT_VALIDATION / DEPLOY-005
→ PROJECT_CONTROL / PC-002

Project Control will route the completed evidence to the SAME DESIGN_QA / DQA-004 for final official adjudication.

## Non-authorizations

Do not:
- mutate candidate code;
- move feature/workspace-run-025;
- move feature/workspace-v0.1;
- move main;
- issue official QA PASS/FAIL;
- integrate;
- implement CR-0002;
- amend frozen Design/QA criteria.

AUTO-RETURN:
When final status becomes EVIDENCE READY or VALIDATION BLOCKED, proactively emit the complete return envelope without waiting for an Owner prompt.
