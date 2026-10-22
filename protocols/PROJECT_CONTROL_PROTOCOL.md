# PROJECT CONTROL PROTOCOL v1.0

## Purpose
Preserve authoritative project intent and operational state independently of conversation lifespan.

Traceability chain:
`owner request → scope → design → implementation → commit → validation → integration`

## Sources of truth
- CODE TRUTH: GitHub code branches and exact code SHAs.
- CONTROL TRUTH: `meta/project-control` at an exact CONTROL SHA.
- CONVERSATION: working interface only.

## Two-SHA rule
When specification and code are both relevant, identify both CONTROL SHA and CODE SHA/CODE BASELINE SHA.

## Ownership
Only Project Control mutates central mutable state such as `PROJECT_STATE.md`, `chats/CHAT_REGISTRY.md`, canonical indexes and routing summaries.

## Owner authorization
The owner remains authority for product/scope decisions, required freezes, integration authorization and policy exceptions.

## No disappearing request rule
Every acknowledged owner request ends in one explicit state:
PROPOSED, ACKNOWLEDGED, IN_SCOPE, IMPLEMENTING, IMPLEMENTED, VALIDATED, INTEGRATED, DEFERRED, REJECTED, SUPERSEDED, or BLOCKED.

## Deferment
DEFERRED is not resolved. Record reason, authority, dependency/revisit condition and related artifact.

## Frozen artifacts
FROZEN artifacts are immutable. Corrections create a new artifact/version that explicitly supersedes the old one.

## Recovery
A successor chat reads Project State, role protocol, Chat Registry, predecessor instance record, active assignment artifact and exact code refs.

## Contradiction precedence
For code state, CODE TRUTH wins. For approved specification/control state, exact CONTROL SHA wins. If they materially conflict, STOP; do not silently reconcile.

## Protocol evolution
Protocol is versioned. Every significant artifact records the protocol version used.
