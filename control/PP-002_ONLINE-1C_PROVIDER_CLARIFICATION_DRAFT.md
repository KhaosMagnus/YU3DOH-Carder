# PP-002 — Draft request for GitHub connector technical clarification (NOT SENT)

artifact_id: PP-002-ONLINE-1C-ROUTE-001-PROVIDER-CLARIFICATION-DRAFT
artifact_type: provider_question_draft
status: DRAFT / NOT SENT / NO EXTERNAL CONTACT AUTHORIZED
coordinator: PROJECT_CONTROL / PC-004
date: 2026-11-09 (America/Mexico_City)
correlation_experiment: ONLINE-1C-20261109-A1
originating_lab: JormungandrMagnus/pp002-online-1b-lab
reference_control: 658867b58d3101d9b01aabcb0b663a9cf4a1aebe

## Intended recipient and custody

Technical support for the **ChatGPT GitHub connector/plugin** responsible for the exposed `update_ref` action. Do not assume that GitHub upstream support can see the ChatGPT connector's orchestration traces. If routed to GitHub API support, ask only about **upstream API semantics** and keep connector-specific telemetry requests directed to its operator.

This is a copyable text for Owner review; not an instruction to contact support automatically. Contains no access tokens, installation secret, private user data or raw credentials.

## Draft subject

GitHub connector update_ref(expected_sha): request for stale-head error semantics and conditional-write availability — 2026-11-09

## Draft body

We are validating a narrowly scoped GitHub repository-writing workflow for a disposable test repository. The installed ChatGPT GitHub connector exposes `update_ref(repository_full_name, branch_name, sha, force=false, expected_sha)`, whose tool description says a mismatched expected SHA is rejected.

During a sequential test on 2026-11-09, both pre-created Git commit objects were verified and the second was a direct child of the first. A successful update advanced the branch from baseline H0 to A. A second `update_ref` call targeted B with `force=false` but deliberately kept `expected_sha=H0`. The action returned:

- Error class: `GithubGraphQLAPIError`
- Error code: `UNKNOWN`
- UTC timestamp: `2026-11-09T08:15:23Z`
- Correlation marker: `1F24:1F4B:36B8130:B502419:6AF1811B`

A subsequent independent GitHub read confirmed A remained HEAD and B was not published. The error did not identify a stale-head mismatch, so our assessment is **INCONCLUSIVE**.

Could you clarify, without disclosing credentials or private backend data:

1. Which server-side operation/API family implements `update_ref` in this connector? Is `expected_sha` enforced atomically with the ref mutation, or checked separately before a REST update?
2. For the correlation marker/time above, was the failure an expected-old-head mismatch, a GraphQL/service fault, authorization/policy denial, or another condition? Please provide the **redacted error classification** and, if retained, a trace summary showing the evaluation stage and native provider status/error type.
3. What stable, machine-readable error type should consumers use to distinguish a stale-write conflict from a transient/internal failure? If none exists, is this an acknowledged limitation?
4. Does this GitHub connector expose, or plan to expose, a native conditional commit action equivalent to GitHub GraphQL `createCommitOnBranch(expectedHeadOid)`, bound to the current GitHub App installation without exporting tokens?
5. What is the recommended supported implementation of compare-and-swap publication for clients that must avoid stale writers and blind retries?
6. What independent evidence can establish the actual credential/installation issuer and repository scope **for each mutation**, beyond generic repository permission flags?

We do not request token material, scopes broader than the disposable laboratory, privileged bypass or reproduction against a production repository. Please state if any answer would require a different support channel.

## Handling

- `SEND=NOT AUTHORIZED`; Owner must approve the destination and sending action separately.
- Accept only provider-attributable, scoped, redacted technical answers as evidence. Treat generic guidance as secondary material.
- Do not claim that the correlation ID alone proves connector fault or stale-head rejection.
