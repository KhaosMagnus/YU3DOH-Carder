/* Disposable provenance QA fixture only. No production route or server code changes. */
const fs = require('node:fs/promises'),
    path = require('node:path'),
    os = require('node:os');
const {
    bootstrapWorkspaceDatabase,
} = require('../workspace-server/dist/src/persistence/operations');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
const {
    authoritativeProjection,
} = require('../workspace-server/dist/src/carder/write-back');
async function run() {
    const root = await fs.mkdtemp(
        path.join(os.tmpdir(), 'yu3doh RUN019 QA 日本語 '),
    );
    const manifest = {
        workspace_id: 'run019-isolated-qa',
        workspace_format_version: 1,
        database_path: 'Data/workspace.db',
        created_at: new Date().toISOString(),
    };
    await fs.writeFile(
        path.join(root, 'workspace.json'),
        JSON.stringify(manifest),
    );
    bootstrapWorkspaceDatabase(root, manifest);
    const service = await createWorkspaceService({
        workspaceRoot: root,
        host: '127.0.0.1',
        port: 4312,
    });
    const c = service.canonical;
    const target = c.createCard({ family: 'SPELL', password: '19000002' });
    const empty = c.createCard({ family: 'SPELL', password: '19000003' });
    c.mutateCard(empty.cardId, empty.revision, {
        localizations: [
            {
                language: 'EN',
                name: 'RUN019 Empty',
                cardText: 'Empty history',
                pendulumText: null,
            },
        ],
    });
    let card = c.createCard({
        family: 'SPELL',
        password: '19000001',
        provenance: {
            sourceKind: 'MANUAL',
            sourceRef: 'https://example.invalid/reference',
            note: 'Identity source',
        },
    });
    card = c.mutateCard(card.cardId, card.revision, {
        structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
        localizations: [
            {
                language: 'EN',
                name: 'RUN019 History',
                cardText: 'Original text',
                pendulumText: null,
            },
        ],
        classification: { effectReviewed: false },
        confirmations: [
            {
                block: 'STRUCTURE',
                state: 'CONFIRMED',
                provenance: {
                    sourceKind: 'MANUAL',
                    note: 'Structure confirmation',
                },
            },
        ],
    });
    const grant = service.carderWriteGrants.issue({
        cardId: card.cardId,
        contentLanguage: 'EN',
        revision: card.revision,
    });
    const projection = authoritativeProjection(card, 'EN');
    projection.effect = 'Persisted Carder text';
    service.carderWriteBack.writeBack({
        write_grant: grant,
        card_id: card.cardId,
        expected_revision: card.revision,
        content_language: 'EN',
        projection,
        acknowledge_move_to_draft: [],
    });
    card = c.getCard(card.cardId);
    service.libraryBatchClassification.apply({
        items: [{ card_id: card.cardId, expected_revision: card.revision }],
        operation: { set_effect_reviewed: true },
        note: 'Shared Batch note',
    });
    card = c.getCard(card.cardId);
    card = c.mutateCard(card.cardId, card.revision, {
        confirmations: [
            {
                block: 'CLASSIFICATION',
                state: 'CONFIRMED',
                provenance: {
                    sourceKind: 'MANUAL',
                    sourceRef: 'manual-confirmation',
                    note: 'Explicit confirmation link',
                },
            },
        ],
    });
    c.registerStructuralCode('RELATION_TYPE', 'RELATED');
    for (let i = 0; i < 2; i++)
        card = c.mutateCard(card.cardId, card.revision, {
            relations: [
                {
                    targetCardId: target.cardId,
                    relationTypeCode: 'RELATED',
                    note: null,
                    provenance: {
                        sourceKind: 'MANUAL',
                        note: i
                            ? 'Current relation event'
                            : 'Historical relation event',
                    },
                },
            ],
        });
    for (const p of [
        {
            targetKind: 'BLOCK',
            targetKey: 'CLASSIFICATION',
            sourceKind: 'FUTURE_SOURCE',
            note: 'Newest historical event is not current confirmation',
        },
        {
            targetKind: 'BLOCK',
            targetKey: 'FUTURE_BLOCK',
            sourceKind: '__proto__',
            sourceRef: null,
            note: null,
        },
        {
            targetKind: 'CARD',
            targetKey: 'OTHER_IDENTITY',
            sourceKind: 'FUTURE_SOURCE',
        },
        {
            targetKind: 'MYSTERY',
            targetKey: 'opaque-key',
            sourceKind: 'FUTURE_SOURCE',
            sourceRef:
                'https://example.invalid/<script>not executable</script>',
        },
    ])
        card = c.addProvenance(card.cardId, card.revision, p);
    // DRAFT with a historical link and malformed/tied dates intentionally test presentation only.
    service.persistence.runRepositoryOperation((db) => {
        const write = card.provenance.find(
            (p) => p.sourceKind === 'CARDER_WRITE_BACK',
        );
        db.prepare(
            "INSERT INTO canonical_block_states(card_id,block_key,state,provenance_id) VALUES (?, 'TEXT:EN', 'DRAFT', ?)",
        ).run(card.cardId, write.provenanceId);
        for (const p of card.provenance)
            db.prepare(
                'UPDATE canonical_provenance SET created_at=? WHERE provenance_id=?',
            ).run(
                p.targetKey === 'FUTURE_BLOCK'
                    ? 'not-a-time'
                    : '2026-10-12T' +
                          String(
                              p.note?.includes('Newest historical')
                                  ? 23
                                  : 10 + (p.provenanceId % 8),
                          ).padStart(2, '0') +
                          ':00:00Z',
                p.provenanceId,
            );
    });
    card = c.getCard(card.cardId);
    const snapshot = () =>
        service.persistence.runRepositoryOperation((db) =>
            Object.fromEntries(
                db
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
                    )
                    .all()
                    .map(({ name }) => [
                        name,
                        db.prepare(`SELECT * FROM "${name}"`).all(),
                    ]),
            ),
        );
    service.app.get('/api/v1/workspace/_qa/info', async () => ({
        root,
        sha: require('node:child_process')
            .execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' })
            .trim(),
        card,
        empty_id: empty.cardId,
        target_id: target.cardId,
    }));
    service.app.get('/api/v1/workspace/_qa/snapshot', async () => snapshot());
    service.app.post('/api/v1/workspace/_qa/append', async () => {
        const current = c.getCard(card.cardId);
        return c.addProvenance(current.cardId, current.revision, {
            targetKind: 'CARD',
            targetKey: 'RELOADED',
            sourceKind: 'FUTURE_SOURCE',
            note: 'Authoritative reload event',
        });
    });
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    console.log(JSON.stringify({ ready: true, root }));
    for (const signal of ['SIGTERM', 'SIGINT'])
        process.once(signal, async () => {
            await service.close();
            await fs.rm(root, { recursive: true, force: true });
            process.exit(0);
        });
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
