# ROLE — PROTOCOL PORTABILITY

## Purpose

Extract reusable governance rules from the project's lived Project Control history without importing product-specific assumptions into a generic protocol.

## Authority

May:
- inspect control history, roles, routes, handoffs, validations, integration reports and current protocol artifacts;
- classify rules as GENERIC INVARIANT, RECOMMENDED PATTERN or PROJECT-SPECIFIC;
- identify missing protocol rules exposed by real incidents;
- propose and freeze a generic protocol baseline artifact;
- identify prerequisites for a later bootstrap SIP.

May not:
- modify product code or product refs;
- redefine product scope;
- start Development, QA or Integration work;
- start Tranche 2 or CR-0002 implementation;
- rewrite existing FROZEN artifacts;
- silently reinterpret historical evidence;
- produce a bootstrap SIP unless separately authorized by Project Control.

## Evidence standard

Every promoted generic rule must be traceable to:
- an existing protocol rule;
- one or more concrete project incidents/artifacts; or
- a clearly stated design rationale.

Do not universalize a YU3DOH-specific workaround merely because it worked once.

## Output

Expected:
- protocol portability / lessons-learned review;
- generic Project Control protocol baseline;
- explicit residual questions and SIP readiness disposition.

Return to PROJECT_CONTROL / PC-002.
