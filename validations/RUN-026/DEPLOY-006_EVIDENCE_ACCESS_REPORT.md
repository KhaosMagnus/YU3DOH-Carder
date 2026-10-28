---
artifact_id: RUN-026-DEPLOY-006-EVIDENCE-ACCESS-REPORT
status: FINAL
protocol_version: "1.0"
source_role: DEPLOYMENT_VALIDATION
source_instance: DEPLOY-006
target_role: PROJECT_CONTROL
target_instance: PC-002
control_input: 7e4a0d68f148ec6216bb830a654d87ad012bc606
source_control_revision: 6e9f503ed0e05016de50da5630cdeaeb6948725e
candidate: e11579950ef7ed20e4b6eeee88f9c3597c1f074b
baseline: dd968ba05e579461962bbcced0e9cae3cd4c3d23
final_status: EVIDENCE ACCESS READY
qa_verdict: null
report_date: "2026-10-28"
---

# RUN 026 — DEPLOY-006 Evidence Access Report

**FINAL STATUS: EVIDENCE ACCESS READY.**

The original DEV-008 archive was transported without product execution or product mutation, verified on a GitHub-hosted Actions runner, downloaded through the GitHub Actions artifact API into this validation environment, extracted, and verified again. Raw bytes are independently retrievable and inspectable. No fallback rerun was necessary.

This closes the raw-evidence access/provenance transport delta. It does not adjudicate acceptance cases or grant QA PASS. DQA-005 remains INCONCLUSIVE until Project Control assigns successor independent QA against the same immutable candidate.

## Authority and custody

Consumed at exact control input `7e4a0d68f148ec6216bb830a654d87ad012bc606`:

- `control/RUN-026_EVIDENCE_TRANSPORT_AUTHORIZATION.md`;
- `validations/RUN-026/DEPLOY-006_EVIDENCE_TRANSPORT_REQUEST.md`;
- `routing/ROUTE-RUN-026-DEPLOY-006.md`;
- `validations/RUN-026/DQA-005_EXTERNAL_QA_REPORT.md`;
- `runs/RUN-026_DQA-005_INCONCLUSIVE_DISPOSITION.md`.

Initial connector reads, initial/final Actions API reads and post-download connector reads agreed on all three product refs:

