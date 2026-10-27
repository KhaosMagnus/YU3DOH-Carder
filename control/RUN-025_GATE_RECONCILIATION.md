# RUN 025 — Validation Gate Reconciliation

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

affected_run:
RUN 025

reason:
DQA-004 reported two nonexistent root "yarn test" commands in its execution intake while the frozen F-04 Design + QA contract defines a different authoritative gate.

authoritative_source:
handoffs/CR-0001_4_LIBRARY_GRID_LIST_IMPLEMENTATION_HANDOFF.md

authoritative_six_command_gate:
1. yarn compile
2. yarn build
3. yarn test:sc
4. yarn test:library
5. yarn --cwd workspace-server compile
6. yarn --cwd workspace-server test

There is no required root "yarn test" command for RUN 025.

The two root "yarn test" entries mentioned by DQA-004 are treated as a transfer/intake text inconsistency and are NOT acceptance requirements.

This reconciliation does not relax or amend the frozen contract. It restores the exact command set already frozen by DQA-003.

Required for later evidence:
All six authoritative commands above must execute against the exact candidate SHA and exit 0 on the validation substrate.

Equivalent direct Node invocations are useful diagnostic evidence but do not replace the six literal authoritative command results.

No candidate mutation is authorized by this reconciliation.
