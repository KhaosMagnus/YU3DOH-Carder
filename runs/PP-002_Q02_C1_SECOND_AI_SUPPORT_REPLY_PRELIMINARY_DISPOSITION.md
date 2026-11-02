# Q02 C1 — Second AI Support Reply: Preliminary Evidence Disposition

artifact_id: PP-002-Q02-C1-SECOND-SUPPORT-PRELIMINARY-DISPOSITION
status: SECONDARY SUPPORT GUIDANCE INTAKE / PRODUCT PLUGIN IDENTIFIED / NO S1-S2 PROOF
coordinator: PROJECT_CONTROL / PC-003
source_control: a6f52874aaf5d78a8d221cfd9023dbe3816fe652
bounded_authorization: control/PP-002_Q02_C1_SECOND_AI_SUPPORT_REPLY_RECEIPT_AUTHORIZATION.md
owner_forwarded_source: validations/PP-002/Q02-C1/C1_SECOND_AI_SUPPORT_REPLY_AND_GITHUB_PLUGIN_IDENTITY_RECEIPT.md
unsent_support_followup: validations/PP-002/Q02-C1/C1_GITHUB_HYBRID_PLUGIN_SUPPORT_FOLLOWUP.md

A second AI-assisted support reply supplies more actionable architecture guidance: ordinary ChatGPT conversations should not be trusted as enforced per-chat GitHub privilege partitions; a separate executor must be isolated by environment/credentials/network. Public documentation agrees in scope, but the prior claim that all GitHub-in-ChatGPT use is read-only requires product-surface differentiation.

PC-003 independently discovered an INSTALLED/ENABLED GitHub plugin, identifier `plugin_connector_1p_1a69035c238881919c4190932b2df699`, described as hybrid GitHub connector + CLI workflow that can publish changes; actual authorized `create_tree/create_commit/update_ref` control publications confirm writes. No source identifies this installed plugin as a user-created custom MCP, and no real App registration ID or signing principal was attested. The generic GitHub help article says standard GitHub app reads only, a distinct product capability description to be clarified rather than silently rejected or applied to our observed connector.

The support response is owner-forwarded AI guidance without provider-signed capability assurance. The plugin search is independently observed metadata about an installed integration and does not prove whether the experimental context can select it, what credentials sign writes, or what restrictions are enforced across chats/workspaces/runners. No S1/S2 upgrade.

C1 remains evidence-only and pending authoritative platform/issuer/runtime statements. If the named plugin cannot provide the necessary independently verifiable isolation, recommend Owner-scoped design of external isolated B2 executor and least-privileged publisher instead of endless support-loop research. B2 NOT SELECTED, no repository/identity/settings changes or prototype permission. GOV-BRANCH-001 IMPORTANT/DEFERRED; Serial and Workspace checkpoint branches untouched. Q01 offline PASS, Q02 accepted, F1 paper PASS, Option I evidence-quality PASS, Gate C/final PP-002 REVISE, P01 UNCERTAIN, P02 UNKNOWN; protocols frozen.
