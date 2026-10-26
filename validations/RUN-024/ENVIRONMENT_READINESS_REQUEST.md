---
artifact_id: RUN-024-ENVIRONMENT-READINESS-REQUEST
artifact_type: environment_readiness_request
status: FROZEN
protocol_version: "1.0"
source_role: PROJECT_CONTROL
source_instance: PC-002
target_role: ENVIRONMENT_READINESS
target_instance: ENV-003
control_parent_sha: 4fcbb004034ef97c9f53d1256f18b69e77c5caa3
code_baseline:
  branch: feature/workspace-v0.1
  sha: 64cb5f4ca42348c6c403e64e0d61bdff8c32a281
execution_target:
  branch: feature/workspace-run-024
  sha: 219ac252d50ae11b836a93baa20cc7f7d872367f
---

# RUN 024 — Environment Readiness Request

## Purpose

Prove a materially different execution substrate suitable for resuming Development of RUN 024 after DEV-004 and DEV-005 independently failed at executor Git transport.

This is an environment gate only.

It does not authorize product implementation and does not create a new RUN.

## Historical constraints

Historical evidence is informative but not sufficient by itself:

- ENV-001 Work/cloud proved real Git checkout and service execution but did not prove browser/server shared transport.
- ENV-002 GitHub-hosted Actions proved exact checkout, real Workspace Service, Library, Carder and Chromium in one reachable substrate for Candidate A validation.

ENV-003 must prove current RUN 024 readiness against the exact execution target above. Do not inherit READY from historical Candidate A evidence.

## Mandatory direct-executor custody

The execution substrate itself, not only the GitHub connector, must prove:

1. direct GitHub transport succeeds;
2. a real checkout with `.git` exists;
3. `feature/workspace-run-024` is fetched/checked out at exactly `219ac252d50ae11b836a93baa20cc7f7d872367f`;
4. local `git rev-parse HEAD` equals that SHA;
5. local working tree is clean before and after readiness work;
6. merge-base/ancestry proves the exact authorized baseline;
7. comparison confirms the only baseline→target delta is the historical blocker report.

No synthetic checkout or connector-only content mirror satisfies this gate.

## Toolchain and dependency readiness

Prove the substrate can obtain and use the existing frozen toolchain/dependencies required by RUN 024, including:

- Git;
- Node;
- Yarn;
- root dependency installation using the existing lockfile;
- Workspace Service dependency installation using the existing lockfile;
- existing compile/build capability sufficient to establish the environment is runnable.

Do not modify package manifests or lockfiles.

## Shared runtime/browser readiness

The same usable substrate must prove all of the following can coexist with working transport:

- real Workspace Service;
- real Library;
- real Carder;
- supported browser automation;
- browser can reach the actual application;
- screenshot capture;
- DOM/accessibility-state capture;
- HTTP request/response capture;
- authoritative Canonical read capability.

Use a neutral disposable fixture that does not exercise F-03/F-06 acceptance behavior.

Do not execute T1-OP-01 through T1-OP-07.

## Development suitability observation

ENV-003 must state explicitly whether the proven substrate is practically usable by a later Development instance for:

- editing tracked source in a real checkout;
- running the complete frozen RUN 024 validation gate after implementation;
- producing browser evidence in the same or a reproducibly linked substrate;
- publishing a resulting candidate without requiring branch reset/recreation.

ENVIRONMENT_READINESS itself must not modify or commit Candidate code.

If the substrate is only suitable for post-implementation validation but not for actual Development execution, classify that limitation explicitly. Do not promote it to a complete RUN 024 Development substrate merely because browser validation works.

## Material difference requirement

The substrate must be materially different from the failing DEV-004/DEV-005 executor path, or must prove that the specific proxy/transport failure is absent.

A connector read succeeding while executor Git still fails is insufficient.

## Durable evidence

Publish a report at:

`validations/RUN-024/ENV-003_ENVIRONMENT_READINESS_REPORT.md`

Include:

- exact Control SHA consumed;
- exact execution-target SHA;
- direct Git transcript;
- environment/tool versions;
- dependency-install results;
- runtime URLs;
- browser identity/version;
- screenshots or durable references;
- capture evidence;
- clean-tree proof;
- explicit Development-suitability finding;
- exact blockers if any.

Final status must be exactly:

- `ENVIRONMENT READY`; or
- `ENVIRONMENT BLOCKED`.

Return to:

`PROJECT_CONTROL / PC-002`
