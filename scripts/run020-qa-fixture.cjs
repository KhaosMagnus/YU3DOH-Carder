/* Deterministic UI fixture: mock HTTPS provider, disposable Workspace, no production QA routes. */
const fs = require('node:fs/promises'),
    path = require('node:path'),
    os = require('node:os'),
    { execFileSync } = require('node:child_process');
const {
    bootstrapWorkspaceDatabase,
} = require('../workspace-server/dist/src/persistence/operations');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
async function run() {
    const root = await fs.mkdtemp(
        path.join(os.tmpdir(), 'YU3DOH RUN020 UI 日本語 '),
    );
    const manifest = {
        workspace_id: 'run020-ui-fixture',
        workspace_format_version: 1,
        database_path: 'Data/workspace.db',
        created_at: new Date().toISOString(),
    };
    await fs.writeFile(
        path.join(root, 'workspace.json'),
        JSON.stringify(manifest),
    );
    bootstrapWorkspaceDatabase(root, manifest);
    let remoteRequests = 0;
    const fixture = JSON.parse(
        await fs.readFile(
            'workspace-server/test/fixtures/ygoresources-card-v1.json',
            'utf8',
        ),
    );
    fixture.cardData.en.name =
        '<img src="https://example.invalid/remote" onerror="window.REMOTE_EXECUTED=true">';
    fixture.cardData.en.effectText =
        '<script>window.REMOTE_EXECUTED=true</script>';
    const service = await createWorkspaceService(
        {
            workspaceRoot: root,
            host: '127.0.0.1',
            port: 4312,
            enabledExternalSources: ['YGORESOURCES_CARD_DB'],
        },
        {
            externalSourceAdapterOptions: {
                fetch: async (url, init) => {
                    remoteRequests++;
                    if (
                        String(url) !==
                            'https://db.ygoresources.com/data/card/17625' ||
                        init.method !== 'GET' ||
                        init.redirect !== 'manual'
                    )
                        throw new Error(
                            'Fixture provider request contract violated',
                        );
                    return new Response(JSON.stringify(fixture), {
                        headers: {
                            'content-type': 'application/json',
                            'x-cache-revision': '123456',
                        },
                    });
                },
            },
        },
    );
    let card = service.canonical.createCard({
        family: 'SPELL',
        password: '20000001',
    });
    card = service.canonical.mutateCard(card.cardId, card.revision, {
        structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
        localizations: [
            {
                language: 'EN',
                name: 'RUN020 Library',
                cardText: 'Persisted Canonical text',
                pendulumText: null,
            },
        ],
    });
    const snapshot = () =>
        service.persistence.runRepositoryOperation((db) =>
            Object.fromEntries(
                db
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
                    )
                    .all()
                    .map(({ name }) => [
                        name,
                        db.prepare(`SELECT * FROM "${name}"`).all(),
                    ]),
            ),
        );
    const info = {
        sha: execFileSync('git', ['rev-parse', 'HEAD'], {
            encoding: 'utf8',
        }).trim(),
        root,
        card,
    };
    service.app.get('/api/v1/workspace/_qa/info', async () => info);
    service.app.get('/api/v1/workspace/_qa/snapshot', async () => ({
        tables: snapshot(),
        remoteRequests,
    }));
    service.app.post('/api/v1/workspace/_qa/change', async () => {
        const current = service.canonical.getCard(card.cardId);
        return service.canonical.mutateCard(card.cardId, current.revision, {
            password: '20000002',
        });
    });
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    const stop = async () => {
        await service.close();
        await fs.rm(root, { recursive: true, force: true });
    };
    process.once('SIGTERM', () => stop().finally(() => process.exit(0)));
    process.once('SIGINT', () => stop().finally(() => process.exit(0)));
    console.log(JSON.stringify({ ready: true, ...info }));
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
