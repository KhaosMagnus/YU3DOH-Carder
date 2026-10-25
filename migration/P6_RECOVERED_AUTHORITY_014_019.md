---
artifact_id: P6-RECOVERED-AUTHORITY-014-019
artifact_type: migration_inventory
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: 56287c1ce61255093c4a9aedfd1e68087ce4658b
---

# P6 — Recovered historical authority: RUN 014–019

## Method

This record combines:

1. live GitHub branch heads and ancestry;
2. retained Development reports;
3. later Scope/Roadmap checkpoints that explicitly identify prior RUN closure;
4. downstream authorized baselines.

It preserves the distinction between:

- **explicit historical closure evidence**; and
- **integration checkpoint reconstructed from downstream authority**.

A downstream integrated baseline may establish that an exact RUN checkpoint entered `feature/workspace-v0.1` without pretending that the original role-owned QA/integration artifact has already been recovered.

---

## Verified Git lineage

Historical chain:

```text
RUN 013
366fea433d6eccde9b2848dee2f9b53297926a69
   ↓ +1
RUN 014
fd13018c881f63764efb60bc1c88b4eb0a400018
   ↓ +1
RUN 015
191454d44f3273cf2efba254bddd8ba5275a08aa
   ↓ +3
RUN 016
163799a60772da69ecabbae03d8b2966a50d6c46
   ↓ +4
RUN 017
0c94aa7990c227690b5d90e2d73ae892a37930ee
   ↓ +3
RUN 018
d7f5d567856503a42d14543d876eb7d1e0c2b311
   ↓ +1
RUN 019
e83de9793c26f78834f748b320161a168943d4ed
```

Every comparison is:

- status: `ahead`
- behind_by: `0`
- merge-base: exact predecessor checkpoint.

No divergence was found in this historical segment.

Database schema throughout RUN 014–019:

`6`

Workspace format:

`1`

Migration 007 first belongs to RUN 020 and is not part of this tranche.

---

## RUN 014 — Persisted Canonical Review / Confirmation

Final checkpoint:

`fd13018c881f63764efb60bc1c88b4eb0a400018`

Commit:

`feat(library): review and confirm persisted Canonical blocks`

Development evidence recovered:

- exact final SHA `fd13018c...`;
- Linux + Windows validation PASS;
- operational browser evidence PASS;
- Development status: `READY FOR EXTERNAL QA`;
- at Development-report time, `feature/workspace-v0.1` still remained at RUN 013.

Historical integration evidence:

The RUN 015 frozen implementation baseline is explicitly:

`feature/workspace-v0.1 @ fd13018c881f63764efb60bc1c88b4eb0a400018`

and RUN 015 was authorized only after the prior RUN checkpoint became the Workspace baseline.

Therefore the exact RUN 014 integration checkpoint is established.

Recovered state:

`PASS / INTEGRATED / CLOSED — reconstructed from downstream authorized baseline`

Classification:

`HISTORICAL AUTHORITY — INTEGRATION CHECKPOINT RECOVERED / PRIMARY FINAL QA + INTEGRATION ARTIFACTS PENDING ARCHIVAL RECOVERY`

---

## RUN 015 — Workspace Recovery & Maintenance Management UI

Final checkpoint:

`191454d44f3273cf2efba254bddd8ba5275a08aa`

Commit:

`feat(library): expose Workspace recovery and maintenance management`

Development evidence recovered:

- exact final SHA `191454d...`;
- Linux + Windows exact-SHA validation PASS;
- operational browser suites PASS;
- Development status: return to External Design + QA;
- at Development-report time, RUN 015 was not yet integrated.

Historical integration evidence:

RUN 016 implementation explicitly starts from:

`feature/workspace-v0.1 @ 191454d44f3273cf2efba254bddd8ba5275a08aa`

and its branch is created from that exact authorized baseline.

Therefore the exact RUN 015 integration checkpoint is established before RUN 016 authorization.

Recovered state:

`PASS / INTEGRATED / CLOSED — reconstructed from downstream authorized baseline`

Classification:

`HISTORICAL AUTHORITY — INTEGRATION CHECKPOINT RECOVERED / PRIMARY FINAL QA + INTEGRATION ARTIFACTS PENDING ARCHIVAL RECOVERY`

---

## RUN 016 — Single-Workspace Initialization

Final QA/integration checkpoint:

