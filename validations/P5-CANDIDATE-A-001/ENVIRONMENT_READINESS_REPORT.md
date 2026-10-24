---
artifact_id: P5-CANDIDATE-A-001-ENVIRONMENT-READINESS-REPORT
artifact_type: environment_readiness_report
status: ENVIRONMENT BLOCKED
protocol_version: "1.0"
source_role: ENVIRONMENT_READINESS
source_instance: ENV-001
target_role: PROJECT_CONTROL
target_instance: PC-001
control_parent_sha: 8bdc3194777c180cb8c8a4a9629dea8139e18309
control_input_sha: ad108b5601dfa93e1fdf981e7088993f7e0c5512
candidate_branch: fix/workspace-rc-normal-subtype-icon
candidate_sha: 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
behavioral_cases_executed: 0
blocker_classification: ENVIRONMENT_EXECUTION_ACCESS
---

# ENVIRONMENT READINESS REPORT — ENV-001

**Final status: ENVIRONMENT BLOCKED**

## Decision

This Work environment established a real, clean, exact-SHA Git checkout, installed the Workspace Service dependencies from its frozen lockfile, and executed the actual service against a disposable schema-8 Workspace. It therefore materially improves on the prior no-checkout attempts. It has **not** proven the independently executable, browser-connected substrate required for Deployment routing.

The running service's loopback URL was unreachable from a separate command invocation and from the cloud browser. The latter returned `net::ERR_CONNECTION_REFUSED` while the service session remained active. A subsequent same-process HTTP health request and Canonical detail request both returned 200. These observations show a reachability gap between execution surfaces; the exact isolation mechanism remains an inference, not an established diagnosis. No supported shared listener or browser-to-runner transport was established in this mission.

Library and Carder were not launched. No application screenshot, prepared/working projection, or browser-driven write-back capture capability was proven. Candidate A remains PARTIAL; this report does not assert a product defect or issue any QA verdict.

## Frozen authority and receipt

Read completely from GitHub at `ad108b5601dfa93e1fdf981e7088993f7e0c5512`:

- `roles/ENVIRONMENT_READINESS.md`
- `roles/ROLE_REGISTRY.md`
- `PROJECT_STATE.md`
- `routing/ROUTE-CANDIDATE-A-ENV-001.md`
- `validations/P5-CANDIDATE-A-001/ENVIRONMENT_READINESS_REQUEST.md`
- `validations/P5-CANDIDATE-A-001/DESIGN_QA_DEPLOY_002_BLOCKER_REVIEW.md`
- `chats/instances/ENV-001.md`
- `protocols/COMMUNICATION_PROTOCOL.md`
- Referenced `validations/P5-CANDIDATE-A-001/EVIDENCE_REQUEST.md`.

Remote refs were independently read through the GitHub connector before provisioning:

```text
meta/project-control = ad108b5601dfa93e1fdf981e7088993f7e0c5512
fix/workspace-rc-normal-subtype-icon = 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
```

## Actual code custody

Execution checkout:
`/workspace/scratch/1ace49e975f4/candidate-a`

Direct GitHub `git ls-remote` and `git clone --single-branch --branch fix/workspace-rc-normal-subtype-icon https://github.com/KhaosMagnus/YU3DOH-Carder.git candidate-a` succeeded. The clone contains a real `.git` directory and Git objects/history; no synthetic repository was substituted. Earlier optional mirror probes failed, but direct access worked.

Before dependency installation and again after readiness activity:

```text
$ git rev-parse --abbrev-ref HEAD
fix/workspace-rc-normal-subtype-icon
$ git rev-parse HEAD
61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c
$ git status --porcelain
[empty stdout, exit 0]
```

Final `git diff --exit-code` and `git diff --cached --exit-code`: empty stdout, exit 0. See [final Git transcript](ENV-001/git-final.json).

No Candidate source, manifests, lockfiles, workflows or migrations were edited. No Candidate commit, merge, cherry-pick, rebase, ref movement or integration occurred. Temporary harness, DB and outputs reside outside the Candidate tree, under the sibling `evidence` directory. Dependency installation created ignored dependency files only.

## Toolchain, install and configuration

