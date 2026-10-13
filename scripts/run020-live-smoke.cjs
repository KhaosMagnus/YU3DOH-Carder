/* Explicit, bounded operational smoke. Never used by normal CI; no retries or enumeration. */
const assert = require('node:assert/strict'),
    fs = require('node:fs/promises'),
    os = require('node:os'),
    path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const {
    bootstrapWorkspaceDatabase,
} = require('../workspace-server/dist/src/persistence/operations');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
const ids = process.argv.slice(2);
if (
    !ids.length ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !['4007', '11213', '13036', '17625'].includes(id))
)
    throw new Error(
        'Explicitly select a unique subset of 4007 11213 13036 17625.',
    );
if (!process.env.YU3DOH_QA_OUTPUT)
    throw new Error(
        'YU3DOH_QA_OUTPUT must name an evidence directory outside the checkout.',
    );
async function run() {
    const root = await fs.mkdtemp(
        path.join(os.tmpdir(), 'YU3DOH RUN020 live 日本語 '),
    );
    const output = path.resolve(process.env.YU3DOH_QA_OUTPUT);
    const checkout = path.resolve(__dirname, '..');
    if (output === checkout || output.startsWith(checkout + path.sep))
        throw new Error('Live evidence must be outside the checkout.');
    await fs.mkdir(output, { recursive: true });
    const manifest = {
        workspace_id: 'run020-live-smoke',
        workspace_format_version: 1,
        database_path: 'Data/workspace.db',
        created_at: new Date().toISOString(),
    };
    await fs.writeFile(
        path.join(root, 'workspace.json'),
        JSON.stringify(manifest),
    );
    bootstrapWorkspaceDatabase(root, manifest);
    const transportFailures = [];
    const service = await createWorkspaceService(
        {
            workspaceRoot: root,
            host: '127.0.0.1',
            port: 4312,
            enabledExternalSources: ['YGORESOURCES_CARD_DB'],
        },
        {
            externalSourceAdapterOptions: {
                fetch: async (...args) => {
                    try {
                        return await fetch(...args);
                    } catch (error) {
                        const safeCode = (value) =>
                            typeof value === 'string' &&
                            /^[A-Z0-9_]{1,80}$/.test(value)
                                ? value
                                : null;
                        transportFailures.push({
                            code: safeCode(error.code),
                            cause_code: safeCode(error.cause?.code),
                        });
                        throw error;
                    }
                },
            },
        },
    );
    const cards = ids.map((id) => ({
        id,
        card: service.canonical.createCard({
            family: id === '17625' ? 'SPELL' : 'MONSTER',
        }),
    }));
    const snapshot = () =>
        service.persistence.runRepositoryOperation((db) =>
            Object.fromEntries(
                db
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'external_source_%' AND name NOT LIKE 'sqlite_%' ORDER BY name",
                    )
                    .all()
                    .map(({ name }) => [
                        name,
                        db.prepare(`SELECT * FROM "${name}"`).all(),
                    ]),
            ),
        );
    const before = snapshot();
    const evidence = [];
    try {
        for (const { id, card } of cards) {
            const start = new Date().toISOString();
            const response = await service.app.inject({
                method: 'POST',
                url: '/api/v1/library/external-sources/ygoresources/retrieve',
                payload: {
                    target_card_id: card.cardId,
                    target_expected_revision: card.revision,
                    external_card_id: id,
                },
            });
            const history = service.externalSourceIngestion.history(
                card.cardId,
            ).retrievals;
            const stored = history.length
                ? service.externalSourceIngestion.detail(
                      history[0].retrieval_id,
                      true,
                  )
                : null;
            if (
                stored?.document.raw_payload !== null &&
                stored?.document.raw_payload !== undefined
            )
                await fs.writeFile(
                    path.join(output, id + '.json'),
                    stored.document.raw_payload,
                );
            await fs.writeFile(
                path.join(output, id + '-retrieval.json'),
                JSON.stringify(stored, null, 2),
            );
            evidence.push({
                id,
                started_at: start,
                http_status: response.statusCode,
                result: response.json(),
                document: stored
                    ? { ...stored.document, raw_payload: undefined }
                    : null,
            });
            console.log(
                JSON.stringify({
                    id,
                    http_status: response.statusCode,
                    retrieval_status: stored?.retrieval.status,
                    error: stored?.retrieval.error_code,
                    english_keys: stored?.document.raw_payload
                        ? Object.keys(
                              JSON.parse(stored.document.raw_payload).cardData
                                  ?.en ?? {},
                          )
                        : [],
                }),
            );
        }
        assert.deepEqual(
            snapshot(),
            before,
            'Live source ingestion changed an authoritative domain',
        );
        const hashes = {};
        for (const file of ['adapter.ts', 'normalizer.ts', 'service.ts'])
            hashes[file] = createHash('sha256')
                .update(
                    await fs.readFile(
                        path.join(
                            'workspace-server/src/external-sources',
                            file,
                        ),
                    ),
                )
                .digest('hex');
        await fs.writeFile(
            path.join(output, 'evidence.json'),
            JSON.stringify(
                {
                    run: 'RUN020',
                    sha: execFileSync('git', ['rev-parse', 'HEAD'], {
                        encoding: 'utf8',
                    }).trim(),
                    explicit_ids: ids,
                    maximum_requests_per_id: 1,
                    retries: 0,
                    authoritative_domains_unchanged: true,
                    code_hashes: hashes,
                    results: evidence,
                    transport_failures: transportFailures,
                },
                null,
                2,
            ),
        );
        if (evidence.some((x) => x.http_status !== 200)) process.exitCode = 1;
    } finally {
        await service.close();
        await fs.rm(root, { recursive: true, force: true });
    }
}
run().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
});