`163799a60772da69ecabbae03d8b2966a50d6c46`

Historical capability:

`Single-Workspace Initialization`

Recovered explicit post-RUN authority states:

- External Design + QA: `PASS`;
- QA-validated SHA: `163799a...`;
- Integrated: `YES`;
- Method: `DIRECT FAST-FORWARD`.

Frozen architecture retained:

```text
1 Workspace Service process
=
1 externally configured workspaceRoot
=
1 active Workspace
```

No Host Launcher, dynamic Switch, root picker or multi-Workspace runtime was introduced.

Recovered state:

`CLOSED / PASS / INTEGRATED`

Classification:

`HISTORICAL AUTHORITY — EXPLICITLY RECOVERED`

---

## RUN 017 — Carder → Workspace Selective Write Bridge

Final QA/integration checkpoint:

`0c94aa7990c227690b5d90e2d73ae892a37930ee`

Historical capability:

`Carder → Workspace Selective Write Bridge`

Recovered explicit checkpoint states:

- RUN 017: `CLOSED / PASS / INTEGRATED`;
- integration SHA: `0c94aa79...`;
- subsequent Workspace baseline equals the same SHA.

The closed model is:

`CANONICAL-ONLY / SELECTIVE WRITE`

including selective supported Canonical write-back while Assets/Variants remain outside the Carder save path.

Recovered state:

`CLOSED / PASS / INTEGRATED`

Classification:

`HISTORICAL AUTHORITY — EXPLICITLY RECOVERED`

---

## RUN 018 — Library Multi-Select & Batch Classification Operations

Final QA/integration checkpoint:

`d7f5d567856503a42d14543d876eb7d1e0c2b311`

Historical capability:

`Library Multi-Select & Batch Classification Operations`

Recovered explicit post-RUN authority states:

- External Design + QA: `PASS`;
- QA-validated SHA: `d7f5d567...`;
- Integrated: `YES`;
- Method: `DIRECT FAST-FORWARD`.

Closed scope includes explicit multi-selection and bounded Classification batch Preview/Apply with independent per-card transactions and partial-result reporting.

It explicitly excludes STRUCTURE/TEXT/RELATIONS/Asset/Variant/Carder batch mutation.

Recovered state:

`CLOSED / PASS / INTEGRATED`

Classification:

`HISTORICAL AUTHORITY — EXPLICITLY RECOVERED`

---

## RUN 019 — Sources / Provenance Inspection

Final QA/integration checkpoint:

`e83de9793c26f78834f748b320161a168943d4ed`

Commit:

`feat(library): inspect persisted Sources and Provenance without writes`

Recovered explicit official checkpoint:

```text
RUN 019:
CLOSED / PASS / INTEGRATED

OFFICIAL WORKSPACE CHECKPOINT:
e83de9793c26f78834f748b320161a168943d4ed
```

RUN 019 is read-only inspection of persisted Sources/Provenance and does not introduce an independent write path.

Recovered state:

`CLOSED / PASS / INTEGRATED`

Classification:

`HISTORICAL AUTHORITY — EXPLICITLY RECOVERED`

---

## Final recovered chain

```text
RUN 014  fd13018c...  PASS / INTEGRATED / CLOSED
                         integration reconstructed from downstream baseline

RUN 015  191454d4...  PASS / INTEGRATED / CLOSED
                         integration reconstructed from downstream baseline

RUN 016  163799a6...  PASS / INTEGRATED / CLOSED
                         explicit post-RUN authority

RUN 017  0c94aa79...  PASS / INTEGRATED / CLOSED
                         explicit post-RUN authority

RUN 018  d7f5d567...  PASS / INTEGRATED / CLOSED
                         explicit post-RUN authority

RUN 019  e83de979...  PASS / INTEGRATED / CLOSED
                         explicit official checkpoint
```

## Remaining archival gaps for this tranche

Still desirable to recover/import the original role-owned artifacts where available:

- RUN 014 final External QA report;
- RUN 014 administrative integration report;
- RUN 015 final External QA report;
- RUN 015 administrative integration report;
- original role-owned final QA/integration artifacts for RUN 016–019 if distinct from the recovered roadmap/Scope records.

These are provenance/archive gaps, not current uncertainty about the exact historical integrated checkpoints above, unless later primary evidence contradicts this frozen reconstruction.

Any contradiction must produce a reconciliation artifact; do not silently rewrite this record.