| Item | Observed |
| --- | --- |
| OS | Ubuntu 24.04.3 LTS |
| Git | 2.51.1 |
| Node | v24.22.1; service declares Node >=22.12.0 |
| Yarn | 1.22.22, invoked through Corepack |
| Service install | `corepack yarn install --frozen-lockfile --non-interactive`, cwd `workspace-server`; exit 0, Done in 48.62s |
| Client install | Same immutable command at repository root; reached Fetching packages, then operator interrupted with exit 130 after the separate browser-reachability blocker was established. No completed install or dependency failure is claimed. |
| Native SQLite | Real better-sqlite3 database opened; `sqlite_version()` returned 3.53.2 |
| Browser surface | Cloud inventory exposed Chrome, CDP, browser id 1; blank tab opened successfully |
| Browser executable/version | Not established. `chrome://version/` was rejected by the browser URL policy; no workaround attempted. |
| Workspace | `env-001-smoke`; disposable path `/workspace/scratch/1ace49e975f4/evidence/disposable-workspace` |
| Database | `Data/workspace.db`; candidate's unmodified migrations; schema 8 READY |
| Fixture | MONSTER draft `ac10466f-d5ff-4128-a979-828e745766ba`, password 10000001, revision 1; no owner data |
| External sources | Not enabled; no owner credentials or secrets supplied |
| Service config | `workspaceRoot` as above, host 127.0.0.1, port 4312, logger true |
| Service URL | Actual listener `http://127.0.0.1:4312` inside its command execution surface; not reachable from the cloud browser |
| Library URL | No running Library URL established. Candidate configuration would use `http://127.0.0.1:3000/ygocarder/library/`; this is a proposed address, not observed runtime evidence. |
| Carder URL | No running Carder URL established. Candidate configuration would use `http://127.0.0.1:3000/ygocarder/`; this is a proposed address, not observed runtime evidence. |

The service was loaded from exact-checkout TypeScript through its installed `tsx` loader. The external harness calls the real bootstrap, service and canonical implementations. It adds observational Fastify hooks, not substitute routes or mocked behavior. No generic QA harness or behavioral suite was executed. The minimal draft fixture is solely for readiness reads, not any A-OP acceptance fixture.

The initial persistent service session was stopped with Ctrl-C. A subsequent one-shot invocation performed actual HTTP reads within its own process surface and closed normally. The client installation was stopped. No continuing service availability is claimed after this report.

## Actual runtime and capture observations

The real startup log includes:

```text
Server listening at http://127.0.0.1:4312
workspace_id: env-001-smoke
database_schema_version: 8
state: READY
read_only: false
health_summary: Workspace database schema 8 is current and operational.
```

Within the one-shot service process:

- `GET /api/v1/workspace/status`: HTTP 200, schema 8 READY; [health.json](ENV-001/health.json).
- `GET /api/v1/library/cards/ac10466f-d5ff-4128-a979-828e745766ba`: HTTP 200; [canonical.json](ENV-001/canonical.json) contains revision 1, confirmations array and provenance array. Both arrays are empty in this minimal draft; meaningful confirmation transitions have not been demonstrated.
- The external hooks recorded actual method, URL, timestamp, parsed request body, response status and body in [http-trace.jsonl](ENV-001/http-trace.jsonl). Both captured requests are GETs. No write-back was sent.

Separate execution and cloud-browser probes:

```text
curl -sS http://127.0.0.1:4312/api/v1/workspace/status
curl: (7) Failed to connect to 127.0.0.1 port 4312 after 0 ms: Couldn't connect to server

Cloud browser navigation to the same URL:
net::ERR_CONNECTION_REFUSED
```

No application UI opened, no smoke screenshot exists, and blank-tab availability is not application evidence. The hooks are configured to observe future real requests, including write-back bodies and acknowledgement fields, but a complete browser-driven capture path has not been demonstrated. No extra write-back was performed to test them.

## Mandatory request item disposition

Numbers below match `ENVIRONMENT_READINESS_REQUEST.md` exactly. PROVEN means evidenced here; PARTIAL or NOT ESTABLISHED prevents READY where applicable.

