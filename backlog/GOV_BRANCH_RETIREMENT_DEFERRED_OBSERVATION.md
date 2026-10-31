# GOV-BRANCH-001 — Deferred GitHub Branch Retirement and Checkpoint Preservation

artifact_id: GOV-BRANCH-001
artifact_type: owner_observation / deferred_governance_backlog
status: DEFERRED / IMPORTANT / NOT IN SCOPE / NO DELETE AUTHORITY
coordinator: PROJECT_CONTROL / PC-003
Owner_direction: Log existing branch proliferation for later cleanup; do not introduce this as a variable while Q02 security/evidence isolation work is active.
source_control_sha: c844fdc730afe8941612b7695f618cfe6bc1ee2e
reference_repo: KhaosMagnus/YU3DOH-Carder
inventory_observation: 47 GitHub branches returned by GET /branches?per_page=100 under current read-only observation
revisit_condition: AFTER Option I identity evidence and Q02 B1/B2 placement decision, at a separately approved branch-retention audit window; account for any ruleset/cleanup constraints before actual security configuration or retire work.
authorization_for_branch_mutation: NONE

## Owner intent — checkpoint preservation is mandatory

The Owner identifies the **Serial/Carder** and **Workspace** integration checkpoints as essential, recoverable references and explicitly does not want them removed or destroyed. Currently observed branch names:
- feature/serial-v0.1 — SERIAL / CARDER CHECKPOINT — PRESERVE / NOT DELETE
- feature/workspace-v0.1 — WORKSPACE CHECKPOINT — PRESERVE / NOT DELETE
- main — CANONICAL PRODUCT BASELINE — PRESERVE / NOT DELETE under this observation
- meta/project-control — CANONICAL PROJECT CONTROL AND HISTORY — PRESERVE / NOT DELETE under this observation

These exact branch names were observed in a read-only inventory; no assertion is made here that the Serial checkpoint's tree has been newly validated, that other checkpoints do not exist, or that any arbitrary branch is expendable. The Owner wants **checkpoint functionality and recoverability**, not merely a remembered SHA.

The Owner suspects old work branches (workspace RUN branches, possibly serial RUN branches if any) are unnecessary noise. This is a hypothesis for the later audit, NOT a classification as delete-safe. Current list contains feature/workspace-run-001 through feature/workspace-run-026; no feature/serial-run-* branch was present in the 47 returned entries. Numerous ops/* and recovery/* refs also exist, and may be needed for historical provenance or disaster recovery.

## Required future audit — NOT STARTED

Under **new exact Owner authorization**:
1. Re-read full current branch inventory, protected/security rules, open PRs and pending work with fresh timestamps. Do not rely on 47 remaining constant.
2. Classify per exact ref as CHECKPOINT/ACTIVE/BLOCKED-RETENTION/CANDIDATE-FOR-RETIREMENT/UNKNOWN based on evidence; do not classify by naming pattern alone.
3. For candidate refs verify merge/ancestry of unique commits, unmerged work, exact run QA/implementation reports, external workflow dependencies, original control/ops proofs and named recovery/rollback procedure; preserve immutable checkpoint tree and appropriate independent access.
4. Distinguish **deleting a branch ref** from deleting commit objects. Historical SHAs may be retained transiently or become unreachable; cannot claim recoverability merely from knowing a SHA. Require a durable separately approved pin/tag/archive/restore proof wherever needed.
5. Demonstrate the two priority checkpoint branches can be reconstructed and built/tested at exact SHAs and remain directly accessible; compare their QA/integration state without changing product.
6. Produce a candidate-by-candidate retention matrix and stop on disputed ancestry, references, failed preservation or uncertainties.
7. Obtain explicit Owner APPROVAL of individual retirements and method, including applicable future GitHub rules/permissions and audit log. Only then conduct any GitHub branch deletion under a separate controlled route with post-verification. Never delete historical operational evidence merely to make the branch list smaller.

## Deferment rationale and relationship to F1

Avoid changing branch sets while security evidence collection/placement is ongoing. Any future N1 policy currently proposes broad deletion/force restrictions and work-catalog freezes; branch-retirement impacts M01 and must be accounted for when that configuration is separately authorized. Option I has no branch-cleanup deliverable.

No branch deletion, deletion simulation, merge, tag, policy exception, new ref or ref movement is authorized or executed now. This observation is not a request to reduce from 47 to any target count. It is important to revisit, not urgent to mutate.

Close only by future separate audit/Owner disposition with checkpoint preservation and recovery evidence. Q02-PROT-001 remains NO-GO.
