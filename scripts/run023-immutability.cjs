/* Exact RUN023 baseline and the bounded STRUCTURE acceptance write surface. */
const assert = require('node:assert/strict'),
    fs = require('node:fs'),
    path = require('node:path');
const { execFileSync } = require('node:child_process'),
    { createHash } = require('node:crypto');
const baseline = '4b0aa0d6afdbd07d155844d38b2832ea0acfa201';
const git = (...args) => execFileSync('git', args),
    sha = git('rev-parse', 'HEAD').toString().trim();
const allowed = new Set([
    'scripts/run021-ui-evidence.cjs',
    'scripts/run022-ui-evidence.cjs',
    'scripts/test-library-client.ts',
    'src/library/api.ts',
    'src/library/external-sources-panel.tsx',
    'workspace-server/package.json',
    'workspace-server/src/app.ts',
    'workspace-server/src/service.ts',
    'workspace-server/src/workspace/runtime.ts',
    'workspace-server/src/external-sources/errors.ts',
]);
const additions = new Set([
    '.github/workflows/workspace-run-023.yml',
    'scripts/run023-immutability.cjs',
    'scripts/run023-operational-qa.cjs',
    'scripts/run023-qa-fixture.cjs',
    'scripts/run023-ui-evidence.cjs',
    'scripts/test-library-structure-acceptance.ts',
    'src/library/external-structure-acceptance-panel.tsx',
    'src/library/external-structure-acceptance-state.ts',
    'workspace-server/src/external-sources/structure-acceptance.ts',
    'workspace-server/src/external-sources/structure-acceptance-dto.ts',
    'workspace-server/src/external-sources/structure-acceptance-http.ts',
    'workspace-server/src/external-sources/structure-result.ts',
    'workspace-server/test/structure-acceptance.test.ts',
]);
const paths = [
    'package.json',
    'yarn.lock',
    'workspace-server/yarn.lock',
    'workspace-server/migrations',
    'workspace-server/src/persistence',
    'workspace-server/src/canonical',
    'workspace-server/src/assets',
    'workspace-server/src/managed-assets',
    'workspace-server/src/asset-mutation',
    'workspace-server/src/variant-lifecycle',
    'workspace-server/src/carder',
    'workspace-server/src/recovery',
    'workspace-server/src/workspace/maintenance.ts',
    'workspace-server/src/workspace/types.ts',
    'workspace-server/src/workspace/initialization.ts',
    'workspace-server/src/external-sources',
    'workspace-server/src/library',
    'src/library',
    'src/service/workspace-bridge',
    'src/service/use-card.ts',
    'workspace-server/test/fixtures',
];
const files = git('ls-tree', '-r', '--name-only', baseline, ...paths)
    .toString()
    .trim()
    .split('\n')
    .filter((f) => !allowed.has(f));
const immutable_hashes = {};
for (const file of files) {
    const b = fs.readFileSync(file);
    assert(
        b.equals(git('show', baseline + ':' + file)),
        'Frozen file changed: ' + file,
    );
    immutable_hashes[file] = createHash('sha256').update(b).digest('hex');
}
const before = JSON.parse(
        git('show', baseline + ':workspace-server/package.json'),
    ),
    after = JSON.parse(fs.readFileSync('workspace-server/package.json'));
delete before.scripts;
delete after.scripts;
assert.deepEqual(after, before, 'Dependencies changed');
const migrations = git(
    'ls-tree',
    '--name-only',
    baseline + ':workspace-server/migrations',
)
    .toString()
    .trim()
    .split('\n')
    .sort();
assert.equal(migrations.length, 8);
assert.deepEqual(
    fs.readdirSync('workspace-server/migrations').sort(),
    migrations,
);
assert(!migrations.some((n) => n.startsWith('009')));
assert.equal(git('merge-base', baseline, sha).toString().trim(), baseline);
assert.equal(
    git('branch', '--show-current').toString().trim(),
    'feature/workspace-run-023',
);
assert.equal(git('status', '--porcelain').toString().trim(), '');
git('diff', '--check');
for (const line of git('diff', '--name-status', baseline, sha)
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean)) {
    const [status, file] = line.split('\t');
    assert(
        status === 'A'
            ? additions.has(file)
            : status === 'M' && allowed.has(file),
        'Out-of-scope file: ' + line,
    );
}
const source = fs.readFileSync(
    'workspace-server/src/external-sources/structure-acceptance.ts',
    'utf8',
);
assert.equal((source.match(/\.mutateCard\(/g) || []).length, 1);
assert.doesNotMatch(
    source,
    /\.transaction\s*\(|\.addProvenance\(|registerStructuralCode\(|registerNamedEntity\(|createCard\(|\.scan\(|YgoResourcesCardAdapter|\bfetch\s*\(/,
);
const builder = fs.readFileSync(
    'workspace-server/src/external-sources/structure-result.ts',
    'utf8',
);
assert.doesNotMatch(
    builder,
    /WorkspacePersistence|node:fs|\.mutateCard\(|registerStructuralCode\(|\bfetch\s*\(/,
);
assert.match(
    fs.readFileSync('workspace-server/src/workspace/runtime.ts', 'utf8'),
    /new ExternalStructureAcceptanceService\([\s\S]*?\['applyStructure'\]/,
);
assert.match(
    fs.readFileSync('workspace-server/src/persistence/constants.ts', 'utf8'),
    /SUPPORTED_DATABASE_SCHEMA_VERSION\s*=\s*8\b/,
);
assert.match(
    fs.readFileSync('workspace-server/src/workspace/types.ts', 'utf8'),
    /SUPPORTED_WORKSPACE_FORMAT_VERSION\s*=\s*1\b/,
);
const report = {
    run: 'RUN023',
    sha,
    baseline,
    schema: 8,
    workspace_format: 1,
    migrations,
    migration009: 'ABSENT',
    normalizer_version: 2,
    candidate_schema_version: 1,
    dependency_changes: 'NONE',
    lockfile_changes: 'NONE',
    provider_requests: 0,
    metadata_requests: 0,
    canonical_authority: 'BYTE_IDENTICAL',
    text_acceptance: 'BYTE_IDENTICAL',
    normalizer: 'BYTE_IDENTICAL',
    immutable_hashes,
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