| # | Requirement | Disposition and evidence |
| --- | --- | --- |
| 1 | Filesystem Git checkout with .git | PROVEN — successful real clone |
| 2 | Clone/fetch access | PROVEN — direct ls-remote and clone |
| 3 | Required local Git outputs | PROVEN — preflight and final transcript |
| 4 | Exact HEAD | PROVEN — 61503c6eb7973bfaf2a3ccfbdcd1e6701007b07c |
| 5 | Clean tree before/after | PROVEN — empty porcelain and final diffs |
| 6 | Harness/output outside tree | PROVEN — sibling evidence path |
| 7 | OS | PROVEN — environment.json |
| 8 | Git | PROVEN — 2.51.1 |
| 9 | Node | PROVEN — v24.22.1 |
| 10 | Yarn | PROVEN — Corepack Yarn 1.22.22 |
| 11 | Immutable dependency install | PARTIAL — service succeeded; client not completed |
| 12 | Browser executable/version | NOT ESTABLISHED — managed Chrome name alone insufficient |
| 13 | Nonsecret configuration | PROVEN for service; client runtime not established |
| 14 | Disposable Workspace | PROVEN — env-001-smoke, schema 8, known draft fixture |
| 15 | Actual Service URL | PARTIAL — real listener and same-process HTTP 200; inaccessible from browser |
| 16 | Actual Library URL | NOT ESTABLISHED — not launched |
| 17 | Actual Carder URL | NOT ESTABLISHED — not launched |
| 18 | Exact-checkout startup/health | PARTIAL — real service proven; Library/Carder absent |
| 19 | Environment-only UI screenshot | NOT ESTABLISHED — no UI loaded |
| 20 | Browser pixels/screenshots | NOT ESTABLISHED for Candidate A; browser API availability is not capture proof |
| 21 | Actual prepared/working projection | NOT ESTABLISHED — no Carder session opened |
| 22 | Actual acknowledged write-back capture | PARTIAL — real HTTP hooks configured and exercised on GETs; browser path unavailable, no write-back sent |
| 23 | Authoritative Canonical state | PROVEN — actual HTTP detail export, backed by real fixture DB |
| 24 | Confirmation flags | PARTIAL — authoritative endpoint exposes confirmations; fixture array empty |
| 25 | Revision | PROVEN — actual detail response revision 1 |
| 26 | Provenance | PARTIAL — authoritative endpoint exposes provenance; fixture array empty |
| 27 | Before/after comparison | NOT ESTABLISHED as an end-to-end capture process; readable snapshot exists but no behavioral transition executed |
| 28 | Durable external artifacts | PROVEN by this control publication and accompanying ENV-001 text/JSON/log artifacts; runtime DB persistence is not claimed |
| 29 | Manifest with hashes/references | PROVEN for captured readiness artifacts; manifest includes candidate/control input SHA, timestamp, fixture id, no screenshot case ids, and SHA-256 values |

The decisive unmet gate is executable Library/Carder connected to the actual browser with UI smoke/capture proof. The report deliberately records subordinate unestablished items instead of promoting partial capabilities to readiness.

## Artifacts and integrity

Durable companion artifacts are in [ENV-001/manifest.json](ENV-001/manifest.json), in the same Git commit as this report. It lists hashes and sizes for the harness, observations, installation logs, Git transcript, environment inventory, fixture, HTTP trace and health/Canonical snapshots. References are relative to this report. The manifest hashes each evidence file; Git commit identity anchors the report and manifest themselves. The source Workspace DB is disposable scratch data, not a retained validated fixture corpus.

Tracked manifest/lockfile SHA-256 values at final inspection:

```text
package.json: 391cac6302d9993235318e44a40c1a2daebc506796b142f29787b9abc1a26275
yarn.lock: 7b1b702811b5932aeb1c4375ecac6eed02cf51b2cb4dd500a0a2e972d917b0a7
workspace-server/package.json: e52e8717fa714b1c7b499d599a1d733d9f55fa7f8a3387f9f05ac50140dcd490
workspace-server/yarn.lock: 3209163e59d04e1fb53caebded582b4d74bcb69918d89376adeb0e01b7fbb98b
```

## Return to Project Control

During publication, the control branch advanced independently to `8bdc3194777c180cb8c8a4a9629dea8139e18309` for P6 historical-documentation recovery. The branch was reread, the intervening commit compared, and its complete PROJECT_STATE.md read. Candidate A identity and ENV-001 gate remain unchanged. This report and evidence are published on top of that newer control tree, preserving all concurrent changes. The frozen mission input remains `ad108b5601dfa93e1fdf981e7088993f7e0c5512`.

Classification: **ENVIRONMENT / EXECUTION ACCESS**. Checkout custody and service execution are improved; suitability for later Deployment has not been proven. No DEPLOY-003 assignment should follow this result.

Highest-impact next action: provision a supported execution substrate where the exact checkout, service, UI server and browser share a demonstrably reachable transport; then complete the unresolved readiness items. Avoid another blind Deployment retry on this unproven command/browser arrangement. No owner-manual behavioral test repetition is requested.

A-OP-01 through A-OP-06 remain frozen, **0/6 executed**. No Candidate B work, RUN 024, code changes, integration or Deployment Validation was initiated.

**Final status: ENVIRONMENT BLOCKED**
