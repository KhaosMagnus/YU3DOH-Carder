/* Disposable stored-candidate fixtures. Provider transport is forbidden. */
const fs = require('node:fs/promises'),
    os = require('node:os'),
    path = require('node:path');
const { randomUUID, createHash } = require('node:crypto'),
    { execFileSync } = require('node:child_process');
const {
    bootstrapWorkspaceDatabase,
} = require('../workspace-server/dist/src/persistence/operations');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
const {
    publishPackage,
} = require('../workspace-server/dist/src/external-sources/repository');
async function run() {
    const root = await fs.mkdtemp(
        path.join(os.tmpdir(), 'YU3DOH RUN021 UI 日本語 '),
    );
    const manifest = {
        workspace_id: 'run021-disposable',
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
        applyCalls = 0;
    const service = await createWorkspaceService(
        { workspaceRoot: root, host: '127.0.0.1', port: 4312 },
        {
            externalSourceAdapterOptions: {
                fetch: async () => {
                    providerRequests++;
                    throw Error('RUN021 provider access forbidden');
                },
            },
        },
    );
    const cases = {};
    for (const key of ['Mixed', 'No-op', 'Pendulum', 'Conflict']) {
        let card = service.canonical.createCard({
            family: key === 'Pendulum' ? 'MONSTER' : 'SPELL',
            password: key === 'Pendulum' ? null : '21000001',
        });
        if (key === 'Pendulum') {
            service.canonical.registerStructuralCode('ABILITY', 'PENDULUM');
            card = service.canonical.mutateCard(card.cardId, card.revision, {
                structure: {
                    kind: 'MONSTER',
                    summonKind: 'MAIN_DECK',
                    attributeCode: null,
                    raceCode: null,
                    level: null,
                    rank: null,
                    atk: null,
                    def: null,
                    pendulumScale: null,
                    abilities: ['PENDULUM'],
                    linkMarkers: [],
                },
            });
        }
        card = service.canonical.mutateCard(card.cardId, card.revision, {
            localizations: [
                {
                    language: 'EN',
                    name: 'RUN021 ' + key,
                    cardText: 'Same text',
                    pendulumText: key === 'Pendulum' ? 'Old pendulum' : null,
                },
                {
                    language: 'ES',
                    name: 'Español',
                    cardText: 'Old ES',
                    pendulumText: null,
                },
            ],
            confirmations: ['Mixed', 'No-op'].includes(key)
                ? [
                      {
                          block: 'TEXT:EN',
                          state: 'CONFIRMED',
                          provenance: {
                              sourceKind: 'MANUAL',
                              sourceRef: 'fixture-confirmation',
                          },
                      },
                  ]
                : [],
        });
        const cid = randomUUID(),
            rid = randomUUID(),
            did = randomUUID(),
            timestamp = new Date().toISOString();
        const claim = (state, value, locale = 'EN') => ({
            state,
            ...(state === 'PRESENT'
                ? { value }
                : state !== 'ABSENT'
                  ? { raw_value: value }
                  : {}),
            evidence: {
                document_id: did,
                locale,
                source_path: '$.fixture.source',
            },
        });
        const candidate = {
            candidate_schema_version: 1,
            authoritative: false,
            identity: {
                source_code: 'YGORESOURCES_CARD_DB',
                external_record_key: '13036',
            },
            blocks: {
                STRUCTURE: { fields: { family: claim('PRESENT', 'MONSTER') } },
                'TEXT:EN': {
                    fields: {
                        name: claim(
                            'PRESENT',
                            key === 'No-op'
                                ? 'RUN021 No-op'
                                : 'Accepted ' + key,
                        ),
                        card_text: claim('PRESENT', 'Same text'),
                        pendulum_text: claim('PRESENT', ''),
                    },
                },
                'TEXT:ES': {
                    fields: {
                        name: claim('ABSENT', null, 'ES'),
                        card_text: claim(
                            'PRESENT',
                            'Accepted ES <script>window.REMOTE_EXECUTED=true</script>',
                            'ES',
                        ),
                        pendulum_text: claim('UNMAPPED', [1], 'ES'),
                    },
                },
                'TEXT:JP': {
                    fields: {
                        name: claim('INVALID', 123, 'JP'),
                        card_text: claim('PRESENT', '', 'JP'),
                        pendulum_text: claim('ABSENT', null, 'JP'),
                    },
                },
            },
        };
        service.persistence.transaction((db) =>
            publishPackage(
                db,
                randomUUID(),
                {
                    retrieval_id: rid,
                    source_record_id: 'fixture',
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
                    document_id: did,
                    document_kind: 'CARD_JSON',
                    source_ref: 'frozen-test-evidence',
                    status: 'SUCCESS',
                    http_status: 200,
                    content_type: 'application/json',
                    payload_hash: createHash('sha256')
                        .update('{}')
                        .digest('hex'),
                    raw_payload: '{}',
                    source_cache_revision: null,
                    error_code: null,
                    error_message: null,
                },
                {
                    candidate_id: cid,
                    retrieval_id: rid,
                    candidate_schema_version: 1,
                    normalizer_version: 1,
                    candidate,
                    diagnostics: [],
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
    service.app.addHook('onRequest', async (request) => {
        if (request.url.endsWith('/apply-text')) applyCalls++;
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
    service.app.get('/api/v1/workspace/_qa/info', async () => ({
        sha: execFileSync('git', ['rev-parse', 'HEAD'], {
            encoding: 'utf8',
        }).trim(),
        cases,
    }));
    service.app.get('/api/v1/workspace/_qa/snapshot', async () => ({
        tables: snapshot(),
        providerRequests,
        applyCalls,
    }));
    service.app.post('/api/v1/workspace/_qa/conflict', async () => {
        const id = cases.Conflict.card_id;
        const current = service.canonical.getCard(id);
        return service.canonical.addProvenance(id, current.revision, {
            targetKind: 'CARD',
            targetKey: 'IDENTITY',
            sourceKind: 'MANUAL',
        });
    });
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    console.log(JSON.stringify({ ready: true, fixture: 'RUN021', cases }));
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
