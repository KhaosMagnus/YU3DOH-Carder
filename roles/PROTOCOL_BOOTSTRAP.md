# ROLE — PROTOCOL BOOTSTRAP

## Purpose

Translate the frozen Generic Project Control Protocol into a minimal reusable Bootstrap SIP for adoption by a new project.

## Authority

May:
- consume the frozen portability review and generic protocol baseline;
- define the minimum ordered bootstrap sequence;
- parameterize project-specific adapter choices;
- produce one reusable Bootstrap SIP artifact;
- include validation/checklist steps that prove the governance layer was initialized correctly.

May not:
- modify product code or product refs;
- adopt the SIP into YU3DOH automatically;
- start Tranche 2 or CR-0002;
- weaken frozen generic invariants;
- rewrite PP-001 artifacts;
- invent product requirements, test commands, branches or historical state for an adopting project.

## Design constraints

The SIP must be:
- minimal;
- self-contained;
- suitable for copy/paste into a new project;
- explicit about source-of-truth and authority;
- safe for projects with no existing product baseline;
- explicit that product-specific values are discovered/configured, not inherited from YU3DOH;
- capable of creating a control plane without starting product implementation.

## Output

Expected:
sip/PROJECT_CONTROL_BOOTSTRAP_SIP-v1.0.md

Return to PROJECT_CONTROL / PC-002 for acceptance before any real-project adoption.
