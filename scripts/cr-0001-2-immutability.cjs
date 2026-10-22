/* CR-0001.2 bounded footprint and version proof, against the frozen code baseline. */
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path");
const { execFileSync } = require("node:child_process");
const baseline = "4c9b0228bb47ac074c49a977b48dbf0844c33a94";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const sha = git("rev-parse", "HEAD");
const allowed = new Set([
  "workspace-server/src/canonical/validation.ts",
  "workspace-server/src/canonical/service.ts",
  "workspace-server/src/external-sources/structure-result.ts",
  "src/library/editor-state.ts",
  "src/library/editor-form.tsx",
  "src/library/detail-panel.tsx",
  "scripts/test-library-client.ts",
  "workspace-server/test/canonical-domain.test.ts",
  "workspace-server/test/confirmation-review.test.ts",
  "workspace-server/test/carder-write-back.test.ts",
  "workspace-server/test/structure-acceptance.test.ts",
  "scripts/cr-0001-2-qa-fixture.cjs",
  "scripts/cr-0001-2-ui-evidence.cjs",
  "scripts/cr-0001-2-operational-qa.cjs",
  "scripts/cr-0001-2-immutability.cjs",
]);
assert.equal(
  git("branch", "--show-current"),
  "feature/workspace-cr-0001-2-level-rank-domain",
);
assert.equal(git("merge-base", baseline, "HEAD"), baseline);
assert.equal(git("rev-list", "--merges", baseline + "..HEAD"), "");
assert.equal(git("status", "--porcelain"), "");
const files = git("diff", "--name-only", baseline, "HEAD").split("\n");
for (const file of files)
  assert(allowed.has(file), "Unauthorized change: " + file);
const contents = (file) => fs.readFileSync(file, "utf8");
assert.match(
  contents("workspace-server/src/persistence/constants.ts"),
  /SUPPORTED_DATABASE_SCHEMA_VERSION = 8;/,
);
assert.match(
  contents("workspace-server/src/workspace/types.ts"),
  /SUPPORTED_WORKSPACE_FORMAT_VERSION = 1;/,
);
assert.match(
  contents("workspace-server/src/external-sources/normalizer.ts"),
  /NORMALIZER_VERSION = 2;/,
);
assert.match(
  contents("workspace-server/src/external-sources/normalizer.ts"),
  /candidate_schema_version: 1,/,
);
const migrations = fs
  .readdirSync("workspace-server/migrations")
  .filter((f) => f.endsWith(".sql"))
  .sort();
assert.equal(migrations.length, 8);
assert.deepEqual(
  migrations.map((f) => f.slice(0, 3)),
  ["001", "002", "003", "004", "005", "006", "007", "008"],
);
// The exhaustive allowlist also proves no dependency, lockfile, workflow, renderer,
// normalizer, schema, migration, bridge, protocol or deferred-feature changes.
const proof = {
  sha,
  baseline,
  branch: git("branch", "--show-current"),
  files,
  migrations,
  schema: 8,
  workspace_format: 1,
  normalizer_version: 2,
  candidate_schema_version: 1,
  result: "PASS",
};
console.log(JSON.stringify(proof, null, 2));
if (process.env.YU3DOH_QA_OUTPUT) {
  fs.mkdirSync(process.env.YU3DOH_QA_OUTPUT, { recursive: true });
  fs.writeFileSync(
    path.join(process.env.YU3DOH_QA_OUTPUT, "immutability.json"),
    JSON.stringify(proof, null, 2),
  );
}
