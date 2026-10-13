/* Assert frozen baseline invariants on the exact candidate, without modifying repository files. */
const assert = require('node:assert/strict'),
    fs = require('node:fs'),
    path = require('node:path'),
    { createHash } = require('node:crypto'),
    { execFileSync } = require('node:child_process');
const baseline = '0c94aa7990c227690b5d90e2d73ae892a37930ee';
const git = (...args) => execFileSync('git', args);
const sha = git('rev-parse', 'HEAD').toString().trim();
const migrations = [
    '001_repository_foundation.sql',
    '002_canonical_domain.sql',
    '003_art_variants_asset_index.sql',
    '004_managed_asset_ingest.sql',
    '005_asset_resolution_overrides.sql',
    '006_variant_lifecycle.sql',
];
assert.deepEqual(
    fs.readdirSync('workspace-server/migrations').sort(),
    migrations,
);
const immutable = [
    'package.json',
    'yarn.lock',
    'workspace-server/yarn.lock',
    'workspace-server/src/persistence/constants.ts',
    'workspace-server/src/workspace/types.ts',
    ...migrations.map((n) => 'workspace-server/migrations/' + n),
    ...git(
        'ls-tree',
        '-r',
        '--name-only',
        baseline,
        'workspace-server/src/canonical',
        'workspace-server/src/carder',
        'src/service/workspace-bridge',
        'src/service/use-card.ts',
    )
        .toString()
        .trim()
        .split('\n'),
];
const hashes = {};
for (const file of immutable) {
    const original = git('show', baseline + ':' + file),
        current = fs.readFileSync(file);
    assert(original.equals(current), file + ' changed');
    hashes[file] = createHash('sha256').update(current).digest('hex');
}
const before = JSON.parse(
        git('show', baseline + ':workspace-server/package.json'),
    ),
    after = JSON.parse(fs.readFileSync('workspace-server/package.json'));
delete before.scripts;
delete after.scripts;
assert.deepEqual(
    after,
    before,
    'Workspace dependency/package metadata changes',
);
assert.match(
    fs.readFileSync('workspace-server/src/persistence/constants.ts', 'utf8'),
    /SUPPORTED_DATABASE_SCHEMA_VERSION\s*=\s*6\b/,
);
assert.match(
    fs.readFileSync('workspace-server/src/workspace/types.ts', 'utf8'),
    /SUPPORTED_WORKSPACE_FORMAT_VERSION\s*=\s*1\b/,
);
assert.equal(git('merge-base', baseline, sha).toString().trim(), baseline);
git('diff', '--exit-code');
git('diff', '--check');
assert.equal(
    git('status', '--porcelain').toString().trim(),
    '',
    'Repository must be clean',
);
const report = {
    run: 'RUN018',
    baseline,
    sha,
    schema: 6,
    workspace_format: 1,
    migration007: 'ABSENT',
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
