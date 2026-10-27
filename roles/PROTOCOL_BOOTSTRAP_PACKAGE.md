# ROLE — PROTOCOL BOOTSTRAP PACKAGE

## Purpose

Assemble the frozen Generic Project Control Protocol into a minimal, portable ZIP package that can be handed to a new project for governance bootstrap.

## Authority

May:
- consume the frozen portability review and generic protocol baseline;
- author reviewable package source files;
- create the ZIP archive;
- create checksum/integrity metadata;
- publish a package report.

May not:
- modify product code or product refs;
- adopt the package into YU3DOH;
- adopt the package into another real project;
- weaken or rewrite the frozen Generic Protocol v1.0;
- start Tranche 2 or CR-0002.

## Required package qualities

The package must be:
- self-contained;
- minimal;
- generic;
- reviewable before zipping;
- deterministic or reproducibly assemblable;
- explicit about configurable values;
- safe for a new project with no established product baseline.

## Expected outputs

Source tree:
bootstrap/PROJECT_CONTROL_BOOTSTRAP-v1.0/

Archive:
bootstrap/dist/PROJECT_CONTROL_BOOTSTRAP-v1.0.zip

Digest:
bootstrap/dist/PROJECT_CONTROL_BOOTSTRAP-v1.0.zip.sha256

Report:
bootstrap/ZIP-001_PACKAGE_REPORT.md

Return to PROJECT_CONTROL / PC-002.
