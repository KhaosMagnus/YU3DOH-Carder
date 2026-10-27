# Owner Authorization — CR-0001.4 / F-04 Design + QA

status: FROZEN
protocol_version: 1.0

source:
OWNER

captured_by:
PROJECT_CONTROL / PC-002

request:
Proceed with the next product-preparation step and prepare what is needed for CR-0001.4 / F-04.

authorized_phase:
DESIGN + QA CONTRACT PREPARATION ONLY

target_feature:
CR-0001.4 / F-04 — Library Grid/List

code_baseline:
feature/workspace-v0.1 @ e07140d5a9555a17b7b2306a45625c14adfafc8e

canonical_request_ledger:
requests/CR-0001-v18.md

frozen_scope:
scopes/POST_P6_ROADMAP_REVIEW.md — CR-0001.4 / F-04 section

Authorized:
- assign a new DESIGN_QA instance;
- inspect the exact current code baseline;
- freeze an implementable/testable F-04 contract;
- define automated and browser evidence requirements;
- return the contract to Project Control.

Not authorized:
- implementation;
- RUN creation;
- implementation branch creation;
- product code modification;
- schema or migration change;
- CR-0002 implementation;
- product ref movement;
- main integration.
