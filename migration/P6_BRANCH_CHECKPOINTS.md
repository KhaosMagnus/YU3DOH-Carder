---
artifact_id: P6-BRANCH-CHECKPOINTS
artifact_type: migration_inventory
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: b8060a8f1bd2e0f42387f9591749f8018ffebfc2
---

# P6 — Verified Workspace Branch Checkpoints

Source: live GitHub branch refs in `KhaosMagnus/YU3DOH-Carder`.

These are current branch-head facts, not inferred QA verdicts.

| Branch | Current GitHub HEAD |
|---|---|
| `feature/workspace-run-001` | `dce133edb3bb64d72ea54434fb4e40a5bf3c04a3` |
| `feature/workspace-run-002` | `070b5ea002211a3bf26a34f80473201495d0b781` |
| `feature/workspace-run-003` | `017c904c22c7842fa1209e3e39885453dda1e63a` |
| `feature/workspace-run-004` | `81c20eb1477e1a0151b6e590d1e31390d82c6de4` |
| `feature/workspace-run-005` | `94c4fed2c114a8d5b38626b48722237d9ec8263d` |
| `feature/workspace-run-006` | `b484f0d5c620dd4fb57054f261a22aaf6e557f0d` |
| `feature/workspace-run-007` | `45d85b6cfd4a28f1b4f241f540159fac076f3978` |
| `feature/workspace-run-008` | `e54800629e46f8fccd653b0bef637dd71e9b97a3` |
| `feature/workspace-run-009` | `3d1a566ceaabdb1eb9bf3346ba87541f26a66782` |
| `feature/workspace-run-010` | `609126af1b0062ca198bcd32e7d21396bb225549` |
| `feature/workspace-run-011` | `1f4b93ee9a3c322b808e8db3f87076b95d6f8d2e` |
| `feature/workspace-run-012` | `590f11f62476a504164055c47aa918e80666ce2c` |
| `feature/workspace-run-013` | `366fea433d6eccde9b2848dee2f9b53297926a69` |
| `feature/workspace-run-014` | `fd13018c881f63764efb60bc1c88b4eb0a400018` |
| `feature/workspace-run-015` | `191454d44f3273cf2efba254bddd8ba5275a08aa` |
| `feature/workspace-run-016` | `163799a60772da69ecabbae03d8b2966a50d6c46` |
| `feature/workspace-run-017` | `0c94aa7990c227690b5d90e2d73ae892a37930ee` |
| `feature/workspace-run-018` | `d7f5d567856503a42d14543d876eb7d1e0c2b311` |
| `feature/workspace-run-019` | `e83de9793c26f78834f748b320161a168943d4ed` |
| `feature/workspace-run-020` | `318e310f3a7f475de00bc427b6654192d615486d` |
| `feature/workspace-run-021` | `ec838d9ea0626d52e133937fb790150575ab623e` |
| `feature/workspace-run-022` | `4b0aa0d6afdbd07d155844d38b2832ea0acfa201` |
| `feature/workspace-run-023` | `c929a6020760525d5cf6daf695b2f44c1d3cd1ca` |

Current integration/checkpoint refs:

| Branch | Current GitHub HEAD |
|---|---|
| `feature/workspace-v0.1` | `4c9b0228bb47ac074c49a977b48dbf0844c33a94` |
| `fix/workspace-rc-canonical-null-zero` | `4c9b0228bb47ac074c49a977b48dbf0844c33a94` |
| `fix/workspace-rc-normal-subtype-icon` | `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c` |
| `feature/workspace-cr-0001-2-level-rank-domain` | `59fb2924b2240f005fb3e9e6d5afbd8aaca39596` |
| `main` | `54cc3aad246c89a29f2a18be63c539db68cae041` |

## Interpretation rule

A current branch head proves only what GitHub currently points that ref to.

It does NOT automatically prove:
- that this was the exact SHA externally QA-validated at the time;
- that every historical conversation/report used this head;
- that the RUN was integrated;
- that no later branch movement occurred.

Those questions require commit ancestry, historical artifacts and/or explicit QA/integration evidence.
