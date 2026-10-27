# SIP-001 — Supersession Disposition

status: FROZEN
protocol_version: 1.0

source:
PROJECT_CONTROL / PC-002

reason:
Terminology/intent interpretation error by Project Control.

Observed owner intent:
Produce a reusable ZIP bootstrap package for export to new projects.

Incorrect interpretation:
"SIP" was treated as a protocol artifact acronym.

Verified state before correction:
- SIP-001 was assigned;
- no authorized SIP output file existed;
- no product ref changed;
- PP-001 outputs remain valid and frozen.

Disposition:
SIP-001 is SUPERSEDED BEFORE OUTPUT.

Do not delete or rewrite:
- control/SIP-001_AUTHORIZATION.md
- routing/ROUTE-SIP-001.md
- roles/PROTOCOL_BOOTSTRAP.md

They remain historical evidence of the interpretation error.

Successor:
ZIP-001 — Project Control Bootstrap Package

The successor must create an actual portable ZIP package, with reviewable source files and integrity metadata.

PP-001 and Generic Project Control Protocol v1.0 remain unchanged.
