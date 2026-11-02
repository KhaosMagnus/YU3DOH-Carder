# Q02 C1 — Second Owner-Forwarded AI Support Reply and GitHub Plugin Identity Receipt

artifact_id: PP-002-Q02-C1-SECOND-AI-SUPPORT-AND-PLUGIN-IDENTITY
status: RECEIVED / SECONDARY SUPPORT GUIDANCE / TOOL METADATA OBSERVED / NO TECHNICAL ATTESTATION
coordinator: PROJECT_CONTROL / PC-003
source_control: a6f52874aaf5d78a8d221cfd9023dbe3816fe652
Owner_approval: control/PP-002_Q02_C1_OWNER_EXTERNAL_EVIDENCE_APPROVAL.md
bounded_receipt_authority: control/PP-002_Q02_C1_SECOND_AI_SUPPORT_REPLY_RECEIPT_AUTHORIZATION.md
source: Owner-pasted AI support message in PC-003 conversation on 2026-11-01
authenticated_support_case_id: UNKNOWN
authenticated_human_provider_signer: UNKNOWN
original_provider_response_event_time: UNKNOWN
original_provider_request_headers_or_receipt: UNAVAILABLE
source_bytes: OWNER-FORWARDED CHAT TEXT, NOT PROVIDER-ATTESTED EXPORT
previous_source: validations/PP-002/Q02-C1/C1_AI_SUPPORT_RESPONSE_SOURCE_RECEIPT.md
next_reply_draft: validations/PP-002/Q02-C1/C1_GITHUB_HYBRID_PLUGIN_SUPPORT_FOLLOWUP.md

## Owner-forwarded source claims (secondary, not authenticated provider fact)

1. For ordinary ChatGPT chats, AI-assisted support states no documented *per-conversation* mechanism denying a GitHub connection already available under the user's role/workspace; described controls are connected account, repository selection and workspace/role action availability. Linked https://help.openai.com/articles/11145903 and https://help.openai.com/articles/11487775.
2. For a future *external/offline* executor, isolation should be technical: no reused third-party credentials, restricted network and hosts, distinct environment and guarded credentials/broker. Linked https://developers.openai.com/api/docs/guides/agents-api/environments/security/. This security guidance is for the Agents API environment surface, not a demonstration of an already existing Q02 runner.
3. Generic ChatGPT GitHub app is described as read-only and code pushes as a Codex capability. The support message proposes that observed ChatGPT GitHub writes may arise from a *different app, custom MCP, or other plugin*, and asks for the exact tool identity. Linked https://help.openai.com/articles/11145903, https://help.openai.com/articles/11509118, https://help.openai.com/articles/20001495, https://help.openai.com/articles/12584461. The message is not proof that this account has a custom MCP server or managed-workspace RBAC.

## Independent observation of THIS connected tool in PC-003

Read-only Plugin Management search for "GitHub" reports a single installed and ENABLED plugin:
- public display name: GitHub
- canonical plugin identifier: `plugin_connector_1p_1a69035c238881919c4190932b2df699`
- description: "Inspect repositories, triage pull requests and issues, debug CI, and publish changes through a hybrid GitHub connector and CLI workflow."
- internal exposed tool namespace: `mcp__GitHub__`
- action examples: `mcp__GitHub__create_tree`, `mcp__GitHub__create_commit`, `mcp__GitHub__update_ref`. These are tool capability descriptions and have already produced authorized `meta/project-control` publications; this receipt performs NO write-permission probe.
- App permission read: GitHub app-specific `Allow all actions`, global default `Allow low-risk actions`. This controls when ChatGPT prompts for action approval, not GitHub OAuth/App scopes or per-chat route denial.

The namespace `mcp__GitHub__` alone does **not** identify this as a user-created custom MCP app; the available plugin metadata calls it GitHub hybrid connector. We do not have an authenticated backend registration ID, issuer/token subset, or complete connector architecture. The plugin ID is not a GitHub App registration ID, and the historical installation ID 162412374 is not an App registration or effective token-rights proof.

## Public documentation checked

- https://help.openai.com/articles/11145903 : current GitHub standard ChatGPT FAQ expressly states its app can read repository information and redirects direct pushing to Codex. The installed hybrid GitHub connector's available write actions are empirically distinct from that generic description. Do not resolve this discrepancy by assumption.
- https://help.openai.com/articles/11487775 : connected apps can offer supported read AND write actions; availability varies by workspace and product surface.
- https://help.openai.com/articles/11509118 : controls for managed Business/Enterprise/Edu workspaces and role-level restrictions on eligible Enterprise/Edu; these do not constitute proof a personal ChatGPT conversation has per-chat ACL.
- https://help.openai.com/articles/20001495 : action-approval preferences do not grant GitHub provider permissions or override workspace policy.
- https://help.openai.com/articles/12584461 : custom MCP servers are a separate supported integration category. It does not prove this hybrid GitHub plugin is user-defined MCP.
- https://developers.openai.com/api/docs/guides/agents-api/environments/security/ : actual Agents API environment security guidance recommends sandbox isolation, network allowlisting and keeping secrets outside the executor. No actual Q02 environment configuration is shown here.

## Consequence for C1 / mandatory security gates

The secondary answer corroborates the safe engineering assumption that role labels and conversation boundaries alone cannot be used for security segregation. It does **not** independently attest an absence of every possible platform-level per-chat control, nor does it demonstrate our actual signer, eligible workspace RBAC, restricted GitHub token or offline executor. No current target-specific host/runtime proof, App registration, broker or provider-signed connection ACL was delivered.

ID-04 remains PARTIAL (public policy guidance); ID-01,03,07,08 remain UNKNOWN; ID-02,05,06 PARTIAL. S1 and S2 are NOT INDEPENDENTLY PROVEN; B1/B2 placement and Q02-PROT-001 remain NO-GO. C1 does NOT install, revoke, reconnect, switch or test GitHub identities.

Next high-impact action: identify to support the exact GitHub hybrid plugin and ask whether it has supported distinct admin/runtime permission surfaces or whether an external least-privileged B2 runner is required. If product-specific security attestation is not obtainable, do not continue indefinite meta-documentation; seek separate Owner-scoped C2 design or defer.
