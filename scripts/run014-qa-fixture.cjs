/* Isolated QA harness only. Never opens a user Workspace. No production routes/hooks are changed. */
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { deflateSync } = require('node:zlib');
const {
    bootstrapWorkspaceDatabase,
} = require('../workspace-server/dist/src/persistence/operations');
const { createWorkspaceService } = require('../workspace-server/dist/src/service');
const crc32 = (data) => {
    let crc = 0xffffffff;
    for (const byte of data) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
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
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'yu3doh RUN014 QA 日本語 '));
    const m = {
        workspace_id: 'run014-isolated-qa',
        workspace_format_version: 1,
        database_path: 'Data/workspace.db',
        created_at: new Date().toISOString(),
        name: 'RUN014 disposable QA',
    };
    await fs.writeFile(path.join(root, 'workspace.json'), JSON.stringify(m));
    bootstrapWorkspaceDatabase(root, m);
    const service = await createWorkspaceService({
        workspaceRoot: root,
        host: '127.0.0.1',
        port: 4312,
    });
    const cards = {};
    for (const [i, name] of ['Valid', 'Invalid', 'Languages', 'Stale'].entries()) {
        let c = service.canonical.createCard({
            family: 'SPELL',
            password: name === 'Invalid' ? null : String(14000001 + i),
        });
        c = service.canonical.mutateCard(c.cardId, c.revision, {
            structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
            localizations: (name === 'Languages' ? ['EN', 'ES', 'JP'] : ['EN']).map((language) => ({
                language,
                name: `QA ${name}${language === 'EN' ? '' : ' ' + language}`,
                cardText: 'RUN014 persisted text',
                pendulumText: null,
            })),
            classification: { effectReviewed: true },
        });
        cards[name] = c.cardId;
    }
    const source = path.join(root, 'BS source 日本語.png');
    await fs.writeFile(source, png(255));
    await service.managedAssets.ingest({
        cardId: cards.Valid,
        variantKey: 'Default',
        role: 'BS',
        sourceFile: source,
        idempotencyKey: 'valid-bs',
    });
    await service.assetMutations.refresh();
    const info = { root, cards, workspace_id: m.workspace_id };
    service.app.get('/_qa/info', async () => info);
    service.app.get('/_qa/domain', async () =>
        service.persistence.runRepositoryOperation((db) =>
            Object.fromEntries(
                db
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
                    )
                    .all()
                    .map(({ name }) => [name, db.prepare(`SELECT * FROM ${name}`).all()]),
            ),
        ),
    );
    service.app.post('/_qa/stale', async () => {
        const c = service.canonical.getCard(cards.Stale);
        return service.canonical.mutateCard(c.cardId, c.revision, {
            password: c.password === '14999999' ? '14888888' : '14999999',
        });
    });
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    console.log(JSON.stringify({ ready: true, ...info }));
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
