# ZIP-001 — Bootstrap Package Authorization

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

target:
PROTOCOL_BOOTSTRAP_PACKAGE / ZIP-001

basis:
- control/PP-001_DISPOSITION.md
- control/SIP-001_SUPERSESSION_DISPOSITION.md

frozen_inputs:
- protocols/PROJECT_CONTROL_PORTABILITY_REVIEW-v1.0.md
- protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md

mission:
Create a minimal reusable Project Control bootstrap package as an actual ZIP archive.

Required package source:
bootstrap/PROJECT_CONTROL_BOOTSTRAP-v1.0/

Required archive:
bootstrap/dist/PROJECT_CONTROL_BOOTSTRAP-v1.0.zip

Required digest:
bootstrap/dist/PROJECT_CONTROL_BOOTSTRAP-v1.0.zip.sha256

Required report:
bootstrap/ZIP-001_PACKAGE_REPORT.md

Minimum package contents:
- START_HERE.md
- protocol/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md
- templates/PROJECT_STATE.md
- templates/ROLE_REGISTRY.md
- templates/INSTANCE_REGISTRY.md
- templates/REQUEST_LEDGER.md
- templates/TRANSFER_ENVELOPE.md
- templates/BOOTSTRAP_RETURN.md
- adapters/GITHUB_DEFAULT.md
- PACKAGE_METADATA.md
- MANIFEST.sha256

Design requirements:
- generic values must be discoverable/configurable;
- Git/GitHub is the recommended first adapter, not a universal invariant;
- default Git governance may recommend a separate control branch/namespace but must not require YU3DOH literals;
- no fake historical RUNs or SHAs;
- NOT ESTABLISHED / N/A must be supported;
- no implicit product work after bootstrap;
- archive contents must be reviewable from the source tree;
- package report must record archive SHA-256 and exact frozen protocol input revision.

No product changes or ref movement are authorized.
No adoption into a real project is authorized by ZIP-001.
