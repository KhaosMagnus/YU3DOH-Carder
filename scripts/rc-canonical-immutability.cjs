/* RC correction: enforce the exact baseline and the bounded authorized footprint. */
const assert = require('node:assert/strict'),
    fs = require('node:fs'),
    path = require('node:path');
const { execFileSync } = require('node:child_process'),
    { createHash } = require('node:crypto');
const baseline = 'c929a6020760525d5cf6daf695b2f44c1d3cd1ca';
const git = (...args) => execFileSync('git', args);
const sha = git('rev-parse', 'HEAD').toString().trim();
const allowed = new Set([
    'workspace-server/src/app.ts',
    'workspace-server/src/canonical/validation.ts',
    'src/library/editor-form.tsx',
    'src/library/editor-state.ts',
    'scripts/test-library-client.ts',
    'workspace-server/package.json',
    'workspace-server/test/structure-acceptance.test.ts',
]);
const additions = new Set([
    '.github/workflows/workspace-rc-canonical-null-zero.yml',
    'workspace-server/test/rc-canonical-null-zero.test.ts',
    'scripts/test-rc-canonical-editor.ts',
    'scripts/rc-canonical-qa-fixture.cjs',
    'scripts/rc-canonical-ui-evidence.cjs',
    'scripts/rc-canonical-operational-qa.cjs',
    'scripts/rc-canonical-immutability.cjs',
]);
assert.equal(
    git('branch', '--show-current').toString().trim(),
    'fix/workspace-rc-canonical-null-zero',
);
assert.equal(git('merge-base', baseline, sha).toString().trim(), baseline);
assert.equal(git('status', '--porcelain').toString().trim(), '');
git('diff', '--check');
for (const line of git('diff', '--name-status', baseline, sha)
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean)) {
    const [status, file] = line.split('\t');
    assert(
        status === 'M'
            ? allowed.has(file)
            : status === 'A' && additions.has(file),
        'Out-of-scope file ' + line,
    );
}
const protectedPaths = [
    'package.json',
    'yarn.lock',
    'workspace-server/yarn.lock',
    'workspace-server/migrations',
    'workspace-server/src',
    'src/library',
    'src/service/workspace-bridge',
    'src/model/link.tsx',
    'src/draw/predefined-section/layout.ts',
    'workspace-server/test/fixtures',
];
const immutable_hashes = {};
for (const file of git(
    'ls-tree',
    '-r',
    '--name-only',
    baseline,
    ...protectedPaths,
)
    .toString()
    .trim()
    .split('\n')
    .filter((f) => !allowed.has(f))) {
    const b = fs.readFileSync(file);
    assert(
        b.equals(git('show', baseline + ':' + file)),
        'Protected file changed ' + file,
    );
    immutable_hashes[file] = createHash('sha256').update(b).digest('hex');
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
assert.equal(migrations.length, 8);
assert.deepEqual(
    fs.readdirSync('workspace-server/migrations').sort(),
    migrations,
);
assert(!migrations.some((n) => n.startsWith('009')));
assert.match(
    fs.readFileSync('workspace-server/src/persistence/constants.ts', 'utf8'),
    /SUPPORTED_DATABASE_SCHEMA_VERSION = 8;/,
);
assert.match(
    fs.readFileSync('workspace-server/src/workspace/types.ts', 'utf8'),
    /SUPPORTED_WORKSPACE_FORMAT_VERSION = 1;/,
);
const oldApp = git(
        'show',
        baseline + ':workspace-server/src/app.ts',
    ).toString(),
    newApp = fs.readFileSync('workspace-server/src/app.ts', 'utf8');
const ajv = (s) => s.match(/ajv:\s*\{[\s\S]*?\n        \}/)?.[0];
assert(ajv(oldApp));
assert.equal(ajv(newApp), ajv(oldApp), 'Global Ajv configuration changed');
const oldValidation = git(
        'show',
        baseline + ':workspace-server/src/canonical/validation.ts',
    ).toString(),
    newValidation = fs.readFileSync(
        'workspace-server/src/canonical/validation.ts',
        'utf8',
    );
assert.equal(
    newValidation.slice(
        newValidation.indexOf(
            'export const assertConfirmedBlocksExplicitlyTransitioned',
        ),
    ),
    oldValidation.slice(
        oldValidation.indexOf(
            'export const assertConfirmedBlocksExplicitlyTransitioned',
        ),
    ),
    'Confirmed validation changed',
);
const report = {
    sha,
    baseline,
    branch: 'fix/workspace-rc-canonical-null-zero',
    schema: 8,
    workspace_format: 1,
    migrations,
    migration009: 'ABSENT',
    dependencies: 'UNCHANGED',
    lockfiles: 'UNCHANGED',
    normalizer: 2,
    candidate_schema: 1,
    adapter_version: 1,
    canonical_confirmed_validation: 'UNCHANGED',
    global_ajv_configuration: 'UNCHANGED',
    immutable_hashes,
};
const out = process.env.YU3DOH_QA_OUTPUT;
if (out) {
    fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(
        path.join(out, 'rc-immutability.json'),
        JSON.stringify(report, null, 2),
    );
}
console.log(
    'RC immutability PASS exact SHA ' +
        sha +
        ' protected files ' +
        Object.keys(immutable_hashes).length,
);
