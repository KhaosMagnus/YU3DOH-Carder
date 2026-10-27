# ROUTE — ZIP-001 / Project Control Bootstrap Package

status: FROZEN
protocol_version: 1.0

SOURCE:
PROJECT_CONTROL / PC-002

TARGET:
PROTOCOL_BOOTSTRAP_PACKAGE / ZIP-001

MODE:
BOOTSTRAP PACKAGE ASSEMBLY

AUTHORIZATION:
control/ZIP-001_AUTHORIZATION.md

SUPERSESSION:
control/SIP-001_SUPERSESSION_DISPOSITION.md

PP DISPOSITION:
control/PP-001_DISPOSITION.md

FROZEN INPUTS:
- protocols/PROJECT_CONTROL_PORTABILITY_REVIEW-v1.0.md
- protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md

ROLE:
roles/PROTOCOL_BOOTSTRAP_PACKAGE.md

MISSION:

Create a real reusable ZIP package that can be handed to a new project to bootstrap Project Control governance.

Required reviewable source tree:
bootstrap/PROJECT_CONTROL_BOOTSTRAP-v1.0/

Required archive:
bootstrap/dist/PROJECT_CONTROL_BOOTSTRAP-v1.0.zip

Required archive digest:
bootstrap/dist/PROJECT_CONTROL_BOOTSTRAP-v1.0.zip.sha256

Required package report:
bootstrap/ZIP-001_PACKAGE_REPORT.md

The package must be generic and self-contained.

It must not contain YU3DOH-specific product assumptions as requirements.

It must not apply itself to any project.

It must not modify product refs.

It must not start Tranche 2 or CR-0002.

Before return, verify:
- expected source files are present;
- ZIP opens successfully;
- ZIP content matches the source tree;
- MANIFEST.sha256 validates package payload files;
- archive SHA-256 matches the published .sha256 file;
- no YU3DOH product-specific values are required by the package;
- frozen Generic Protocol v1.0 bytes are preserved inside the package.

RETURN:
PROTOCOL_BOOTSTRAP_PACKAGE / ZIP-001 → PROJECT_CONTROL / PC-002

Expected status:
ZIP PACKAGE CREATED / READY FOR REVIEW
or
ZIP PACKAGE BLOCKED