| Ref | Exact SHA before and after transport/retrieval |
| --- | --- |
| `feature/workspace-run-026` | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` |
| `feature/workspace-v0.1` | `dd968ba05e579461962bbcced0e9cae3cd4c3d23` |
| `main` | `54cc3aad246c89a29f2a18be63c539db68cae041` |

Operational branch: `ops/run-026-deploy-006-actions`.

Operational harness SHA: `da47a3668c75b916f23650d38677e58d0b38ba36`.

The harness is based on the control input; its only changes are `.github/workflows/run-026-deploy-006-evidence.yml` and `ops/run-026-deploy-006/verify_transport.py`. It is evidence infrastructure, not a product candidate. The Actions token had `contents: read` and `actions: read`. No product checkout was executed, dependencies installed, browser launched or product tests rerun by DEPLOY-006. Source Development execution remains distinct from this transport run.

## Source and independent integrity results

Source revision: `6e9f503ed0e05016de50da5630cdeaeb6948725e`.

Source directory: `validations/RUN-026/DEV-008/`.

| Check | Independently observed result |
| --- | --- |
| Original archive | `RUN-026_EVIDENCE.zip` |
| Original archive bytes | **22,524,792**, exact expected size |
| Original archive SHA-256 | `7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c`, exact expected hash |
| ZIP integrity / extraction | PASS on Actions and after API retrieval |
| Manifest entries / passed / failed | **186 / 186 / 0**, path, existence, byte length and SHA-256 checked for every member |
| Visual inventory / missing / duplicate | **92 / 0 / 0**, every path is an extracted PNG and manifest member |
| PNG decoding after retrieval | **126 / 126** retained PNG files decoded successfully, including all 92 inventory images |
| Files outside manifest | `manifest.json` only; byte-identical to the pinned external source manifest |
| Unexplained files / missing required raw members | **0 / 0** |
| API-downloaded artifact ZIP | **80,983,126 bytes**, digest matched, CRC test and extraction PASS |
| Downloaded original ZIP versus published raw tree | Every original ZIP file is byte-identical to its corresponding `raw/` file |
| Product ref custody | Unchanged |

The original ZIP contains 187 files: 186 manifest members plus the manifest itself. The Actions artifact contains 192 files: original ZIP, four pinned external metadata/verification files (`manifest.json`, `visual-inventory.json`, `summary.json`, `transport-verification.json`), and the complete 187-file `raw/` hierarchy. The 34 PNGs outside the 92-entry visual inventory remain manifest-covered and are preserved, including retained F04 screenshots.

Pinned metadata SHA-256 values independently computed by the runner:

- `manifest.json`: `3aa39d80e21e9a3bf1b8c2a3192a9d49b5d064a5cee9305af260b62938118fb5`;
- `visual-inventory.json`: `c7df36b9d302a7b0df0ef5193c770cf82ffb97b0707dc17f6b824b4ed722de9e`;
- `summary.json`: `34f367c2862bc179fb4c96324349c2bf9096197794e13f76cff79794d2368941`.

## Actions and artifact provenance

| Field | Value |
| --- | --- |
| Run ID / attempt | **40742109392 / 1** |
| Job ID | **123006143442** |
| Job name / outcome | `Transport frozen DEV-008 evidence` / success |
| Raw artifact ID | **12838688889** |
| Raw artifact name | `RUN-026-DEPLOY-006-raw-evidence-40742109392` |
| Raw artifact size | **80,983,126 bytes** |
| Raw artifact digest | `sha256:de8e9a82744e04fad9153b1ba4ea65f4a6ed71cf3f0e318e41e75ab4f9030c08` |
| Operational harness SHA | `da47a3668c75b916f23650d38677e58d0b38ba36` |
| Exact source control revision | `6e9f503ed0e05016de50da5630cdeaeb6948725e` |
| Exact browser/test candidate | `e11579950ef7ed20e4b6eeee88f9c3597c1f074b` |
| Companion provenance artifact ID | **12839302886** |
| Companion name / size | `RUN-026-DEPLOY-006-artifact-provenance-40742109392` / **994 bytes** |
| Companion digest | `sha256:c590b1db3c9350b4cfef6a467290e8e21e161b09548c18265d0f5dd6448beac1` |
| API-reported retention expiry | `2027-01-26T18:07:07Z` |

[Actions run](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40742109392) · [raw artifact](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40742109392/artifacts/12838688889) · [job](https://github.com/KhaosMagnus/YU3DOH-Carder/actions/runs/40742109392/job/123006143442)

The artifact's `transport-verification.json` and companion record correctly record retrieval as pending at upload time. The subsequent API retrieval and local validation are recorded in `validations/RUN-026/DEPLOY-006/retrieval-verification.json`; this final report closes that temporal pending state without rewriting the uploaded evidence. Artifact self-identity is recorded externally to avoid a self-referential digest.

## Raw inspection map and attribution

All paths below are relative to the downloaded artifact's `raw/` directory:

| Raw material | Inspectable location |
| --- | --- |
| Six authoritative gate logs | `gates/03.log` through `gates/08.log` |
| Execution / custody | `preflight.json`, `environment.json`, `architecture.json`, `final-product-refs.txt`, `gates/gate-results.json`, retained `tooling/` |
| Chromium / Firefox case evidence | `theme-chromium/Chromium-evidence.json`, `theme-firefox/Firefox-evidence.json`, and both complete directories |
| Retained F04 evidence | `f04-light/**`, `f04-dark/**` |
| Additional surfaces / OS behavior | `additional-surfaces/**`, `firefox-os.json` |
| DOM / ARIA | `theme-chromium/*-DOM.json`, `theme-firefox/*-DOM.json`, embedded case proof records |
| Network, storage, contrast | Browser `requests`, `responses`, `proofs`, `contrast`, `audit` and retained tooling |
| Workspace / Canonical snapshots | Both browser directories' `workspace-before.json`, `workspace-after.json` and embedded case proof records |
| Explicitly synthetic presentation | Four `*Preferred-OVERFRAME-only-synthetic-{LIGHT,DARK}-e11579950ef7.png` images across the two browser directories, with associated proofs/tooling |

The extracted `architecture.json`, gate-results record, summary and all six principal browser/surface/OS JSON records attribute their observations to exact candidate `e11579950ef7ed20e4b6eeee88f9c3597c1f074b`. Retained gate metadata records a clean working tree; this is source execution metadata, not a newly rerun gate claim. Original preflight provenance and historical control IDs remain unchanged. DEPLOY-006 verifies accessibility, integrity and attribution; successor QA must evaluate the assertions and evidence sufficiency. Synthetic presentation remains explicitly labeled and must not be represented as natural Service E2E behavior.

## Successor retrieval procedure

Preferred connector route in the successor environment:

1. Call GitHub `download_workflow_artifact` with `repo_full_name="KhaosMagnus/YU3DOH-Carder"`, `artifact_id=12838688889`, and a ZIP filename.
2. Materialize the returned binary file reference using its returned download URL in that environment. Do not treat the binary as UTF-8 or use repository `fetch_file` to retrieve it. Temporary URLs expire; request a fresh artifact download when needed.
3. Verify the outer artifact size/digest above, extract it, then inspect `raw/` directly. Preserve the original ZIP and metadata.

Equivalent authenticated GitHub CLI/API route:

```bash
gh api /repos/KhaosMagnus/YU3DOH-Carder/actions/artifacts/12838688889/zip > RUN-026-DEPLOY-006-raw-evidence.zip
```

From the download directory, this Python verification uses only the standard library and creates a new extraction directory:

```python
import hashlib, json, pathlib, zipfile
p = pathlib.Path('RUN-026-DEPLOY-006-raw-evidence.zip')
assert p.stat().st_size == 80983126
assert hashlib.sha256(p.read_bytes()).hexdigest() == 'de8e9a82744e04fad9153b1ba4ea65f4a6ed71cf3f0e318e41e75ab4f9030c08'
out = pathlib.Path('RUN-026-DEPLOY-006-inspection')
out.mkdir(exist_ok=False)
with zipfile.ZipFile(p) as z:
    assert z.testzip() is None
    z.extractall(out)
archive = out / 'RUN-026_EVIDENCE.zip'
assert archive.stat().st_size == 22524792
assert hashlib.sha256(archive.read_bytes()).hexdigest() == '7bf9ef2fcaa8284457234b6fcfff229b98650955f19af644b6b17d9f91ba8d3c'
manifest = json.loads((out / 'manifest.json').read_text())
assert manifest['candidate'] == 'e11579950ef7ed20e4b6eeee88f9c3597c1f074b'
assert len(manifest['files']) == 186
for name, expected in manifest['files'].items():
    data = (out / 'raw' / name).read_bytes()
    assert len(data) == expected['bytes'], name
    assert hashlib.sha256(data).hexdigest() == expected['sha256'], name
visuals = json.loads((out / 'visual-inventory.json').read_text())
assert len(visuals) == len(set(visuals)) == 92
for name in visuals:
    assert name in manifest['files'], name
    assert (out / 'raw' / name).read_bytes().startswith(b'\x89PNG\r\n\x1a\n'), name
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for name in z.namelist():
        if not name.endswith('/'):
            assert z.read(name) == (out / 'raw' / name).read_bytes(), name
print('Raw evidence materialized and integrity verified; QA adjudication remains separate.')
```

Authenticated artifact access must remain available to successor QA, and retrieval should occur before the recorded retention expiry. The original frozen ZIP remains in GitHub as the durable source. Successful API download and materialization were demonstrated in this DEPLOY-006 environment, not merely inferred from upload metadata.

## Machine-readable receipts and return

- `validations/RUN-026/DEPLOY-006/transport-verification.json`: exact runner output, all 186 member checks and 92 visual checks, initial/final custody, source and harness identities.
- `validations/RUN-026/DEPLOY-006/retrieval-verification.json`: actual API download/materialization receipt, repeated member checks, original-versus-published byte equality, PNG decode results, artifact digest and final custody.

**RETURN: DEPLOYMENT_VALIDATION / DEPLOY-006 → PROJECT_CONTROL / PC-002.**

Final status: **EVIDENCE ACCESS READY**.

Product mutation: **NONE**. Fallback product rerun: **NONE**. Development correction: **NOT REQUESTED**. Integration: **NOT AUTHORIZED**. Main movement: **NOT AUTHORIZED**. QA verdict authority: **NONE**.

Next route: PC-002 assigns successor independent QA against the same candidate, using the raw artifact and these receipts. DEPLOY-006 does not self-assign QA and does not revise the DQA-005 report.
