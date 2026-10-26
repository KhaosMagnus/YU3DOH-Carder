---
artifact_id: POST-P6-ROADMAP-DISPOSITION
artifact_type: project_control_disposition
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-001
control_parent_sha: 4de94c987e67762cb1652c17088d67355d31d861
source_artifact: scopes/POST_P6_ROADMAP_REVIEW.md
code_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
---

# Project Control Disposition — Post-P6 Roadmap Review

## Decision

Project Control accepts the Scope/Architecture Roadmap Review.

The post-P6 improvement sequence is frozen as:

### Tranche 1

`Focused Editor / Variant UX Completion`

Contents:

- CR-0001.3 / F-03 — Graphical Link Marker selector.
- CR-0001.6 / F-06 — Preferred Variant warning clarity.

Disposition:

`IN_SCOPE / FIRST`

### Tranche 2

`Library Browse Grid / List Modes`

Contents:

- CR-0001.4 / F-04 — Library Grid/List.

Disposition:

`IN_SCOPE / SECOND`

## Sequencing

Tranche 2 follows successful completion and authorized integration of Tranche 1 unless Project Control explicitly revises sequencing based on new evidence.

Release Hardening begins only after every Roadmap-selected tranche has completed its controlled implementation/QA/integration chain.

## Architecture constraints

Expected for both tranches:

- database schema = 8;
- Workspace format = 1;
- migrations = 001–008;
- migration 009 = absent;
- no new persistence unless Scope is reopened;
- no Carder protocol change from these roadmap items.

Any unexpected persistence/schema/domain requirement returns to Scope before implementation.

## Authority boundary

This disposition authorizes:

- tranche sequencing;
- External Design + QA design-contract work for Tranche 1.

This disposition does NOT authorize:

- RUN 024;
- any implementation branch;
- Development work;
- Tranche 2 implementation;
- schema/migration changes;
- main integration.

Implementation authorization remains a later Project Control gate after External Design + QA freezes the Tranche 1 contract.
