# Q02 Option I — PC-003 Initial Nonsecret GitHub Snapshot

artifact_id: PP-002-Q02-I-PC003-INITIAL-SNAPSHOT
status: READ-ONLY EVIDENCE / NOT AN IDENTITY OR SECURITY ATTESTATION
control_input_revision: c844fdc730afe8941612b7695f618cfe6bc1ee2e
repository: KhaosMagnus/YU3DOH-Carder
reference_source: GitHub repository/app connector and read-only REST response
disposition: S1/S2 NOT PROVEN

## Observed in this intake

- meta/project-control HEAD c844fdc730afe8941612b7695f618cfe6bc1ee2e at PC-003 initial check.
- Repository public; default branch main; current authenticated user's returned repo permissions admin=true, maintain=true, push=true, pull=true, triage=true. These fields do not identify effective token/issuer behind every call.
- GET /branches?per_page=100 returned 47 branch entries, none protected=true. The list includes feature/serial-v0.1, feature/workspace-v0.1, main, meta/project-control, feature/workspace-run-001..026 and operational ref branches; this is an observed branch inventory, NOT a delete-candidate determination.
- GET /rulesets?includes_parents=true returned [] from the available read path. Treat other unavailable effective rules and external enforcement as UNKNOWN unless independently attested.
- Previous F1/QA snapshots reported GitHub installation 162412374 with repository_selection=all, but did not expose signing principal per tool call, exact App registration ID, complete effective installation-token rights or per-chat enforced tool-access isolation. No new rights attestation is claimed.
- Existing independent F1 report at validations/PP-002/Q02-F1/DQA-008_INDEPENDENT_DESIGN_QA_REPORT.md @ blob c5c78b74d354ba14c5dfa364a07bc3cdcd751f98 returned paper PASS ONLY, M01/M02 MEDIUM, L01 LOW.
- The accepted source contract at handoffs/PP-002_Q02_F1_FEASIBILITY_AND_CONFIGURATION_CONTRACT.md @ blob 96b23062330006f59790883e87df4c095b37c5b2 is uninstalled.
- No settings, identity, token, policy, branch or code modifications made to collect this snapshot.

Future independent observer must re-read actual metadata and distinguish old observations from current results and local-clock/invocation versus GitHub event time. This snapshot does not guarantee which GitHub identity is used in another chat.

Security decision still NO-GO for B1/B2 prototype implementation pending independently proven S1/S2 and subsequent S3–S6 phase gates.
