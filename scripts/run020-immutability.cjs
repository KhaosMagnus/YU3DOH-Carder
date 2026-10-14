/* Exact-SHA baseline constraints; output is outside the checkout. */
const assert = require('node:assert/strict'),
    fs = require('node:fs'),
    path = require('node:path'),
    { execFileSync } = require('node:child_process'),
    { createHash } = require('node:crypto');
const base = 'e83de9793c26f78834f748b320161a168943d4ed';
const git = (...args) => execFileSync('git', args);
const sha = git('rev-parse', 'HEAD').toString().trim();
const reviewed = '6caa1204df52aaa7dc811d50dfe5b22cb834555d';
const migration007 =
    'workspace-server/migrations/007_external_source_ingestion.sql';
assert(
    git('show', reviewed + ':' + migration007).equals(
        fs.readFileSync(migration007),
    ),
    'QA correction must preserve migration 007 byte-for-byte',
);
assert.equal(
    git('merge-base', reviewed, sha).toString().trim(),
    reviewed,
    'QA correction must preserve reviewed history',
);
const old = git(
    'ls-tree',
    '-r',
    '--name-only',
    base,
    'workspace-server/migrations',
)
    .toString()
    .trim()
    .split('\n');
const immutable = [
    'package.json',
    'yarn.lock',
    'workspace-server/yarn.lock',
    'workspace-server/src/workspace/types.ts',
    'workspace-server/src/canonical',
    'workspace-server/src/assets',
    'workspace-server/src/managed-assets',
    'workspace-server/src/asset-mutation',
    'workspace-server/src/carder',
    'workspace-server/src/variant-lifecycle',
    'workspace-server/src/recovery',
    'workspace-server/src/workspace/initialization.ts',
    'src/service/workspace-bridge',
    'src/service/use-card.ts',
    ...old,
];
const hashes = {};
const files = git('ls-tree', '-r', '--name-only', base, ...immutable)
    .toString()
    .trim()
    .split('\n');
for (const file of files) {
    const before = git('show', base + ':' + file),
        after = fs.readFileSync(file);
    assert(before.equals(after), 'Frozen file changed: ' + file);
    hashes[file] = createHash('sha256').update(after).digest('hex');
}
const before = JSON.parse(git('show', base + ':workspace-server/package.json')),
    after = JSON.parse(fs.readFileSync('workspace-server/package.json'));
delete before.scripts;
delete after.scripts;
assert.deepEqual(after, before, 'Dependency/package metadata drift');
assert.deepEqual(fs.readdirSync('workspace-server/migrations').sort(), [
    ...old.map((f) => path.basename(f)),
    '007_external_source_ingestion.sql',
]);
assert.match(
    fs.readFileSync('workspace-server/src/persistence/constants.ts', 'utf8'),
    /SUPPORTED_DATABASE_SCHEMA_VERSION\s*=\s*7\b/,
);
assert.match(
    fs.readFileSync('workspace-server/src/workspace/types.ts', 'utf8'),
    /SUPPORTED_WORKSPACE_FORMAT_VERSION\s*=\s*1\b/,
);
assert.equal(git('merge-base', base, sha).toString().trim(), base);
git('diff', '--check');
assert.equal(
    git('status', '--porcelain').toString().trim(),
    '',
    'Candidate must be clean',
);
hashes['workspace-server/migrations/007_external_source_ingestion.sql'] =
    createHash('sha256')
        .update(
            fs.readFileSync(
                'workspace-server/migrations/007_external_source_ingestion.sql',
            ),
        )
        .digest('hex');
const report = {
    run: 'RUN020',
    sha,
    baseline: base,
    correction_baseline: reviewed,
    schema: 7,
    workspace_format: 1,
    production_dependencies: 'UNCHANGED',
    lockfiles: 'BYTE_IDENTICAL',
    immutable_hashes: hashes,
    status: 'PASS',
};
if (process.env.YU3DOH_QA_OUTPUT) {
    fs.mkdirSync(process.env.YU3DOH_QA_OUTPUT, { recursive: true });
    fs.writeFileSync(
        path.join(process.env.YU3DOH_QA_OUTPUT, 'immutability.json'),
        JSON.stringify(report, null, 2),
    );
}
console.log(JSON.stringify(report, null, 2));
