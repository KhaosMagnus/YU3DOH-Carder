# Q02 B1 — PC-003 Read-Only GitHub Permissions / Isolation Preflight

artifact_id: PP-002-Q02-B1-PC003-READ-ONLY-PREFLIGHT
status: COMPLETE / READ-ONLY CONFIGURATION FACT COLLECTION / IMPLEMENTATION NO-GO
observer: PROJECT_CONTROL / PC-003
repository: KhaosMagnus/YU3DOH-Carder
observed_control_head: 032afa84cc48b4117d19c40d7be77b7edb613099
source_scope: GitHub connector read-only operations and declared connector action schemas
execution_effects: NONE (read-only); separate PC-003 documentation record publication is administrative, not experiment

## Direct source observations

1. mcp__GitHub__get_repo reported repository public, default branch main, authenticated user's permissions admin=true, push=true, maintain=true, pull=true, triage=true; authenticated login KhaosMagnus.
2. GitHub REST GET /repos/KhaosMagnus/YU3DOH-Carder/rulesets?includes_parents=true returned an empty array. This is no observed repository ruleset in the response. It does not establish absence of every inaccessible higher-order control.
3. GET /branches?per_page=100 returned 47 entries; all returned protected=false, explicitly including main, meta/project-control, feature/workspace-v0.1 and ops/pp-002-gate-b-actions, ops/pp-002-gate-b-r2-actions, ops/pp-002-gate-c-actions. GitHub does NOT currently mark these refs protected, even if local documentation calls them protected. Ref-by-ref verification of every external policy or future unseen ref was not established.
4. mcp__GitHub__list_installations returned an installation ID 162412374 for account_login KhaosMagnus, repository_selection=all, and did not expose the exact installation token permission map or acting per-call credential. Never infer app token's actual write permissions from user admin=true alone.
5. GET git/ref/heads/experiment/pp002-q02-prot-001 returned NOT_FOUND; proposed B1 experiment branch is not present. This is an absence observation, NOT authorization to create it.
6. GitHub connector advertises distinct create_file, update_file, create_tree, create_commit, update_ref and create_branch surfaces. update_ref takes optional expected_sha and optional force (default false); the presence of a voluntary CAS-enabled publication helper does not establish host-wide mandatory use of that helper. The documented interface has no advertised universal call interception or per-chat identity separation.
7. No GitHub settings, permissions, repository metadata, ruleset, user/account credential, branch or ref was changed in this preflight. No negative write probe was attempted.

## Analysis and risk

S1 — FAIL TO ESTABLISH: The authenticated account has admin/push, the app installation is all-repositories, and chat role boundaries are not independently verified as separate GitHub principals. The current metadata does not prove exactly which token signs each connector request. Separate isolated *branches* do not imply distinct principals/permissions.

S2 — FAIL TO ESTABLISH: All enumerated refs lack protected marker and rulesets response empty. A mistakenly authorized wrong-target ref update could have material effects, subject to actual actor/token permission. CAS with force=false is a procedural selection, not system-wide verified restricted write policy.

S3 — UNASSIGNED / not executed; exact Q01 validated candidate 328e57035d34f98c4d8d417729e8b12f91894e95 and Q02 accepted design remain frozen historical inputs. New branch baseline, output namespace and exact allowed files await effective authority.

S4-S6 — NOT TESTED; original offline I01-I32, no-secrets controls and independent QA remain proposed.

## Security controls to design

- Explicit credential/principal matrix: Owner/admin, coordinator/documentation publisher, experimental code writer, independent reviewer and emergency break-glass; for each enumerate effective GitHub App installation/identity, granted permissions, allowed repositories, refs, paths, operations and bypass candidates.
- Ruleset design with exact targets, deny direct update/delete/force push for experimental identity, minimum permitted PC continuity and separately controlled exception. Do not create an unsafe broad bypass for every admin or for the same identity used by the experiment; plan failback and independent re-read.
- Public repo hygiene: only allowed synthetic nonsecret fixtures in new experimental history; confirm remote history is permanent and secret removal may be complex.
- Safe negative validation (future separately authorized): disposable ref/repository, no writes against main/meta/ops, authenticated attributable test accounts, expected denied writes, independently observed read-only verification. If safe validation cannot be performed, mark S1/S2 UNVERIFIED and NO-GO.
- Contrast B1 repository-shared privilege with B2 separately permissioned repo and pin which residual privileges remain.

## Official GitHub reference docs read separately

- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository
- https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps

Docs demonstrate available mechanisms and configuration UI, not proof they have been installed here.

## Current disposition

READ-ONLY PREFLIGHT COMPLETE / S1 and S2 UNPROVEN / B1 IMPLEMENTATION NO-GO.
Proceed ONLY with separately routed OFFLINE/READ-ONLY permission architecture design. Do not claim B1 itself unsafe in all possible future configurations; the observed current configuration does not provide the demanded assurance. Do not make GitHub settings changes as a precondition of simply describing the next design.
