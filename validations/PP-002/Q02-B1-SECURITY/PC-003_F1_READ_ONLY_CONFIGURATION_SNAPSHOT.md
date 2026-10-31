# Q02 F1 — PC-003 Nonsecret GitHub Configuration Snapshot

artifact_id: PP-002-Q02-F1-READ-ONLY-CONFIGURATION-SNAPSHOT
status: READ-ONLY SNAPSHOT / NOT CREDENTIAL OR ENFORCEMENT ATTESTATION
observer: PROJECT_CONTROL / PC-003
repository: KhaosMagnus/YU3DOH-Carder
control_observed: a3d0dcd469c18896c16c01ad79c324df4995a0ce
purpose: input evidence for F1 contract preparation

## Direct read-only tool observations

- GitHub control ref meta/project-control resolved to a3d0dcd469c18896c16c01ad79c324df4995a0ce on this preflight.
- get_repo reports repository visibility PUBLIC; default branch main; authenticated-user repository permissions admin=true, push=true, maintain=true, pull=true, triage=true.
- get /rulesets?includes_parents=true returned [].
- GET /branches?per_page=100 returned 47 refs and protected=false for every returned entry, including main, meta/project-control and historical ops. This result is an inventory of returned refs, not a categorical negative for every possible inherited/unavailable security mechanism.
- list_installations returned installation 162412374, account_login=KhaosMagnus, repository_selection=all; **did not expose** a complete installation permission map, secret-free individual API-request signer proof, or per-conversation identity isolation.
- Exact Q02 candidate branch experiment/pp002-q02-prot-001 has not been created as of the latest available absence check; every future branch-create stage must independently recheck.
- Tool metadata exposes update_ref with optional expected_sha, optional force and direct file/commit write paths; the use of expected-head CAS by coordinator is currently procedural, not verified globally mandatory.
- The F1 decision does not request nor use any credential inspection, permission change or negative authenticated write test.

## Inference and constraints

S1 REAL ISOLATION: NOT PROVEN. The shared ChatGPT-connected GitHub capability cannot currently be asserted to be a least-privilege experimental identity.
S2 SERVER-SIDE REF RULES: NOT PROVEN. Empty rulesets and unprotected branch markers provide no affirmative effective barrier.
S3–S6: scoped/proposed or unexecuted. Their eventual acceptance has separate phase requirements.

The design-only assignee must distinguish account-owner permissions, GitHub App registration, installation selection, installation token, user-authorized token, per-operation signed principal, tools available inside a host session, and potential alternative credentials. Do not equate one with another. No secrets or private keys shall be collected or retained.

Historical Q01 exact validated source revision: 328e57035d34f98c4d8d417729e8b12f91894e95.
Frozen B1 design blob: d89194237b128b76379533412baec5a56f754b20.
S1/S2 remain unproven; Q02-PROT-001 remains NO-GO.
