# DOCUMENT MIGRATION INVENTORY

status: ACTIVE
protocol_version: 1.0
phase: P6 — TARGETED ARCHIVAL RECOVERY

Classification: AUTHORITATIVE, SUPERSEDED, HISTORICAL, SUPPORTING, DUPLICATE, UNKNOWN.

## Rules

1. Do not promote a document because its filename looks final.
2. Prefer exact GitHub/code evidence and explicit owner/QA decisions.
3. Preserve source provenance and exact SHAs.
4. A QA guide or Internal QA report is not an official External QA verdict unless it explicitly has that authority.
5. Frozen historical authority is not rewritten when later refs move.
6. Downstream authorized baselines may establish an accepted/integrated checkpoint without pretending the missing primary QA/integration artifact has been recovered.
7. Correction-cycle evidence must preserve rejected/PARTIAL candidates as historical ancestors rather than silently replacing them.
8. Recovered chat-copy decision text must retain any missing speaker/timestamp provenance limitation.

## Recovered authority records

- `migration/P6_RECOVERED_AUTHORITY_001_008.md`
- `migration/P6_PRIMARY_RECOVERY_RUN_004.md`
- `migration/P6_RECOVERED_AUTHORITY_009_013.md`
- `migration/P6_RECOVERED_AUTHORITY_014_019.md`
- `migration/P6_RECOVERED_AUTHORITY_020_023_RC.md`
- `migration/P6_RECENT_LINEAGE_020_023_RC.md`
- `migration/P6_BRANCH_CHECKPOINTS.md`

## RUN 001–008

- RUN 001 = `dce133edb3bb64d72ea54434fb4e40a5bf3c04a3`; PASS / INTEGRATED / CLOSED checkpoint recovered; primary final QA/integration artifacts pending archival recovery.
- RUN 002 = `070b5ea002211a3bf26a34f80473201495d0b781`; PASS / INTEGRATED / CLOSED checkpoint recovered; schema 1; primary role-owned QA/integration artifacts pending archival recovery.
- RUN 003 = `017c904c22c7842fa1209e3e39885453dda1e63a`; PASS / INTEGRATED / CLOSED checkpoint recovered after confirmed-block correction; primary final QA/integration artifacts pending.
- RUN 004 = `81c20eb1477e1a0151b6e590d1e31390d82c6de4`; PRIMARY decision sequence recovered and promoted: PARTIAL on `fa592117...` → correction handoff → final PASS → direct fast-forward authorization → reported integration. Provenance limitation: source chat copy lacks machine-verifiable speaker/timestamp metadata. See `migration/P6_PRIMARY_RECOVERY_RUN_004.md`.
- RUN 005 = `94c4fed2c114a8d5b38626b48722237d9ec8263d`; PASS / INTEGRATED / CLOSED checkpoint recovered after Managed Asset Ingest correction; primary final QA/integration artifacts pending.
- RUN 006 = `b484f0d5c620dd4fb57054f261a22aaf6e557f0d`; PASS / INTEGRATED / CLOSED checkpoint recovered through RUN 007 authorized baseline; primary final QA/integration artifacts pending.
- RUN 007 = `45d85b6cfd4a28f1b4f241f540159fac076f3978`; External QA PASS explicitly recovered after PARTIAL/correction; integrated checkpoint established; primary admin integration artifact still desirable.
- RUN 008 = `e54800629e46f8fccd653b0bef637dd71e9b97a3`; PARTIAL/correction lineage recovered; final accepted/integrated checkpoint established by RUN 009 authorized baseline; primary final External QA/integration artifacts pending.

## RUN 009–013

- RUN 009 = `3d1a566ceaabdb1eb9bf3346ba87541f26a66782`; PASS / INTEGRATED / CLOSED recovered.
- RUN 010 = `609126af1b0062ca198bcd32e7d21396bb225549`; CLOSED / PASS / INTEGRATED explicitly recovered.
- RUN 011 = `1f4b93ee9a3c322b808e8db3f87076b95d6f8d2e`; integrated checkpoint established; primary final QA artifact pending.
- RUN 012 = `590f11f62476a504164055c47aa918e80666ce2c`; integrated checkpoint established; primary final QA artifact pending.
- RUN 013 = `366fea433d6eccde9b2848dee2f9b53297926a69`; CLOSED / PASS / INTEGRATED explicitly recovered.

## RUN 014–019

- RUN 014 = `fd13018c881f63764efb60bc1c88b4eb0a400018`; PASS / INTEGRATED / CLOSED via downstream authorized baseline; primary final QA/integration artifacts pending.
- RUN 015 = `191454d44f3273cf2efba254bddd8ba5275a08aa`; PASS / INTEGRATED / CLOSED via downstream authorized baseline; primary final QA/integration artifacts pending.
- RUN 016 = `163799a60772da69ecabbae03d8b2966a50d6c46`; CLOSED / PASS / INTEGRATED explicitly recovered.
- RUN 017 = `0c94aa7990c227690b5d90e2d73ae892a37930ee`; CLOSED / PASS / INTEGRATED explicitly recovered.
- RUN 018 = `d7f5d567856503a42d14543d876eb7d1e0c2b311`; CLOSED / PASS / INTEGRATED explicitly recovered.
- RUN 019 = `e83de9793c26f78834f748b320161a168943d4ed`; CLOSED / PASS / INTEGRATED explicitly recovered.

## RUN 020–023 + RC

- RUN 020 final = `318e310f3a7f475de00bc427b6654192d615486d`.
- RUN 021 final = `ec838d9ea0626d52e133937fb790150575ab623e`.
- RUN 022 final = `4b0aa0d6afdbd07d155844d38b2832ea0acfa201`.
- RUN 023 final = `c929a6020760525d5cf6daf695b2f44c1d3cd1ca`.
- post-RUN-023 RC = `4c9b0228bb47ac074c49a977b48dbf0844c33a94`.

## Current P6 coverage

Historical Workspace authority is reconstructed continuously from:

`RUN 001 → RUN 023 → post-RUN-023 RC`

Targeted primary recovery is now improving the provenance class of reconstructed checkpoints without rewriting the frozen reconstruction artifacts.

## Active recovery gaps

Pilot 001 remaining priority:

- RUN 005 primary External QA/integration sequence;
- RUN 008 primary final External QA/integration sequence.

Then continue targeted recovery for other documented provenance gaps.

No bulk transcript import is authorized.
