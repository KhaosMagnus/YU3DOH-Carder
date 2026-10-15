/* RUN022 baseline, domain/write boundary, schema, migration and dependency invariants. */
const assert = require('node:assert/strict'),
    fs = require('node:fs'),
    path = require('node:path');
const { execFileSync } = require('node:child_process'),
    { createHash } = require('node:crypto');
const baseline = 'ec838d9ea0626d52e133937fb790150575ab623e';
const git = (...args) => execFileSync('git', args);
const sha = git('rev-parse', 'HEAD').toString().trim();
const immutable = [
    'package.json',
    'yarn.lock',
    'workspace-server/yarn.lock',
    'workspace-server/migrations',
    ...['database.ts', 'inspect.ts', 'migrations.ts', 'operations.ts'].map(
        (f) => 'workspace-server/src/persistence/' + f,
    ),
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
    'workspace-server/src/external-sources/adapter.ts',
    'workspace-server/src/external-sources/diff.ts',
    'workspace-server/src/external-sources/types.ts',
    'src/service/workspace-bridge',
    'src/service/use-card.ts',
    'workspace-server/src/external-sources/acceptance.ts',
    'workspace-server/src/external-sources/acceptance-dto.ts',
    'workspace-server/src/external-sources/acceptance-http.ts',
    'workspace-server/test/fixtures/ygoresources-13036-live-v1.json',
    'src/library',
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
    [...migrations, '008_standard_structural_registry_baseline.sql'].sort(),
);
assert.equal(migrations.length, 7);
assert.equal(git('merge-base', baseline, sha).toString().trim(), baseline);
assert.equal(
    git('branch', '--show-current').toString().trim(),
    'feature/workspace-run-022',
);
assert.equal(git('status', '--porcelain').toString().trim(), '');
git('diff', '--check');
assert.match(
    fs.readFileSync('workspace-server/src/persistence/constants.ts', 'utf8'),
    /SUPPORTED_DATABASE_SCHEMA_VERSION\s*=\s*8\b/,
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

const ingestionFile = 'workspace-server/src/external-sources/service.ts';
const expectedIngestion = git('show', baseline + ':' + ingestionFile)
    .toString()
    .replace(
        'import { normalizeYgoResources }',
        'import { normalizeYgoResources, NORMALIZER_VERSION }',
    )
    .replace(
        'normalizer_version: 1,',
        'normalizer_version: NORMALIZER_VERSION,',
    );
assert.equal(fs.readFileSync(ingestionFile, 'utf8'), expectedIngestion);
const seed = fs.readFileSync(
    'workspace-server/migrations/008_standard_structural_registry_baseline.sql',
    'utf8',
);
assert.doesNotMatch(
    seed,
    /\b(?:DELETE|UPDATE|DROP|ALTER|BEGIN|COMMIT|ROLLBACK|PRAGMA|_workspace_migrations)\b/i,
);
assert.equal((seed.match(/INSERT OR IGNORE/g) || []).length, 3);
assert.doesNotMatch(seed, /\('5'\)/);
for (const file of ['normalizer.ts', 'structure-v2.ts']) {
    const source = fs.readFileSync(
        'workspace-server/src/external-sources/' + file,
        'utf8',
    );
    assert.doesNotMatch(
        source,
        /mutateCard|registerStructuralCode|registerNamedEntity|createCard|\bfetch\s*\(/,
    );
}

const report = {
    run: 'RUN022',
    sha,
    baseline,
    schema: 8,
    workspace_format: 1,
    migration_008: createHash('sha256')
        .update(
            fs.readFileSync(
                'workspace-server/migrations/008_standard_structural_registry_baseline.sql',
            ),
        )
        .digest('hex'),
    migrations: [
        ...migrations,
        '008_standard_structural_registry_baseline.sql',
    ],
    dependency_changes: 'NONE',
    lockfile_changes: 'NONE',
    ingestion_read_only: 'PRESERVED; normalizer version publication only',
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
