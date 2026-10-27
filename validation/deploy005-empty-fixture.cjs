/* Disposable real Workspace Service; QA routes and seeded asset bindings never enter production. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises'), path = require('node:path'), os = require('node:os');
const { randomUUID } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { bootstrapWorkspaceDatabase } = require(process.env.CANDIDATE_ROOT+'/workspace-server/dist/src/persistence/operations');
const { createWorkspaceService } = require(process.env.CANDIDATE_ROOT+'/workspace-server/dist/src/service');

async function run() {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'yu3doh-run025-disposable-'));
    const manifest = { workspace_id: randomUUID(), workspace_format_version: 1, database_path: 'Data/workspace.db', created_at: new Date().toISOString() };
    await fs.writeFile(path.join(root, 'workspace.json'), JSON.stringify(manifest));
    bootstrapWorkspaceDatabase(root, manifest);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4313 });
    const c = service.canonical;
    const broad = c.registerNamedEntity('ARCHETYPE', 'F04 Broad');
    const narrow = c.registerNamedEntity('ARCHETYPE', 'F04 Narrow');
    const effect = c.registerNamedEntity('EFFECT_CLASSIFIER', 'F04 Effect');
    const tag = c.registerNamedEntity('FUNCTIONAL_TAG', 'F04 Tag');
    const cards = [];
    for (let i = 0; i < 0; i++) {
        const family = ['MONSTER', 'SPELL', 'TRAP', 'TOKEN'][i % 4];
        let card = c.createCard({ family, password: family === 'TOKEN' ? null : String(25000000 + i) });
        card = c.mutateCard(card.cardId, card.revision, {
            localizations: [{ language: 'EN', name: `F04 Search Card ${String(i).padStart(3, '0')}`, cardText: 'Disposable QA text', pendulumText: null }],
            classification: { effectReviewed: false, archetypeIds: [i < 115 ? broad.id : narrow.id], effectClassifierIds: [effect.id], functionalTagIds: [tag.id] },
        });
        cards.push(card);
        if (i < 4) insertVariantState(service, card.cardId, 'default', [[], ['BS'], ['BG', 'OF'], ['OF']][i]);
    }
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    service.app.get('/api/v1/workspace/_qa/info', async () => ({ sha, root, fixture: 'RUN025-F04-empty-v1', cards, manifest, schema: service.status.database_schema_version, count: cards.length }));
    service.app.get('/api/v1/workspace/_qa/snapshot', async () => service.persistence.runRepositoryOperation(db => Object.fromEntries(db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map(({name}) => [name, db.prepare(`SELECT * FROM "${name}"`).all()]))));
    await service.app.listen({ host: '127.0.0.1', port: 4313 });
    console.log(JSON.stringify({ ready: true, root, sha, count: cards.length }));
    for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, async () => { await service.close(); await fs.rm(root, { recursive: true, force: true }); process.exit(0); });
}

// Asset binding seeding uses the same persisted states as workspace-server/test/library.test.ts.
// No readiness value is mocked: the real Library repository computes summaries.
const insertVariantState = (
    service,
    cardId,
    variantKey,
    roles,
    conflictRole,
) => {
    assert.ok(service.persistence);
    service.persistence.transaction(database => {
        const timestamp = '2026-10-07T00:00:00.000Z';
        const variantId = randomUUID();
        const scanId = randomUUID();
        database.prepare(`
            INSERT INTO art_variants (
                variant_id, card_id, variant_key, display_label, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(variantId, cardId, variantKey, variantKey, timestamp, timestamp);
        database.prepare(`
            INSERT INTO asset_index_scans (
                scan_id, started_at, completed_at, status,
                discovered_count, present_count, diagnostic_count
            ) VALUES (?, ?, ?, 'COMPLETE', 0, 0, 0)
        `).run(scanId, timestamp, timestamp);

        const insertAsset = (role, bind, suffix = '') => {
            const assetId = randomUUID();
            const relativePath = `Test/${cardId}/${variantKey}/${role}${suffix}.png`;
            database.prepare(`
                INSERT INTO indexed_asset_files (
                    asset_id, relative_path, file_name, extension, size_bytes, modified_time_ms,
                    content_hash, parsed_card_name, parsed_password, role, variant_label, variant_key,
                    association_state, card_id, variant_id, image_width, image_height, has_transparency,
                    valid_asset, present, first_seen_scan_id, last_seen_scan_id, updated_at
                ) VALUES (?, ?, ?, 'png', 1, 1, ?, NULL, NULL, ?, ?, ?, 'RESOLVED', ?, ?, 1, 1, ?, 1, 1, ?, ?, ?)
            `).run(
                assetId,
                relativePath,
                path.basename(relativePath),
                'a'.repeat(64),
                role,
                variantKey,
                variantKey,
                cardId,
                variantId,
                role === 'OF' ? 1 : 0,
                scanId,
                scanId,
                timestamp,
            );
            if (bind) {
                database.prepare(`
                    INSERT INTO variant_role_bindings (variant_id, role, asset_id)
                    VALUES (?, ?, ?)
                `).run(variantId, role, assetId);
            }
        };

        roles.forEach(role => insertAsset(role, true));
        if (conflictRole) {
            insertAsset(conflictRole, false, '-conflict-a');
            insertAsset(conflictRole, false, '-conflict-b');
        }
    });
};



run().catch(error => { console.error(error); process.exitCode = 1; });
