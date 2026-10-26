---
artifact_id: OWNER-DIRECTION-POST-P6-SEQUENCE
artifact_type: owner_direction
status: FROZEN
protocol_version: "1.0"
source_role: OWNER
target_role: PROJECT_CONTROL
control_parent_sha: 8193d00b1da0e48219c7915b8d5b2d232c1c9713
---

# Owner Direction — Post-P6 sequencing

The Owner explicitly selects the post-P6 order:

```text
3. ROADMAP REVIEW
        ↓
2. RELEASE HARDENING
        ↓
1. RELEASE / MAIN INTEGRATION
```

with an explicit allowed loop:

```text
ROADMAP REVIEW
      ↕
RELEASE HARDENING
```

as many times as materially necessary before release/main integration.

## Interpretation

### Stage 3 — Roadmap Review

First determine what pending improvements, deferred requests and UX/product refinements should be included before release.

This stage does not authorize code changes by itself.

If Roadmap Review selects implementable work, the normal product-control execution chain applies before hardening:

```text
Scope / Architecture
        ↓
Design + QA contract
        ↓
Development
        ↓
External QA
        ↓
authorized integration to feature/workspace-v0.1
```

RUN numbering and implementation are separate Project Control authorizations.

### Stage 2 — Release Hardening

Hardening evaluates the resulting exact `feature/workspace-v0.1` baseline for release readiness.

Hardening may return to Roadmap Review when findings are not merely bounded defects but imply:

- product/UX scope adjustment;
- additional improvement prioritization;
- architectural/domain decision;
- new work better handled as a planned tranche than as a narrow correction.

Bounded defects found in hardening may follow a correction loop without forcing a full roadmap cycle when Scope/Design + QA classify them as implementation corrections.

### Stage 1 — Release / main integration

Only after the Roadmap↔Hardening cycle reaches a release-ready disposition may Project Control present a separate Owner decision for integration/release toward `main`.

No main integration is authorized by this sequencing decision.

## Current pending items known to Project Control

Canonical CR ledger:

`requests/CR-0001-v15.md`

Still pending/not completed:

- CR-0001.3 / F-03 — graphical Link Marker selector — DEFERRED;
- CR-0001.4 / F-04 — Library Grid/List — DEFERRED;
- CR-0001.6 / F-06 — Preferred Variant warning clarity — ACKNOWLEDGED UX backlog.

Roadmap Review must also identify any additional evidence-backed pending improvements in current Project Control records without inventing new requirements or silently reopening rejected/historical items.

Explicitly closed/non-open items must remain closed unless new evidence or Owner direction changes them:

- CR-0001.7 / F-07 — REJECTED / WITHDRAWN;
- CR-0001.8 / F-08 — VALIDATED / HISTORICAL;
- CR-0001.9 / F-09 — IMPLEMENTED.

Integrated corrections remain completed:

- CR-0001.1 / F-01;
- CR-0001.2 / F-02;
- CR-0001.5 / F-05.

## Guards

This direction does NOT authorize:

- RUN 024;
- any implementation branch;
- code modification;
- schema/migration change;
- main integration;
- reactivation of every deferred item by default.

Roadmap Review decides proposed scope and priority first.
