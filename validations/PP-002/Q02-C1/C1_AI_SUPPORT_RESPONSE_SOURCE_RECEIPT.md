# PP-002 Q02 C1 — Owner-Forwarded AI Support Response Evidence Receipt

artifact_id: PP-002-Q02-C1-AI-SUPPORT-SOURCE-RECEIPT
source_status: SECONDARY / OWNER-FORWARDED / UNAUTHENTICATED PROVIDER-ATTESTATION / PARTIALLY DOCUMENTED GUIDANCE
intake_role: PROJECT_CONTROL / PC-003
source_control_input: a42235fa8e3e7f3a7696116dc00d9ca991abe635
Owner_C1_approval: control/PP-002_Q02_C1_OWNER_EXTERNAL_EVIDENCE_APPROVAL.md
bounded_receipt_authorization: control/PP-002_Q02_C1_AI_SUPPORT_REPLY_RECEIPT_AUTHORIZATION.md
source_channel: Owner pasted text into PC-003 conversation, representing response as "Soy soporte asistido por IA."
original_provider_request_id: UNKNOWN
original_support_ticket: UNKNOWN
original_provider_actor_identity: UNKNOWN
original_provider_event_time: UNKNOWN
original_response_raw_bytes: NOT AVAILABLE AS AN AUTHENTICATED PROVIDER EXPORT
source_transmission: Owner-forwarded text only; public links independently opened by PC-003
followup_request: validations/PP-002/Q02-C1/C1_PLATFORM_SURFACE_CLARIFICATION_REQUEST.md
disposition: runs/PP-002_Q02_C1_AI_SUPPORT_PRELIMINARY_EVIDENCE_DISPOSITION.md

## Exact claims supplied by Owner — paraphrase of unverified source

The pasted reply says current published ChatGPT documentation does not expose a verifiable control **per conversation/context** preventing an experimental executor from selecting an already-connected privileged GitHub identity. It instead points to account-connected GitHub repository authorization, managed-workspace or role-based app access, and available app action policies. It offers stricter separation through workspace/role app disablement and independent narrowly authorized GitHub account/connections, rather than relying on context/restart/retry. It requests identification of whether the executor is standard ChatGPT, agent/deep research, or Work/Codex, since each product surface has different controls.

The above is the user's reported AI support text, NOT a transcript fetched from an authenticated support backend or a human OpenAI security attestation. No representative name, signed assurance, support case ID, product-specific account plan or per-call signer trace was supplied.

## Public documentation verification by PC-003

- https://help.openai.com/articles/11145903 : the GitHub connection is authorized to selected repositories, varies by product surface/plan/workspace, and settings allow repository access management. The general article describes ChatGPT's standard GitHub integration as **read-only** and directs code pushes to Codex. This generic description does not by itself enumerate every available GitHub plugin action in this particular runtime.
- https://help.openai.com/articles/20001495 : app permission selectors govern **approval prompts for available actions**; they do not grant external GitHub provider permissions, create app connections, override workspace policies or enforce per-chat credential isolation. `Allow all actions` carries elevated action-approval risk, but is not a provider-token entitlement.
- https://help.openai.com/articles/11509118 : administrators of eligible workspaces can control plugin/app availability and supported actions, with role-based controls notably on Enterprise/Edu. Workspace Agents can have their own controls. This does NOT establish that a personal user may create distinct per-conversation GitHub ACLs or that these features are enabled for this account.
- https://help.openai.com/en/articles/20001256-plugins-in-chatgpt : bundled plugins may expose read/write actions depending on provider/account/workspace/surface. Plugin installation and source-system access remain distinct.

## Important observed discrepancy, no silent generalization

In this very Project Control conversation, a connected GitHub tool has published authorized commits to `meta/project-control` via create_tree/create_commit/update_ref, most recently at CONTROL a42235fa8e3e7f3a7696116dc00d9ca991abe635. That fact verifies *the connected action route used for Project Control can write*, but NOT the actual GitHub per-call token type, which host/product surface enabled it, whether a separate sandbox can use it, or the atomicity of the update_ref expected_sha contract. It is not correct to classify this specific operational connection as read-only solely because a generic help article describes the standard GitHub ChatGPT connection that way.

## Mapping to ID-01–ID-08 and C1 gates

P0-PLATFORM / ID-04: INCREMENTAL PUBLIC-DOCUMENTATION CONTEXT, STILL PARTIAL / NOT ATTESTED. No nonsecret independently attributable policy/ACL binding for an exact experimental execution instance, fallback paths or prohibited privileged route. The AI helper's assertion of nonexistence is not a provider-signed negative capability statement for all products/plans.
P0-ISSUER / ID-01,ID-03: UNKNOWN. No actual App registration, signing event or issued token subset proof.
P0-RUNTIME / ID-08: UNKNOWN. No qualified candidate runtime exists in submitted evidence; no outer host policy.
P1-GITHUB / ID-02,ID-05,ID-06: PARTIAL as previously independently reviewed. No complete grants, alternate-writer inventory or effective protected ref enforcement.
P1-PUBLISHER / ID-07: UNKNOWN. Q01 offline PASS is not live mandatory publisher installation.

This receipt preserves evidence that the **ordinary chat context distinction alone must not be relied upon**, a conservative operational assumption. It neither proves no such isolation mechanism could exist in any product nor upgrades S1/S2. No changes or testing authorized. Current S1/S2 remain NOT PROVEN and B1/B2 prototype NO-GO.

## Next source needed

Return a product-surface-specific request to support identifying (a) our CURRENT coordinator route as normal ChatGPT project conversation with connected GitHub action tooling, and (b) the FUTURE candidate E as offline executor outside that privileged chat, not yet a deployed Work/Codex agent. Ask which enforceable account/workspace/runner boundaries apply to the relevant connection and whether explicit per-chat disconnect/deny is supported. If no authoritative attestation can be obtained, do not repeat identical paper metadata exercises: present C2 external isolation architecture choice under separate Owner authorization. No message has been sent by publishing this receipt.
