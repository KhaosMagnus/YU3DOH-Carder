/* Isolated QA harness only. Never opens a user Workspace. No production routes/hooks are changed. */
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { deflateSync } = require('node:zlib');
const { bootstrapWorkspaceDatabase } = require('../workspace-server/dist/src/persistence/operations');
const { createWorkspaceService } = require('../workspace-server/dist/src/service');
const crc32 = data => {
    let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
    return (crc ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
    const name = Buffer.from(type); const result = Buffer.alloc(12 + data.length);
    result.writeUInt32BE(data.length); name.copy(result, 4); data.copy(result, 8);
    result.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length); return result;
};
const png = (alpha, red = 20) => {
    const header = Buffer.alloc(13); header.writeUInt32BE(2, 0); header.writeUInt32BE(2, 4); header[8] = 8; header[9] = 6;
    return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header),
        chunk('IDAT', deflateSync(Buffer.from([0, red, 40, 60, alpha, red, 40, 60, alpha, 0, red, 40, 60, alpha, red, 40, 60, alpha]))), chunk('IEND', Buffer.alloc(0))]);
};
async function run() {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'yu3doh run012 QA 日本語 '));
    const manifest = { workspace_id: 'run012-isolated-qa', workspace_format_version: 1, database_path: 'Data/workspace.db',
        created_at: new Date().toISOString(), name: 'RUN 012 isolated QA' };
    await fs.writeFile(path.join(root, 'workspace.json'), JSON.stringify(manifest));
    bootstrapWorkspaceDatabase(root, manifest);
    let fault = '';
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 }, { mutationHooks: { phase: phase => {
        if ((fault === 'attachment' || fault === 'recovery') && phase === 'database') throw new Error('Isolated QA database failure');
        if (fault === 'recovery' && phase === 'rollback') throw new Error('Isolated QA rollback failure');
    } } });
    const sources = {};
    const write = async (relative, bytes) => { const file = path.join(root, relative); await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, bytes); return file; };
    for (const [name, alpha, red] of [['bs',255,50],['bg',255,80],['of',128,90],['opaque',255,110]]) sources[name] = await write(`Sources/${name} art 日本語.png`, png(alpha, red));
    const cards = {};
    const card = (key, password) => {
        const created = service.canonical.createCard({ family: 'SPELL', password });
        const confirmed = service.canonical.mutateCard(created.cardId, created.revision, {
            structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
            localizations: [{ language: 'EN', name: `QA ${key}`, cardText: 'RUN 012 QA fixture.', pendulumText: null }],
            confirmations: ['STRUCTURE', 'TEXT:EN'].map(block => ({ block, state: 'CONFIRMED', provenance: { sourceKind: 'MANUAL', sourceRef: 'isolated-run012-qa' } })),
        });
        cards[key] = confirmed.cardId; return confirmed.cardId;
    };
    const managedCard = card('Managed', '12000001');
    const managed = {};
    for (const role of ['BS','BG','OF']) managed[role] = (await service.managedAssets.ingest({ cardId: managedCard, variantKey: 'Default', role, sourceFile: sources[role.toLowerCase()], idempotencyKey: `qa-${role}` })).managedAsset;
    const brokenCard = card('Broken', '12000002');
    const missing = (await service.managedAssets.ingest({ cardId: brokenCard, variantKey: 'Default', role: 'BS', sourceFile: sources.bs, idempotencyKey: 'broken-bs' })).managedAsset;
    await fs.unlink(path.join(root, missing.managedRelativePath));
    const conflictCard = card('Conflict', '12000003');
    await service.managedAssets.ingest({ cardId: conflictCard, variantKey: 'Other', role: 'BG', sourceFile: sources.bg, idempotencyKey: 'other-bg' });
    for (const name of ['A','B','C']) await write(`Assets/12000003-${name}-BS-Default.png`, png(255, name.charCodeAt(0)));
    for (const name of ['Attach','Draft','NewVariant']) await write(`Assets/12999999-${name}-BS-Default.png`, png(255, 170));
    const unmanagedCard = card('UnmanagedMissing', '12000004');
    const unmanagedPath = await write('Assets/12000004-Missing-BS-Default.png', png(255));
    await service.assetMutations.refresh(); await fs.unlink(unmanagedPath); await service.assetMutations.refresh();
    const info = { root, sources, cards, managed, missing, unmanagedCard };
    service.app.get('/_qa/info', async () => info);
    service.app.post('/_qa/fault/:kind', async request => {
        const kind = request.params.kind;
        if (!['none','attachment','recovery'].includes(kind)) throw new Error('Unknown isolated QA fault');
        fault = kind === 'none' ? '' : kind; return { fault };
    });
    service.app.post('/_qa/change-target', async () => {
        await fs.writeFile(path.join(root, managed.BS.managedRelativePath), png(255, 215)); return { changed: true };
    });
    service.app.get('/_qa/domain', async () => {
        const tables = ['asset_index_scans','indexed_asset_files','art_variants','variant_role_bindings','asset_resolution_overrides','managed_assets','asset_index_diagnostics'];
        const db = service.persistence.runRepositoryOperation(database => Object.fromEntries(tables.map(table => [table, database.prepare(`SELECT * FROM ${table}`).all()])));
        const files = [];
        const walk = async dir => { for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
            const file = path.join(dir, entry.name); if (entry.isDirectory()) await walk(file); else files.push([path.relative(root, file), (await fs.readFile(file)).toString('base64')]);
        } };
        await walk(path.join(root, 'Assets'));
        const recovery = await fs.readdir(path.join(root, 'Temp/AssetMutation')).catch(() => []);
        return { db, files: files.sort((a,b) => a[0].localeCompare(b[0])), recovery: recovery.sort() };
    });
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    console.log(JSON.stringify({ ready: true, ...info }));
    for (const signal of ['SIGINT','SIGTERM']) process.once(signal, async () => { await service.close(); await fs.rm(root, { recursive: true, force: true }); process.exit(0); });
}
run().catch(error => { console.error(error); process.exitCode = 1; });
