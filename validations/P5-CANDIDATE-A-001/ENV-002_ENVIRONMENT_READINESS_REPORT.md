---
artifact_id: P5-CANDIDATE-A-001-ENV-002-ENVIRONMENT-READINESS-REPORT
artifact_type: environment_readiness_report
status: ENVIRONMENT_READY
protocol_version: "1.0"
source_role: ENVIRONMENT_READINESS
source_instance: ENV-002
target_role: PROJECT_CONTROL
target_instance: PC-001
control_parent_sha: de9633474267d87b255acd06c8c55970ee5fc7ec
candidate_branch: fix/workspace-rc-normal-subtype-icon
candidate_sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
behavioral_cases_executed: 0
substrate: github_hosted_actions
actions_run_id: 40073048304
actions_job_id: 120810441881
ops_branch: ops/candidate-a-env-002-actions
ops_head: bc52a568719e30429c4f517b8c49c1ad05f378ef
artifact_id_github: 12551219292
artifact_digest: sha256:ebf6f23e672f877c39b1f9e96e5b90f27b9cbe5f63a5b25531572a2bedf85f4b
---

# ENV-002 — GitHub Actions Environment Readiness Report

## Final status

`ENVIRONMENT READY`

Candidate A is now proven executable on a materially different independent substrate suitable for bounded Deployment Validation.

No A-OP behavioral case was executed by ENV-002.

## Candidate custody

Repository:

`KhaosMagnus/YU3DOH-Carder`

Candidate branch:

`fix/workspace-rc-normal-subtype-icon`

Exact candidate:

`61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

The Actions job checked out Candidate A into a dedicated filesystem checkout with full Git metadata, separately from the operational harness branch.

Preflight evidence:

- local HEAD = `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`;
- remote `refs/heads/fix/workspace-rc-normal-subtype-icon` = same SHA;
- `git status --porcelain` = empty;
- working diff = empty;
- cached diff = empty.

Final integrity evidence after readiness:

- local HEAD remained `61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`;
- working tree remained clean;
- working diff remained empty;
- cached diff remained empty.

Candidate A was not modified.

## Substrate

GitHub-hosted Actions:

- runner: Ubuntu 24.04;
- Git: 2.55.0;
- Node: 24.19.0;
- Yarn: 1.22.22;
- Playwright Core: 1.58.2;
- Chromium: 145.0.7632.6.

Root dependencies and Workspace Service dependencies installed using existing frozen lockfiles.

Workspace Service compilation completed successfully.

## Real application proof

The readiness job launched the real Candidate A application components in one runner/network namespace.

Disposable Workspace:

`env-002-actions-readiness`

Workspace state:

`READY`

Workspace format:

`1`

Database schema:

`8`

Real endpoints proved reachable:

- Workspace Service: `http://127.0.0.1:4312`
- Library: `http://127.0.0.1:3000/ygocarder/library/`
- Carder: `http://127.0.0.1:3000/ygocarder/`

The environment captured real browser pixels from both Library and Carder.

## Readiness-only fixture

To avoid consuming any frozen Candidate A behavioral case, ENV-002 used a disposable:

`SPELL / CONTINUOUS`

fixture.

No NORMAL Spell, NORMAL Trap, FIELD Spell or COUNTER Trap acceptance assertion was executed.

No Carder write-back was performed.

## Carder preparation / projection capability

The Library executed the real:

`POST /api/v1/carder/prepare-working-card`

and received HTTP 200.

The captured prepared structure contained the disposable CONTINUOUS Spell structure and a real BS asset grant/content URL.

Chromium opened the real Carder URL using the resulting Workspace intent.

A real Carder asset-content GET returned HTTP 200.

This proves that later Deployment Validation can capture actual prepared/working projection and rendered pixels without substituting renderer behavior.

## HTTP capture capability

Browser interception captured actual API request/response activity including:

- Workspace status;
- Library facets/cards/detail/variants;
- Carder prepare-working-card POST body and HTTP 200 response;
- Carder asset-content GET and HTTP 200 response.

The capture mechanism is configured to record method, body, response status and timestamp.

Carder write-back was intentionally not executed during readiness.

## Canonical / confirmation / revision / provenance capability

ENV-002 captured authoritative Canonical state including:

- card identity;
- revision;
- family/password;
- structure;
- localization;
- confirmation state;
- provenance IDs;
- provenance source_kind/source_ref.

Canonical before/after SHA-256:

`e4cd944f508e408a643383957cafb9faf8814a4833f8780822c01f0659d95f81`

for both snapshots.

The readiness probe was therefore confirmed read-only.

## Durable evidence

GitHub Actions run:

`40073048304`

Job:

`120810441881`

Operational branch/head:

`ops/candidate-a-env-002-actions @ bc52a568719e30429c4f517b8c49c1ad05f378ef`

Uploaded artifact:

`env002-readiness-40073048304-61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c`

GitHub artifact ID:

`12551219292`

Artifact digest:

`sha256:ebf6f23e672f877c39b1f9e96e5b90f27b9cbe5f63a5b25531572a2bedf85f4b`

Evidence includes:

- `git-preflight.json`
- `git-final.json`
- `environment.json`
- `workspace-status.json`
- `browser.json`
- `library-smoke.png`
- `carder-smoke.png`
- `prepare-response.json`
- `network.json`
- `canonical-before.json`
- `canonical-after.json`
- `runtime-service.log`
- `runtime-vite.log`
- `readiness-result.json`
- `manifest.sha256`

## Harness correction provenance

Two earlier ENV-002 Actions attempts failed after infrastructure preflight because of defects in the external operational harness, not Candidate A:

1. run `40072724000` — response body was consumed twice by the readiness script;
2. run `40072875008` — readiness script searched for Open Standard before entering Variants / Assets.

Both failures preserved exact-SHA cleanliness and artifacts.

Only the external `ops/` harness was corrected.

Candidate A remained byte-for-byte unchanged throughout.

Successful final run:

`40073048304`

## Decision

The DQA execution-substrate acceptance gate is satisfied.

Candidate A may now be routed to a new independent DEPLOYMENT_VALIDATION instance using this proven GitHub-hosted Actions substrate.

The frozen A-OP evidence contract remains unchanged.

## Non-authorizations

This readiness PASS does not authorize:

- Candidate A QA PASS;
- any A-OP result;
- Candidate A modification;
- Development re-entry;
- Candidate A/B combination;
- RUN 024;
- integration to `feature/workspace-v0.1`;
- integration to `main`.
