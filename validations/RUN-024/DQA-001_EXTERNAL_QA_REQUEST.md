---
artifact_id: RUN-024-DQA-001-EXTERNAL-QA-REQUEST
artifact_type: external_qa_request
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
target_role: DESIGN_QA
target_instance: DQA-001
candidate_branch: feature/workspace-run-024
candidate_sha: e07140d5a9555a17b7b2306a45625c14adfafc8e
product_baseline: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
implementation_contract: handoffs/POST_P6_TRANCHE_1_IMPLEMENTATION_HANDOFF.md
development_report: implementations/RUN-024_DEV-006_CONTINUATION_IMPLEMENTATION_REPORT.md
development_disposition: runs/RUN-024_DEV-006_READY_DISPOSITION.md
---

# RUN 024 — External QA Request / DQA-001

## Mission

Independently validate the exact candidate:

`feature/workspace-run-024 @ e07140d5a9555a17b7b2306a45625c14adfafc8e`

against the frozen Tranche 1 Design + QA contract.

Contents:

- CR-0001.3 / F-03 — Graphical Link Marker selector;
- CR-0001.6 / F-06 — Preferred Variant warning clarity.

## Exact-SHA custody

DQA-001 must verify before assessment:

- candidate branch still equals the exact candidate SHA;
- candidate parent is `219ac252d50ae11b836a93baa20cc7f7d872367f`;
- feature/workspace-v0.1 remains `64cb5f4ca42348c6c403e64e0d61bdff8c32a281`;
- main remains `54cc3aad246c89a29f2a18be63c539db68cae041`;
- no post-validation candidate commit exists.

## Evidence to review

Primary Development evidence:

- `implementations/RUN-024_DEV-006_CONTINUATION_IMPLEMENTATION_REPORT.md`;
- Actions run `40346181389`;
- job `121653587088`;
- artifact `12662135618`;
- artifact digest `sha256:18365d2ca307762d2e65a1c38f62e2ee4bffde16701aee76f0e2a4378250ba5e`.

Review the actual candidate diff and evidence; do not accept Development assertions solely by summary.

## W1 qualification

F06-W1 is special:

```text
STANDARD = INCOMPLETE
OVERFRAME = READY
```

DEV-006 documents that this combination is unreachable through the unchanged current service readiness model.

Its UI contract was therefore exercised in the actual Library interface with an explicitly synthetic variants DTO at the response boundary.

DQA-001 must independently classify the evidentiary sufficiency.

Allowed QA conclusions include PASS, PARTIAL, FAIL, REGRESSION or INCONCLUSIVE under the DESIGN_QA role.

Do not:
- silently count synthetic W1 evidence as real service end-to-end evidence;
- silently reject it merely because it is synthetic;
- reinterpret the unreachable state as a service defect without contract evidence;
- modify product/service logic to manufacture the state.

If the frozen UI contract is adequately proven by the synthetic boundary test plus deterministic unit evidence, explain why.

If additional operational evidence is required, identify only the missing delta and route it appropriately.

## Required QA scope

Independently assess:

- all F03-AC acceptance criteria;
- all F06-AC acceptance criteria;
- combined regression acceptance;
- candidate scope boundary;
- architecture invariants;
- exact warning copy;
- graphical marker semantics;
- keyboard/focus/accessibility evidence;
- dirty-state/confirmation behavior;
- Link applicability transitions;
- Link Rating derivation;
- Preferred/manual alternate behavior;
- launch/request invariants;
- T1-OP-01..07 evidence quality and completeness.

## Expected result

Publish a new QA artifact under:

`validations/RUN-024/DQA-001_EXTERNAL_QA_REPORT.md`

Return to PROJECT_CONTROL / PC-002 with one official result:

- PASS
- PARTIAL
- FAIL
- REGRESSION
- INCONCLUSIVE

Do not integrate the candidate.
