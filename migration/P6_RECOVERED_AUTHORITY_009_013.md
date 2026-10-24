---
artifact_id: P6-RECOVERED-AUTHORITY-009-013
artifact_type: migration_inventory
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: 888b751513bed4700e4a35457289c86df33b153f
---

# P6 — Recovered historical authority: RUN 009–013

## Method

This record combines:
- live GitHub branch ancestry/current refs;
- retained Development reports;
- downstream authorized baselines;
- later Scope/roadmap records.

It distinguishes direct closure evidence from reconstructed closure/integration state.

## RUN 009 — Workspace → Carder Read Bridge + Open in Carder

Final historical branch/integration checkpoint:

`3d1a566ceaabdb1eb9bf3346ba87541f26a66782`

Verified ancestry:
RUN 008 `e54800629...` → RUN 009 final branch head, ahead 18 / behind 0.

Recovered state:
`PASS / INTEGRATED / CLOSED`

Evidence basis:
- RUN 009 underwent multiple External QA correction cycles;
- later RUN 010 started from `feature/workspace-v0.1 @ 3d1a566...`;
- the RUN 009 branch currently remains at the same checkpoint;
- retained project integration records identify the same SHA as the integrated RUN 009 checkpoint.

Primary original final External QA artifact remains an archival target.

Classification:
`HISTORICAL AUTHORITY — RECOVERED / PRIMARY FINAL QA ARTIFACT NOT YET IMPORTED`

## RUN 010 — Workspace Backup & Recovery Completion

Final QA/integration checkpoint:

`609126af1b0062ca198bcd32e7d21396bb225549`

Verified ancestry:
RUN 009 `3d1a566...` → RUN 010, ahead 2 / behind 0.

Recovered closure evidence is strong:
the RUN 011 implementation authority explicitly records RUN 010 as:

`CLOSED / PASS / INTEGRATED`

and RUN 011 begins from:
`feature/workspace-v0.1 @ 609126af...`

Classification:
`HISTORICAL AUTHORITY — RECOVERED`

## RUN 011 — Asset Mutation & Resolution Service Foundation

Final branch checkpoint:

`1f4b93ee9a3c322b808e8db3f87076b95d6f8d2e`

Verified ancestry:
RUN 010 `609126af...` → RUN 011 final checkpoint, ahead 2 / behind 0.

Retained Development correction report:
- exact final correction SHA = `1f4b93ee...`;
- status at Development publication = READY FOR EXTERNAL QA;
- integration had not yet happened at that report time.

Downstream integration evidence:
RUN 012 subsequently starts from:
`feature/workspace-v0.1 @ 1f4b93ee...`

Therefore integration of this exact checkpoint is established before RUN 012 authorization.

Recovered state:
- exact integrated checkpoint: ESTABLISHED
- subsequent RUN authorization from that checkpoint: ESTABLISHED
- original primary final External QA PASS artifact: NOT YET IMPORTED

Project Control does not substitute the Development report for the missing primary QA artifact.

Classification:
`HISTORICAL AUTHORITY — INTEGRATION CHECKPOINT RECOVERED / PRIMARY QA ARTIFACT PENDING ARCHIVAL RECOVERY`

## RUN 012 — Library Asset Mutation & Resolution UI / Visual Closure

Final branch checkpoint:

`590f11f62476a504164055c47aa918e80666ce2c`

Verified ancestry:
RUN 011 `1f4b93ee...` → RUN 012 final checkpoint, ahead 2 / behind 0.

Retained correction report:
- exact final branch SHA = `590f11f6...`;
- Development status at publication = delivery to External Design + QA;
- integration remained unchanged at that report time.

Downstream evidence:
RUN 013 subsequently starts from the exact RUN 012 checkpoint and the current linear Git ancestry preserves it.

Therefore integration of `590f11f6...` before RUN 013 is established.

Recovered state:
- exact integrated checkpoint: ESTABLISHED
- subsequent RUN authorization from that checkpoint: ESTABLISHED
- original primary final External QA PASS artifact: NOT YET IMPORTED

Classification:
`HISTORICAL AUTHORITY — INTEGRATION CHECKPOINT RECOVERED / PRIMARY QA ARTIFACT PENDING ARCHIVAL RECOVERY`

## RUN 013 — Variant Lifecycle Completion

Final checkpoint:

`366fea433d6eccde9b2848dee2f9b53297926a69`

Verified ancestry:
RUN 012 `590f11f6...` → RUN 013, ahead 1 / behind 0.

Later roadmap/Scope records explicitly identify:
- official Workspace checkpoint = `366fea43...`;
- RUN 013 = `CLOSED / PASS / INTEGRATED`;
- `feature/workspace-v0.1` and `feature/workspace-run-013` at the same SHA at closure.

Classification:
`HISTORICAL AUTHORITY — RECOVERED`

## Recovered integration chain

```text
RUN 008
e5480062...
   ↓
RUN 009
3d1a566c...  PASS / INTEGRATED / CLOSED — recovered
   ↓
RUN 010
609126af...  CLOSED / PASS / INTEGRATED — explicit downstream authority
   ↓
RUN 011
1f4b93ee...  integrated checkpoint established; primary final QA artifact pending
   ↓
RUN 012
590f11f6...  integrated checkpoint established; primary final QA artifact pending
   ↓
RUN 013
366fea43...  CLOSED / PASS / INTEGRATED — explicit later roadmap authority
```

## Remaining archival gaps

P6 should still recover, if available:
- RUN 009 final role-owned External QA report;
- RUN 009 integration report;
- RUN 010 role-owned QA/integration report;
- RUN 011 final External QA report + administrative integration record;
- RUN 012 final External QA report + administrative integration record;
- original RUN 013 final QA/integration artifacts.

These are archival/provenance gaps. They do not alter the exact recovered integration checkpoints unless contradictory primary evidence appears.
