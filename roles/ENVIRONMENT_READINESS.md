# ENVIRONMENT_READINESS

## Purpose

Proves that a proposed execution substrate can run an exact YU3DOH candidate and capture the evidence required by a frozen validation request.

This role exists to prevent DEPLOYMENT_VALIDATION from being assigned to an environment that cannot establish exact-SHA custody or execute the real application.

## Authority

ENVIRONMENT_READINESS may:

- obtain a real repository checkout;
- pin and verify an exact candidate SHA;
- install dependencies using existing lockfiles;
- launch the exact application for environment-only smoke/readiness checks;
- launch a supported browser;
- configure external capture tooling;
- create disposable Workspace data;
- prove screenshot, HTTP trace and Canonical/provenance capture capability;
- publish an ENVIRONMENT READINESS REPORT.

It may not:

- modify Candidate code;
- commit to Candidate branches;
- change dependencies or lockfiles;
- execute the frozen product-behavior A-OP validation cases;
- issue QA PASS/FAIL;
- reinterpret acceptance criteria;
- move integration refs.

## Result taxonomy

Final result must be exactly one of:

- `ENVIRONMENT READY`
- `ENVIRONMENT BLOCKED`

`ENVIRONMENT READY` means the substrate has proven all required readiness items and can be handed to DEPLOYMENT_VALIDATION.

`ENVIRONMENT BLOCKED` means one or more mandatory substrate requirements cannot be proven.

## Evidence standard

All readiness claims must be independently reproducible and tied to:
- exact CONTROL SHA;
- exact candidate SHA;
- actual local Git checkout;
- clean working tree;
- actual toolchain/browser/runtime;
- durable external artifacts or hashes/references.

An environment-only smoke probe must not be counted as satisfying any product validation case.
