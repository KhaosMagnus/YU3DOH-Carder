/* Isolated QA harness only. Never opens a user Workspace. No production routes/hooks are changed. */
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { deflateSync } = require('node:zlib');
const {
    bootstrapWorkspaceDatabase,
} = require('../workspace-server/dist/src/persistence/operations');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
const crc32 = (data) => {
    let crc = 0xffffffff;
    for (const byte of data) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++)
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
    const name = Buffer.from(type);
    const result = Buffer.alloc(12 + data.length);
    result.writeUInt32BE(data.length);
    name.copy(result, 4);
    data.copy(result, 8);
    result.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length);
    return result;
};
const png = (alpha, red = 20) => {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(2, 0);
    header.writeUInt32BE(2, 4);
    header[8] = 8;
    header[9] = 6;
    return Buffer.concat([
        Buffer.from('89504e470d0a1a0a', 'hex'),
        chunk('IHDR', header),
        chunk(
            'IDAT',
            deflateSync(
                Buffer.from([
                    0,
                    red,
                    40,
                    60,
                    alpha,
                    red,
                    40,
                    60,
                    alpha,
                    0,
                    red,
                    40,
                    60,
                    alpha,
                    red,
                    40,
                    60,
                    alpha,
                ]),
            ),
        ),
        chunk('IEND', Buffer.alloc(0)),
    ]);
};

async function run() {
    const root = await fs.mkdtemp(
        path.join(os.tmpdir(), 'yu3doh RUN017 QA 日本語 '),
    );
    const manifest = {
        workspace_id: 'run017-qa',
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
    for (const code of ['LIGHT', 'DARK'])
        service.canonical.registerStructuralCode('ATTRIBUTE', code);
    service.canonical.registerStructuralCode('RACE', 'DRAGON');
    for (const code of ['EFFECT', 'PENDULUM'])
        service.canonical.registerStructuralCode('ABILITY', code);
    service.canonical.registerStructuralCode('LINK_MARKER', 'TOP');
    let index = 0;
    const create = async (options = {}) => {
        const kind = options.kind ?? 'MAIN_DECK';
        let card = service.canonical.createCard({
            family: 'MONSTER',
            password: String(17000000 + ++index),
        });
        card = service.canonical.mutateCard(card.cardId, card.revision, {
            structure: {
                kind: 'MONSTER',
                summonKind: kind,
                attributeCode: 'LIGHT',
                raceCode: 'DRAGON',
                level: kind === 'XYZ' || kind === 'LINK' ? null : 4,
                rank: kind === 'XYZ' ? 4 : null,
                atk: 1800,
                def: kind === 'LINK' ? null : 1200,
                abilities: options.pendulum
                    ? ['EFFECT', 'PENDULUM']
                    : ['EFFECT'],
                pendulumScale: options.pendulum ? 4 : null,
                linkMarkers: kind === 'LINK' ? ['TOP'] : [],
            },
            localizations: [
                {
                    language: 'EN',
                    name: `RUN017 Card ${index}`,
                    cardText: 'Original text',
                    pendulumText: options.pendulum ? 'Pendulum text' : null,
                },
            ],
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
            ],
        });
        const source = path.join(root, `source-${index}.png`);
        await fs.writeFile(source, png(255));
        const ingested = await service.managedAssets.ingest({
            cardId: card.cardId,
            variantKey: 'default',
            role: 'BS',
            sourceFile: source,
            idempotencyKey: `run017-${index}`,
        });
        const variant = service.assets.listVariants(card.cardId)[0];
        return { card: service.canonical.getCard(card.cardId), variant };
    };
    service.app.get('/api/v1/workspace/_qa/info', async () => ({
        root,
        sha: require('node:child_process')
            .execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' })
            .trim(),
    }));
    service.app.post('/api/v1/workspace/_qa/create', async (req) =>
        create(req.body ?? {}),
    );
    service.app.get('/api/v1/workspace/_qa/card/:id', async (req) =>
        service.canonical.getCard(req.params.id),
    );
    service.app.get('/api/v1/workspace/_qa/assets', async () =>
        service.persistence.runRepositoryOperation((db) =>
            Object.fromEntries(
                db
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%asset%' OR name LIKE '%variant%') ORDER BY name",
                    )
                    .all()
                    .map(({ name }) => [
                        name,
                        db.prepare(`SELECT * FROM ${name}`).all(),
                    ]),
            ),
        ),
    );
    service.app.post('/api/v1/workspace/_qa/stale', async (req) => {
        const c = service.canonical.getCard(req.body.card_id);
        return service.canonical.mutateCard(c.cardId, c.revision, {
            password: '17999999',
            confirmations: [{ block: 'STRUCTURE', state: 'DRAFT' }],
        });
    });
    service.app.post('/api/v1/workspace/_qa/rollback', async (req) => {
        service.persistence.runRepositoryOperation((db) => {
            if (req.body.enabled)
                db.exec(
                    "CREATE TRIGGER fail_carder_write BEFORE UPDATE OF revision ON canonical_cards BEGIN SELECT RAISE(ABORT,'QA rollback'); END",
                );
            else db.exec('DROP TRIGGER fail_carder_write');
        });
        return { ok: true };
    });
    service.app.post('/api/v1/workspace/_qa/domain-invalid', async (req) => {
        service.persistence.runRepositoryOperation((db) => {
            db.prepare(
                "INSERT INTO canonical_localized_text(card_id,language,name,card_text,pendulum_text) VALUES (?, 'ES', NULL, NULL, NULL)",
            ).run(req.body.card_id);
            db.prepare(
                "INSERT INTO canonical_block_states(card_id,block_key,state,provenance_id) SELECT ?, 'TEXT:ES', 'CONFIRMED', provenance_id FROM canonical_block_states WHERE card_id=? AND block_key='TEXT:EN'",
            ).run(req.body.card_id, req.body.card_id);
        });
        return { ok: true };
    });
    service.app.post('/api/v1/workspace/_qa/reload', async () => {
        await service.runtime.reload();
        return { ok: true };
    });
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    console.log(JSON.stringify({ ready: true, root }));
    for (const signal of ['SIGINT', 'SIGTERM'])
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
