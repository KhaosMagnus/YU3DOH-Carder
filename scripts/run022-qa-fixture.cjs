/* Disposable schema-7 Workspace; only the accepted capture is replayed. */
const fs = require('node:fs/promises'),
    path = require('node:path'),
    os = require('node:os');
const { randomUUID, createHash } = require('node:crypto'),
    { execFileSync } = require('node:child_process');
const Database = require('../workspace-server/node_modules/better-sqlite3');
const {
    loadMigrations,
} = require('../workspace-server/dist/src/persistence/migrations');
const {
    WorkspacePersistence,
    configureOperationalDatabase,
} = require('../workspace-server/dist/src/persistence/database');
const {
    CanonicalDomainService,
} = require('../workspace-server/dist/src/canonical/service');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
const {
    publishPackage,
} = require('../workspace-server/dist/src/external-sources/repository');
async function run() {
    const root = await fs.mkdtemp(
        path.join(os.tmpdir(), 'YU3DOH RUN022 UI 日本語 '),
    );
    const manifest = {
        workspace_id: randomUUID(),
        workspace_format_version: 1,
        database_path: 'Data/workspace.db',
        created_at: new Date().toISOString(),
    };
    await fs.writeFile(
        path.join(root, 'workspace.json'),
        JSON.stringify(manifest),
    );
    await fs.mkdir(path.join(root, 'Data'));
    const db = new Database(path.join(root, manifest.database_path));
    for (const m of loadMigrations().filter((m) => m.version <= 7)) {
        db.exec(m.sql);
        db.prepare(
            'INSERT INTO _workspace_migrations(version,name) VALUES (?,?)',
        ).run(m.version, m.name);
        db.pragma(`user_version=${m.version}`);
    }
    db.exec(
        "INSERT INTO canonical_attributes VALUES ('CUSTOM_ATTRIBUTE'); INSERT INTO canonical_races VALUES ('CUSTOM_RACE'); INSERT INTO canonical_link_marker_codes VALUES ('5'),('CUSTOM_MARKER');",
    );
    const persistence = new WorkspacePersistence(
        db,
        configureOperationalDatabase(db),
    );
    const domain = new CanonicalDomainService(persistence);
    let card = domain.createCard({ family: 'MONSTER' });
    card = domain.mutateCard(card.cardId, card.revision, {
        localizations: [
            {
                language: 'EN',
                name: 'RUN022 Library',
                cardText: 'Existing text',
                pendulumText: null,
            },
        ],
    });
    const captured = await fs.readFile(
        path.join(
            __dirname,
            '../workspace-server/test/fixtures/ygoresources-13036-live-v1.json',
        ),
    );
    const historical = JSON.parse(
        await fs.readFile(
            path.join(
                __dirname,
                '../workspace-server/test/fixtures/ygoresources-13036-normalizer-v1.json',
            ),
            'utf8',
        ),
    );
    const rid = randomUUID(),
        cid = randomUUID(),
        doc = 'historical-v1-document',
        timestamp = new Date().toISOString();
    persistence.transaction((db) =>
        publishPackage(
            db,
            randomUUID(),
            {
                retrieval_id: rid,
                source_record_id: randomUUID(),
                source_code: 'YGORESOURCES_CARD_DB',
                external_record_key: '13036',
                target_card_id: card.cardId,
                target_expected_revision: card.revision,
                adapter_version: 1,
                status: 'PARTIAL',
                error_code: null,
                error_message: null,
                retrieved_at: timestamp,
            },
            {
                document_id: doc,
                document_kind: 'CARD_JSON',
                source_ref: 'accepted-capture',
                status: 'SUCCESS',
                http_status: 200,
                content_type: 'application/json',
                payload_hash: createHash('sha256')
                    .update(captured)
                    .digest('hex'),
                raw_payload: captured.toString('utf8'),
                source_cache_revision: null,
                error_code: null,
                error_message: null,
            },
            {
                candidate_id: cid,
                retrieval_id: rid,
                candidate_schema_version: 1,
                normalizer_version: 1,
                candidate: historical.candidate,
                diagnostics: historical.diagnostics,
                created_at: timestamp,
            },
        ),
    );
    persistence.close();
    let mockedCardRequests = 0;
    const service = await createWorkspaceService(
        {
            workspaceRoot: root,
            host: '127.0.0.1',
            port: 4312,
            enabledExternalSources: ['YGORESOURCES_CARD_DB'],
        },
        {
            externalSourceAdapterOptions: {
                fetch: async (url) => {
                    if (
                        String(url) !==
                        'https://db.ygoresources.com/data/card/13036'
                    )
                        throw Error(
                            'Unexpected provider path in deterministic replay',
                        );
                    mockedCardRequests++;
                    return new Response(new Uint8Array(captured), {
                        headers: { 'content-type': 'application/json' },
                    });
                },
            },
        },
    );
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
        encoding: 'utf8',
    }).trim();
    service.app.get('/api/v1/workspace/_qa/info', async () => ({
        sha,
        card_id: card.cardId,
        revision: card.revision,
        historical_retrieval_id: rid,
        historical_candidate_id: cid,
    }));
    service.app.get('/api/v1/workspace/_qa/snapshot', async () => ({
        status: service.status,
        mockedCardRequests,
        providerMetadataRequests: 0,
        liveProviderRequests: 0,
        tables: service.persistence
            ? service.persistence.runRepositoryOperation((db) =>
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
              )
            : null,
    }));
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    console.log(
        JSON.stringify({ ready: true, fixture: 'RUN022', schema: 7, sha }),
    );
    let stopping = false;
    const stop = async () => {
        if (stopping) return;
        stopping = true;
        await service.close();
        await fs.rm(root, { recursive: true, force: true });
        process.exit(0);
    };
    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
