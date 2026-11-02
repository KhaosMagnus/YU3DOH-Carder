# Q02 C1 — Third Owner-forwarded AI support reply and independent public-document review

artifact_id: PP-002-Q02-C1-THIRD-AI-SUPPORT-SOURCE-RECEIPT
status: SECONDARY EVIDENCE / PUBLIC DOCUMENTS CHECKED / NO TRUSTED PROVIDER ATTESTATION
coordinator: PROJECT_CONTROL / PC-003
input_CONTROL: e90e310299ee56f156f44e9ce64df51d20f2ea4f
Owner_C1_authorization: control/PP-002_Q02_C1_OWNER_EXTERNAL_EVIDENCE_APPROVAL.md
frozen_C1_scope: control/PP-002_Q02_C1_EXTERNAL_EVIDENCE_CAPTURE_SCOPE.md
preceding_support_receipt: validations/PP-002/Q02-C1/C1_SECOND_AI_SUPPORT_REPLY_AND_GITHUB_PLUGIN_IDENTITY_RECEIPT.md
current_source: Owner forwarded a third response attributed to AI-assisted support into this PC-003 conversation
support_ticket_id: UNKNOWN
provider_human_issuer_or_signed_claim: NOT PROVIDED
provider_event_time_and_wire_headers: UNKNOWN
source_representation: OWNER-FORWARDED TEXT / NOT A PROVIDER-SIGNED ORIGINAL
source_security: Nonsecret source summary; no bearer, cookie, raw session or token requested
coordinator_decision: runs/PP-002_Q02_C1_CONVERSATION_ISOLATION_DECISION_DISPOSITION.md
next_Owner_request: control/PP-002_Q02_C2_EXTERNAL_ISOLATION_DESIGN_OWNER_DECISION_REQUEST.md

## Claims in the third support response

1. No **documented configurable per-conversation access denial** for a GitHub app already accessible to the same normal ChatGPT user/role/workspace. Described controls are workspace/role/app access, enabled read/write actions, approval preferences and provider-account/repository access.
2. A separately administered executor/role/workspace **without that connected GitHub app or its credentials** and with verified network/host boundary is the documented security direction for strict separation; it is not created or verified by this reply.
3. The generic ChatGPT GitHub app is described publicly as read-only, whereas this project's GitHub plugin has actually written via create_tree/create_commit/update_ref. Support cannot identify from plugin ID whether our installed hybrid integration is an official variant or custom MCP; do not conclude it is a user-built MCP solely from namespace.
4. Support's explicit recommendation: if workspace/role segregation cannot be established for the present account, use an external isolated executor, not a second conversation.

This is **AI-assisted guidance forwarded by Owner**. There is no signed implementation guarantee for this account/plugin, no verifiable issuance event, no app grant listing, no exact runtime policy and no attestation of technical inability to obtain every alternate writer route.

## Independently read public documents during coordinator review

- https://help.openai.com/articles/11509118 — admin app controls separate **Role access** (who), **Actions** (which read/write operations), **Permissions** (approval prompts). Enterprise/Edu role access depends on eligible workspace; not evidence our current account has it. Some apps do not support per-action switches; check actual eligible product.
- https://help.openai.com/articles/20001495 — `Allow all actions` suppresses confirmation requests for available actions, carries elevated risk; neither grants provider permissions nor overrides workspace policies. Personal-account controls vary.
- https://help.openai.com/articles/11145903 — generic standard GitHub connection FAQ describes repository search/read and says code push via Codex. Our installed GitHub hybrid plugin has independently demonstrated authorized write publications. This remains a **product/connector documentation mismatch**, not proof of user-created MCP or an inaccurate publication record.
- https://help.openai.com/articles/11750701 — RBAC is a workspace/role product feature with plan eligibility; it is not an attestation of a separately enforced boundary between two ordinary conversations belonging to the same actor.

The public documentation does not furnish a per-conversation GitHub tool denial configured for these normal chats. **Absence of such a documented control is not a universal proof of its impossibility in every product or internal system**. No different platform service/role/workspace was provisioned or tested. Source claims and independently checked public mechanisms must remain separate.

## Exact installed plugin evidence from preceding read

GitHub installed/enabled, `plugin_connector_1p_1a69035c238881919c4190932b2df699`, described as hybrid connector/CLI with publishing, namespace `mcp__GitHub__`, action confirmations `Allow all actions`. No App registration ID, real per-call signer, complete authorization subset or context ACL is established. A tool namespace is not a provider authentication proof.

## Gate effect

ID-04 remains PARTIAL (policy guidance / no current-context ACL attestation). ID-01,ID-03,ID-07,ID-08 UNKNOWN; ID-02,ID-05,ID-06 PARTIAL. S1/S2 NOT INDEPENDENTLY PROVEN. B1/B2 implementation and Q02-PROT-001 remain NO-GO. Neither the current plugin usage policy nor a different chat role proves containment; code publication by PC-003 does not qualify E/B.

Next rational step: request separate Owner authorization for **C2 design only** around an independently isolated offline executor, safe synthetic inputs and a distinct least-privileged publisher; do not demand another AI-assisted paraphrase or repeat public GitHub metadata. C1 external issuer/runtime evidence may still be provided later, but is not falsely marked obtained. No new QA/security gate acceptance is asserted.
