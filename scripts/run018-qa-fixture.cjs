/* Disposable RUN018 QA data. These fault-injection routes never enter production. */
const fs = require('node:fs/promises'),
    path = require('node:path'),
    os = require('node:os');
const {
    bootstrapWorkspaceDatabase,
} = require('../workspace-server/dist/src/persistence/operations');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
async function run() {
    const root = await fs.mkdtemp(
        path.join(os.tmpdir(), 'yu3doh RUN018 QA 日本語 '),
    );
    const manifest = {
        workspace_id: 'run018-qa',
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
    const registries = {};
    for (const [key, kind] of [
        ['archetype', 'ARCHETYPE'],
        ['effect', 'EFFECT_CLASSIFIER'],
        ['tag', 'FUNCTIONAL_TAG'],
    ])
        for (const suffix of ['Old', 'New'])
            registries[key + suffix] = c.registerNamedEntity(
                kind,
                `${key} ${suffix}`,
            );
    let n = 0;
    const create = (options = {}) => {
        let card = c.createCard({
            family: 'SPELL',
            password: String(18000000 + ++n),
        });
        card = c.mutateCard(card.cardId, card.revision, {
            structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
            localizations: [
                {
                    language: 'EN',
                    name: `RUN018 Card ${String(n).padStart(4, '0')}`,
                    cardText: 'Original text',
                    pendulumText: null,
                },
            ],
            classification: {
                effectReviewed: !!options.reviewed || !!options.confirmed,
                archetypeIds: [registries.archetypeOld.id],
                effectClassifierIds: [registries.effectOld.id],
                functionalTagIds: [registries.tagOld.id],
            },
            confirmations: [
                {
                    block: 'STRUCTURE',
                    state: 'CONFIRMED',
                    provenance: { sourceKind: 'QA' },
                },
                {
                    block: 'TEXT:EN',
                    state: 'CONFIRMED',
                    provenance: { sourceKind: 'QA' },
                },
                ...(options.confirmed
                    ? [
                          {
                              block: 'CLASSIFICATION',
                              state: 'CONFIRMED',
                              provenance: { sourceKind: 'QA' },
                          },
                      ]
                    : []),
            ],
        });
        return card;
    };
    const cards = Array.from({ length: 205 }, (_, i) =>
        create({ reviewed: i === 1, confirmed: i === 2 }),
    );
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
        cards,
        registries,
    }));
    service.app.post('/api/v1/workspace/_qa/create', async (req) =>
        create(req.body),
    );
    service.app.get('/api/v1/workspace/_qa/snapshot', async () => snapshot());
    service.app.get('/api/v1/workspace/_qa/card/:id', async (req) =>
        c.getCard(req.params.id),
    );
    service.app.post('/api/v1/workspace/_qa/stale', async (req) => {
        const card = c.getCard(req.body.card_id);
        return c.mutateCard(card.cardId, card.revision, {
            classification: {
                effectReviewed: !card.classification.effectReviewed,
            },
            confirmations: [{ block: 'CLASSIFICATION', state: 'DRAFT' }],
        });
    });
    service.app.post('/api/v1/workspace/_qa/domain-invalid', async (req) => {
        service.persistence.runRepositoryOperation((db) =>
            db
                .prepare(
                    "UPDATE canonical_localized_text SET name=NULL WHERE card_id=? AND language='EN'",
                )
                .run(req.body.card_id),
        );
        return { ok: true };
    });
    // Copy an existing validated QA PNG from RUN017's generator by constructing a small RGBA PNG.
    const png = () => {
        const { deflateSync } = require('node:zlib');
        const crc = (data) => {
            let v = 0xffffffff;
            for (const b of data) {
                v ^= b;
                for (let i = 0; i < 8; i++)
                    v = (v >>> 1) ^ (v & 1 ? 0xedb88320 : 0);
            }
            return (v ^ 0xffffffff) >>> 0;
        };
        const chunk = (kind, data) => {
            const type = Buffer.from(kind),
                out = Buffer.alloc(12 + data.length);
            out.writeUInt32BE(data.length);
            type.copy(out, 4);
            data.copy(out, 8);
            out.writeUInt32BE(
                crc(Buffer.concat([type, data])),
                8 + data.length,
            );
            return out;
        };
        const h = Buffer.alloc(13);
        h.writeUInt32BE(1);
        h.writeUInt32BE(1, 4);
        h[8] = 8;
        h[9] = 6;
        return Buffer.concat([
            Buffer.from('89504e470d0a1a0a', 'hex'),
            chunk('IHDR', h),
            chunk('IDAT', deflateSync(Buffer.from([0, 20, 40, 60, 255]))),
            chunk('IEND', Buffer.alloc(0)),
        ]);
    };
    service.app.post('/api/v1/workspace/_qa/prepare-card', async (req) => {
        const file = path.join(root, 'carder-source.png');
        await fs.writeFile(file, png());
        await service.managedAssets.ingest({
            cardId: req.body.card_id,
            variantKey: 'default',
            role: 'BS',
            sourceFile: file,
            idempotencyKey: 'run018-carder-' + req.body.card_id,
        });
        return {
            card: c.getCard(req.body.card_id),
            variant: service.assets.listVariants(req.body.card_id)[0],
        };
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
