# RUN 025 — Instance / Session Pilot

status: FROZEN
protocol_version: 1.0
experiment_status: ACTIVE FOR RUN 025 ONLY

purpose:
Test whether a stable accountable Development instance can safely use replaceable execution/conversation sessions without reducing traceability.

This artifact does NOT amend:
protocols/GENERIC_PROJECT_CONTROL_PROTOCOL-v1.0.md

## Stable accountability

Role:
DEVELOPMENT

Instance:
DEV-007

Assignment:
RUN 025 — CR-0001.4 / F-04 Library Grid/List

The DEV-007 identity remains stable while mission, role, authority and accountable ownership remain materially unchanged.

## Session layer

Initial session:
DEV-007/S01

A session is an operational execution/conversation episode under DEV-007.

Session rollover is allowed when:
- conversation context is exhausted or degraded;
- platform access is lost;
- executor/chat must be replaced;
- a clean operational context is useful;
- mission, scope, authority and accountable instance remain unchanged.

Session rollover does NOT by itself:
- create a new Development instance;
- create a new RUN;
- change scope;
- transfer acceptance;
- authorize integration.

## Required session record

Every session must record:
- instance ID;
- session ID;
- predecessor session;
- executor/conversation type where useful;
- exact CONTROL SHA consumed;
- exact product baseline or current candidate SHA;
- mission and authority;
- completed work;
- pending work;
- blockers;
- inherited evidence;
- evidence not inherited;
- rollover/closure reason;
- successor session if one exists.

## New instance threshold

Create a successor Development instance rather than only a new session when one or more materially applies:
- prior Development assignment is closed/terminal;
- accountable mission changes;
- authority/scope boundary changes materially;
- ownership/executor responsibility changes materially enough to require independent accountability;
- context cannot be recovered reliably from durable state;
- Project Control explicitly requires a new accountability boundary.

A new session under DEV-007 must never erase or rewrite earlier session history.

## Pilot evaluation

At RUN 025 Development closure, report:
- number of sessions used;
- why each rollover occurred;
- whether recovery from durable state was sufficient;
- whether any stale-context or baseline error occurred;
- whether session handoffs caused duplicated work;
- whether traceability improved, degraded or was unchanged;
- administrative overhead;
- recommendation: PROMOTE / REVISE / REJECT for possible future protocol amendment.

No promotion to Generic Protocol v1.1 occurs automatically.

Project Control will evaluate the pilot only after real RUN 025 evidence exists.
