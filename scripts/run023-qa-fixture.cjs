/* Disposable persisted source evidence. Any provider request is an error. */
const fs = require('node:fs/promises'),
    path = require('node:path'),
    os = require('node:os');
const { randomUUID, createHash } = require('node:crypto'),
    { execFileSync } = require('node:child_process');
const {
    bootstrapWorkspaceDatabase,
} = require('../workspace-server/dist/src/persistence/operations');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
const {
    normalizeYgoResources,
} = require('../workspace-server/dist/src/external-sources/normalizer');
const {
    publishPackage,
} = require('../workspace-server/dist/src/external-sources/repository');
async function run() {
    const root = await fs.mkdtemp(
            path.join(os.tmpdir(), 'YU3DOH RUN023 UI 日本語 '),
        ),
        manifest = {
            workspace_id: randomUUID(),
            workspace_format_version: 1,
            database_path: 'Data/workspace.db',
            created_at: new Date().toISOString(),
        };
    await fs.writeFile(
        path.join(root, 'workspace.json'),
        JSON.stringify(manifest),
    );
    bootstrapWorkspaceDatabase(root, manifest);
    let providerRequests = 0,
        previewCalls = 0,
        applyCalls = 0,
        mutateCalls = 0,
        lastMutation = null;
    const service = await createWorkspaceService(
        { workspaceRoot: root, host: '127.0.0.1', port: 4312 },
        {
            externalSourceAdapterOptions: {
                fetch: async () => {
                    providerRequests++;
                    throw Error('RUN023 provider access forbidden');
                },
            },
        },
    );
    const capture = await fs.readFile(
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
    const cases = {};
    for (const key of ['Mixed', 'Blocked', 'No-op', 'Token', 'V1']) {
        const family = key === 'Token' ? 'TOKEN' : 'MONSTER';
        let card = service.canonical.createCard({
            family,
            password: family === 'TOKEN' ? null : '12345678',
        });
        let current = {
            kind: 'MONSTER',
            summonKind: 'MAIN_DECK',
            attributeCode: 'LIGHT',
            raceCode: 'DRAGON',
            level: 4,
            rank: null,
            atk: 1000,
            def: 1000,
            pendulumScale: key === 'Mixed' ? 0 : null,
            abilities: key === 'Mixed' ? ['EFFECT', 'PENDULUM'] : ['EFFECT'],
            linkMarkers: [],
        };
        if (key === 'No-op')
            current = {
                ...current,
                summonKind: 'LINK',
                attributeCode: 'DARK',
                raceCode: 'CYBERSE',
                level: null,
                def: null,
                atk: 2300,
                linkMarkers: ['2', '7', '9'],
            };
        if (key === 'Token')
            current = {
                kind: 'TOKEN',
                attributeCode: 'LIGHT',
                raceCode: 'DRAGON',
                level: 4,
                atk: 0,
                def: 0,
            };
        const confirmed =
            key === 'Mixed' || key === 'No-op'
                ? ['STRUCTURE']
                : key === 'Blocked'
                  ? ['TEXT:EN', 'TEXT:ES']
                  : [];
        card = service.canonical.mutateCard(card.cardId, card.revision, {
            structure: current,
            localizations: ['EN', 'ES', 'JP'].map((language) => ({
                language,
                name:
                    language === 'EN'
                        ? 'RUN023 ' + key
                        : 'Existing ' + language,
                cardText: 'Existing text',
                pendulumText: null,
            })),
            confirmations: confirmed.map((block) => ({
                block,
                state: 'CONFIRMED',
                provenance: {
                    sourceKind: 'MANUAL',
                    sourceRef: 'fixture-confirmation',
                },
            })),
        });
        const rid = randomUUID(),
            cid = randomUUID(),
            did = key === 'V1' ? 'historical-v1-document' : randomUUID(),
            timestamp = new Date().toISOString();
        let raw = capture,
            payload = JSON.parse(capture.toString('utf8'));
        if (key === 'Blocked') {
            payload.cardData.en = {
                name: 'Source Pendulum',
                effectText: 'Source text',
                cardType: 'Monster',
                summonKind: 'Main Deck',
                attribute: 'LIGHT',
                race: 'Dragon',
                level: 4,
                atk: 1200,
                def: 1000,
                abilities: ['Effect', 'Pendulum'],
                pendulumScale: 0,
            };
            raw = Buffer.from(JSON.stringify(payload));
        }
        if (key === 'Token') {
            payload.cardData.en = {
                name: 'Source token',
                effectText: 'Source token text',
                cardType: 'Token',
            };
            raw = Buffer.from(JSON.stringify(payload));
        }
        const n =
            key === 'V1'
                ? historical
                : normalizeYgoResources(payload, '13036', did);
        const recordId = randomUUID();
        service.persistence.transaction((db) =>
            publishPackage(
                db,
                recordId,
                {
                    retrieval_id: rid,
                    source_record_id: recordId,
                    source_code: 'YGORESOURCES_CARD_DB',
                    external_record_key: '13036',
                    target_card_id: card.cardId,
                    target_expected_revision: card.revision,
                    adapter_version: 1,
                    status: n.status,
                    error_code: null,
                    error_message: null,
                    retrieved_at: timestamp,
                },
                {
                    document_id: did,
                    document_kind: 'CARD_JSON',
                    source_ref: 'frozen-disposable-evidence',
                    status: 'SUCCESS',
                    http_status: 200,
                    content_type: 'application/json',
                    payload_hash: createHash('sha256')
                        .update(raw)
                        .digest('hex'),
                    raw_payload: raw.toString('utf8'),
                    source_cache_revision: null,
                    error_code: null,
                    error_message: null,
                },
                {
                    candidate_id: cid,
                    retrieval_id: rid,
                    candidate_schema_version: 1,
                    normalizer_version: key === 'V1' ? 1 : 2,
                    candidate: n.candidate,
                    diagnostics: n.diagnostics,
                    created_at: timestamp,
                },
            ),
        );
        cases[key] = {
            card_id: card.cardId,
            revision: card.revision,
            candidate_id: cid,
            retrieval_id: rid,
        };
    }
    const mutate = service.canonical.mutateCard.bind(service.canonical);
    Object.defineProperty(service.canonical, 'mutateCard', {
        configurable: true,
        value: (...args) => {
            mutateCalls++;
            lastMutation = args[2];
            return mutate(...args);
        },
    });
    service.app.addHook('onRequest', async (request) => {
        if (request.url.endsWith('/preview-structure')) previewCalls++;
        if (request.url.endsWith('/apply-structure')) applyCalls++;
    });
    service.app.get('/api/v1/workspace/_qa/info', async () => ({
        sha: execFileSync('git', ['rev-parse', 'HEAD'], {
            encoding: 'utf8',
        }).trim(),
        cases,
    }));
    service.app.get('/api/v1/workspace/_qa/snapshot', async () => ({
        providerRequests,
        previewCalls,
        applyCalls,
        mutateCalls,
        lastMutation,
        tables: service.persistence.runRepositoryOperation((db) =>
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
        ),
    }));
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    console.log(JSON.stringify({ ready: true, fixture: 'RUN023', cases }));
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
