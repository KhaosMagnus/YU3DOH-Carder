/* RUN021 baseline, domain/write boundary, schema, migration and dependency invariants. */
const assert = require('node:assert/strict'),
    fs = require('node:fs'),
    path = require('node:path');
const { execFileSync } = require('node:child_process'),
    { createHash } = require('node:crypto');
const baseline = '318e310f3a7f475de00bc427b6654192d615486d';
const git = (...args) => execFileSync('git', args);
const sha = git('rev-parse', 'HEAD').toString().trim();
const immutable = [
    'package.json',
    'yarn.lock',
    'workspace-server/yarn.lock',
    'workspace-server/migrations',
    'workspace-server/src/persistence',
    'workspace-server/src/canonical',
    'workspace-server/src/assets',
    'workspace-server/src/managed-assets',
    'workspace-server/src/asset-mutation',
    'workspace-server/src/carder',
    'workspace-server/src/variant-lifecycle',
    'workspace-server/src/recovery',
    'workspace-server/src/workspace/maintenance.ts',
    'workspace-server/src/workspace/types.ts',
    'workspace-server/src/workspace/initialization.ts',
    'workspace-server/src/library/batch-classification.ts',
    'workspace-server/src/library/batch-registry.ts',
    'workspace-server/src/library/canonical-dto.ts',
    'workspace-server/src/external-sources/service.ts',
    'workspace-server/src/external-sources/normalizer.ts',
    'workspace-server/src/external-sources/adapter.ts',
    'workspace-server/src/external-sources/diff.ts',
    'workspace-server/src/external-sources/types.ts',
    'src/service/workspace-bridge',
    'src/service/use-card.ts',
];
const files = git('ls-tree', '-r', '--name-only', baseline, ...immutable)
    .toString()
    .trim()
    .split('\n');
const hashes = {};
for (const file of files) {
    const bytes = fs.readFileSync(file);
    assert(
        bytes.equals(git('show', baseline + ':' + file)),
        'Frozen file changed: ' + file,
    );
    hashes[file] = createHash('sha256').update(bytes).digest('hex');
}
const before = JSON.parse(
        git('show', baseline + ':workspace-server/package.json'),
    ),
    after = JSON.parse(fs.readFileSync('workspace-server/package.json'));
delete before.scripts;
delete after.scripts;
assert.deepEqual(after, before, 'Dependency metadata changed');
const migrations = git(
    'ls-tree',
    '--name-only',
    baseline + ':workspace-server/migrations',
)
    .toString()
    .trim()
    .split('\n')
    .sort();
assert.deepEqual(
    fs.readdirSync('workspace-server/migrations').sort(),
    migrations,
);
assert.equal(migrations.length, 7);
assert(!migrations.some((f) => f.startsWith('008')));
assert.equal(git('merge-base', baseline, sha).toString().trim(), baseline);
assert.equal(
    git('branch', '--show-current').toString().trim(),
    'feature/workspace-run-021',
);
assert.equal(git('status', '--porcelain').toString().trim(), '');
git('diff', '--check');
assert.match(
    fs.readFileSync('workspace-server/src/persistence/constants.ts', 'utf8'),
    /SUPPORTED_DATABASE_SCHEMA_VERSION\s*=\s*7\b/,
);
assert.match(
    fs.readFileSync('workspace-server/src/workspace/types.ts', 'utf8'),
    /SUPPORTED_WORKSPACE_FORMAT_VERSION\s*=\s*1\b/,
);
const acceptance = fs.readFileSync(
    'workspace-server/src/external-sources/acceptance.ts',
    'utf8',
);
assert.doesNotMatch(
    acceptance,
    /from ['"][^'"]*(?:adapter|asset|variant|carder|batch)/i,
);
assert.doesNotMatch(acceptance, /\.transaction\s*\(/);
assert.equal((acceptance.match(/\.mutateCard\(/g) || []).length, 1);
const report = {
    run: 'RUN021',
    sha,
    baseline,
    schema: 7,
    workspace_format: 1,
    migration_008: 'ABSENT',
    migrations,
    dependency_changes: 'NONE',
    lockfile_changes: 'NONE',
    ingestion_read_only: 'PRESERVED BYTE_IDENTICAL',
    canonical_domain: 'BYTE_IDENTICAL',
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
