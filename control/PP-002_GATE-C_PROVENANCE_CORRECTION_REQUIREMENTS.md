# PP-002 — Gate C Provenance Correction Requirements

artifact_id: PP-002-GATE-C-PROVENANCE-CORRECTION
artifact_type: post_terminal_evidence_requirements
status: FROZEN
protocol_version: 1.0
source_role: PROJECT_CONTROL
source_instance: PC-003
basis: runs/PP-002_GATE-C_REVISE_DISPOSITION.md
canonical_report: protocols/PP-002_GATE-C_REAL_SESSION_ROLLOVER_REPORT.md
initial_terminal_control: 0327e0d978710d8351d627fc3a9af6f66d13abae
mode: EXISTING-EVIDENCE RECONCILIATION ONLY / NO LIVE WORKFLOW

## Purpose and limits

Gate C is terminal REVISE: its operational recovery is closed. Evaluate whether already existing independent evidence can establish (1) a genuine distinct PP-002/S01 and PP-002/S02 platform conversation boundary tied to C-020; (2) no post-C-020 predecessor tool observations/mutations over a defined, independently auditable interval.

No further Actions emission, rerun, cancellation, replacement, new experimental effects, changes to the frozen Gate C acceptance contract, or protocol adoption is authorized by this requirement. New experiment requires separate approval.

## P01 — session-boundary provenance

Needed: two genuinely distinct conversation/session identifiers from a reliable platform record, or an independently auditable context-boundary attestation previously defined as acceptable, linked to:
- role PROTOCOL_PORTABILITY, instance PP-002 and two separate execution sessions S01 and S02;
- C-020 exact publication 1352de4daddc6c2143943af2ad7142333f7be963 and checkpoint blob 1b8055add2533d04e6c3b42e6344e3bee9c46614;
- end of predecessor execution and beginning of successor execution;
- how evidence was captured, source of authority, what identity layer it demonstrates, and where its proof is durably retained.

Distinct user-created chat links, if verifiably available, may support conversation identity; they do not alone establish isolation of hidden context or a complete predecessor stop/activity audit. A user's account or coordinator statement may be evidence of intent, but cannot automatically replace an independent technical fact. Explicitly state UNKNOWN/UNCERTAIN where independent identity is unobtainable.

## P02 — predecessor stop/activity audit

Needed: bounded coverage of S01 from successful C-020 publication acknowledgement (reported UTC 2026-10-29T18:30:42.545Z) through confirmed predecessor-session termination or an independently supported audit endpoint. Capture a complete relevant predecessor tool/action/read trace, or a credible independent stop attestation with declared source, completeness and limitations. Include GET/poll reads, connector tool calls, writes, retries, cancellations and any emergency containment. Autonomous already-emitted original workflow continuation is NOT new S01 agent activity.

Repository mutations and Action run inventory may prove absence of observed writes in that scope; they CANNOT by themselves prove absence of read-only polling. An uninstrumented interval is UNKNOWN, not ZERO.

## Q01 — retrieval provenance collector correction

Existing S02 correction is preserved append-only. On future collection:
- bind actual requested revision to the real source URL at issuance;
- preserve request/response/receipt times separately from event, recorded and verified times;
- absent request revision = UNKNOWN, never default to successor-routing SHA;
- compare source URL/ref, exact blob and provenance manifest before durable publication;
- prevent inconsistency from passing only because current-state operation receipts validate.

Historical C-030 remains unchanged.

## Decision rule

If evidence can prove P01/P02 within their original frozen acceptance scope, PC-003 may consider a new explicitly linked read-only re-adjudication; it is NOT an automatic historical PASS. If proof is unavailable, preserve Gate C REVISE. Prospective acceptance-rule changes or new live experiment need distinct Owner authorization. No retroactive relaxation to manufacture successful rollover.

After the terminal Gate C disposition, PP-002 must separately recommend PROMOTE / REVISE / REJECT for the overall Recovery Gate experiment, explicitly weighing these gaps and the further untested cases (involuntary crash, quota exhaustion, lost issuance ACK). PROMOTE, if justified, permits only a separately authorized successor-protocol draft; it never adopts a protocol.
