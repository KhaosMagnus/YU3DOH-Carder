import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Database from 'better-sqlite3';
import type { AssetRole } from '../src/assets/types';
import type { CanonicalCardFamily, CanonicalLanguage } from '../src/canonical/types';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from '../src/persistence/constants';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { resolveWorkspaceDatabasePath } from '../src/persistence/path';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { SUPPORTED_WORKSPACE_FORMAT_VERSION, type WorkspaceManifest } from '../src/workspace/types';

const roots: string[] = [];

const manifest = (): WorkspaceManifest => ({
    workspace_id: 'workspace-run006',
    workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION,
    database_path: 'Data/workspace.db',
    created_at: '2026-10-07T00:00:00.000Z',
    name: 'RUN 006 Library Test Workspace',
});

const tempRoot = async (label: string, writeManifest = true) => {
    const root = await mkdtemp(path.join(os.tmpdir(), `yu3doh run006 ${label} `));
    roots.push(root);
    if (writeManifest) {
        await writeFile(path.join(root, 'workspace.json'), JSON.stringify(manifest()), 'utf8');
    }
    return root;
};

const readyService = async (label: string) => {
    const root = await tempRoot(label);
    bootstrapWorkspaceDatabase(root, manifest());
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });
    assert.equal(service.status.state, 'READY');
    assert.ok(service.canonical);
    assert.ok(service.library);
    assert.ok(service.persistence);
    return {
        root,
        service,
        canonical: service.canonical,
        library: service.library,
        persistence: service.persistence,
    };
};

type Names = Partial<Record<CanonicalLanguage, string | null>>;

const createCard = (
    service: WorkspaceService,
    family: CanonicalCardFamily,
    password: string | null | undefined,
    names: Names = {},
    classification?: {
        archetypeIds?: string[];
        effectClassifierIds?: string[];
        functionalTagIds?: string[];
        effectReviewed?: boolean;
    },
) => {
    assert.ok(service.canonical);
    let card = service.canonical.createCard({
        family,
        ...(password !== undefined ? { password } : {}),
    });
    const localizations = (Object.entries(names) as Array<[CanonicalLanguage, string | null]>)
        .map(([language, name]) => ({
            language,
            name,
            cardText: name ? `${name} text` : null,
            pendulumText: null,
        }));
    if (localizations.length > 0 || classification) {
        card = service.canonical.mutateCard(card.cardId, card.revision, {
            ...(localizations.length > 0 ? { localizations } : {}),
            ...(classification ? { classification } : {}),
        });
    }
    return card;
};

const insertVariantState = (
    service: WorkspaceService,
    cardId: string,
    variantKey: string,
    roles: AssetRole[],
    conflictRole?: AssetRole,
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

        const insertAsset = (role: AssetRole, bind: boolean, suffix = '') => {
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

const createSchema3Database = async (root: string) => {
    const databasePath = resolveWorkspaceDatabasePath(root, manifest().database_path);
    await mkdir(path.dirname(databasePath), { recursive: true });
    const database = new Database(databasePath);
    for (const [version, name, fileName] of [
        [1, 'repository_foundation', '001_repository_foundation.sql'],
        [2, 'canonical_domain', '002_canonical_domain.sql'],
        [3, 'art_variants_asset_index', '003_art_variants_asset_index.sql'],
    ] as const) {
        database.exec(readFileSync(path.resolve(process.cwd(), 'migrations', fileName), 'utf8'));
        database.prepare('INSERT INTO _workspace_migrations (version, name) VALUES (?, ?)').run(version, name);
        database.pragma(`user_version = ${version}`);
    }
    database.close();
    return databasePath;
};

test.after(async () => {
    await Promise.all(roots.map(root => rm(root, { recursive: true, force: true })));
});

test('zero-card READY Workspace returns valid empty browse and facets', async () => {
    const { service } = await readyService('zero');
    const response = await service.app.inject({ method: 'GET', url: '/api/v1/library/cards' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { items: [], total: 0, limit: 50, offset: 0 });

    const facets = await service.app.inject({ method: 'GET', url: '/api/v1/library/facets' });
    assert.equal(facets.statusCode, 200);
    assert.deepEqual(facets.json().families, ['MONSTER', 'SPELL', 'TRAP', 'TOKEN']);
    assert.deepEqual(facets.json().languages, ['EN', 'ES', 'JP']);
    await service.close();
});

test('deterministic display-name ordering and bounded limit/offset paging are stable', async () => {
    const { service, library } = await readyService('paging');
    createCard(service, 'SPELL', '70000001', { EN: 'Zulu' });
    createCard(service, 'TRAP', '70000002', { EN: 'alpha' });
    createCard(service, 'MONSTER', '70000003', { EN: 'Beta' });

    const first = library.browse({ limit: 2, offset: 0 });
    const second = library.browse({ limit: 2, offset: 2 });
    assert.deepEqual(first.items.map(item => item.display_name), ['alpha', 'Beta']);
    assert.deepEqual(second.items.map(item => item.display_name), ['Zulu']);
    assert.equal(first.total, 3);
    assert.equal(library.browse({ limit: 2, offset: 99 }).items.length, 0);
    assert.deepEqual(library.browse({ limit: 2, offset: 0 }), first);

    const oversized = await service.app.inject({ method: 'GET', url: '/api/v1/library/cards?limit=201' });
    assert.equal(oversized.statusCode, 400);
    await service.close();
});

test('Token without password and card without localized names remain browsable with controlled identifier fallback', async () => {
    const { service, library } = await readyService('fallback identity');
    const token = createCard(service, 'TOKEN', undefined, { EN: 'Token Name' });
    const draft = createCard(service, 'SPELL', '70000005');

    const result = library.browse({ limit: 50 });
    const tokenSummary = result.items.find(item => item.card_id === token.cardId);
    const draftSummary = result.items.find(item => item.card_id === draft.cardId);
    assert.equal(tokenSummary?.password, null);
    assert.equal(tokenSummary?.display_name, 'Token Name');
    assert.equal(draftSummary?.display_name, '70000005');
    assert.equal(draftSummary?.display_language, null);
    assert.deepEqual(draftSummary?.available_languages, []);
    await service.close();
});

test('preferred EN/ES/JP display and deterministic fallback report the actual display language', async () => {
    const { service, library } = await readyService('language fallback');
    const full = createCard(service, 'SPELL', '71000001', {
        EN: 'English Name',
        ES: 'Nombre Español',
        JP: '日本語名',
    });
    const enOnly = createCard(service, 'SPELL', '71000002', { EN: 'English Only' });
    const esOnly = createCard(service, 'SPELL', '71000003', { ES: 'Solo Español' });

    const byId = (language: CanonicalLanguage, id: string) =>
        library.browse({ preferredLanguage: language }).items.find(item => item.card_id === id);

    assert.equal(byId('EN', full.cardId)?.display_name, 'English Name');
    assert.equal(byId('ES', full.cardId)?.display_name, 'Nombre Español');
    assert.equal(byId('JP', full.cardId)?.display_name, '日本語名');
    assert.equal(byId('ES', enOnly.cardId)?.display_language, 'EN');
    assert.equal(byId('JP', enOnly.cardId)?.display_language, 'EN');
    assert.equal(byId('JP', esOnly.cardId)?.display_language, 'ES');
    assert.deepEqual(byId('ES', full.cardId)?.available_languages, ['EN', 'ES', 'JP']);
    await service.close();
});

test('search matches EN/ES/JP names and password independently of presentation language', async () => {
    const { service, library } = await readyService('search');
    const card = createCard(service, 'MONSTER', '72001234', {
        EN: 'Clockwork Knight',
        ES: 'Caballero Mecánico',
        JP: '機械仕掛けの騎士',
    });

    for (const [query, preferredLanguage] of [
        [' clockWORK ', 'ES'],
        ['MECÁNICO', 'JP'],
        ['機械仕掛け', 'EN'],
        ['72001234', 'ES'],
    ] as Array<[string, CanonicalLanguage]>) {
        const result = library.browse({ query, preferredLanguage });
        assert.equal(result.total, 1, query);
        assert.equal(result.items[0]?.card_id, card.cardId, query);
    }
    await service.close();
});

test('family, Archetype, Effect Classifier and Functional Tag filters use explicit associations with AND semantics', async () => {
    const { service, canonical, library } = await readyService('filters');
    const archetype = canonical.registerNamedEntity('ARCHETYPE', 'Icejade');
    const classifier = canonical.registerNamedEntity('EFFECT_CLASSIFIER', 'Summon');
    const tag = canonical.registerNamedEntity('FUNCTIONAL_TAG', 'Starter');
    canonical.registerNamedEntity('FUNCTIONAL_TAG', 'Extender');

    const matching = createCard(service, 'MONSTER', '73000001', { EN: 'Matching' }, {
        archetypeIds: [archetype.id],
        effectClassifierIds: [classifier.id],
        functionalTagIds: [tag.id],
        effectReviewed: true,
    });
    createCard(service, 'MONSTER', '73000002', { EN: 'Wrong Tag' }, {
        archetypeIds: [archetype.id],
        effectClassifierIds: [classifier.id],
        functionalTagIds: [],
        effectReviewed: true,
    });
    createCard(service, 'SPELL', '73000003', { EN: 'Wrong Family' }, {
        archetypeIds: [archetype.id],
        effectClassifierIds: [classifier.id],
        functionalTagIds: [tag.id],
        effectReviewed: true,
    });

    const result = library.browse({
        family: 'MONSTER',
        archetype: 'Icejade',
        effectClassifier: 'Summon',
        functionalTag: 'Starter',
    });
    assert.equal(result.total, 1);
    assert.equal(result.items[0]?.card_id, matching.cardId);
    assert.deepEqual(result.items[0]?.archetypes, ['Icejade']);
    assert.deepEqual(result.items[0]?.effect_classifiers, ['Summon']);
    assert.deepEqual(result.items[0]?.functional_tags, ['Starter']);

    assert.equal(library.browse({ archetype: 'Unknown Archetype' }).total, 0);
    assert.equal(library.browse({ functionalTag: 'Unknown Tag' }).total, 0);
    await service.close();
});

test('facet metadata keeps Archetype, Effect Classifier and Functional Tag taxonomies distinct', async () => {
    const { service, canonical, library } = await readyService('facets');
    canonical.registerNamedEntity('ARCHETYPE', 'Icejade');
    canonical.registerNamedEntity('EFFECT_CLASSIFIER', 'Destroy');
    canonical.registerNamedEntity('FUNCTIONAL_TAG', 'Hand Trap');
    const facets = library.facets();
    assert.deepEqual(facets.archetypes, ['Icejade']);
    assert.deepEqual(facets.effect_classifiers, ['Destroy']);
    assert.deepEqual(facets.functional_tags, ['Hand Trap']);
    await service.close();
});

test('variant count and Standard/Overframe readiness reuse persisted RUN 004 bindings', async () => {
    const { service, library } = await readyService('readiness');
    const bsCard = createCard(service, 'SPELL', '74000001', { EN: 'BS Card' });
    insertVariantState(service, bsCard.cardId, 'default', ['BS']);
    insertVariantState(service, bsCard.cardId, 'alternate', []);

    const comboCard = createCard(service, 'SPELL', '74000002', { EN: 'Combo Card' });
    insertVariantState(service, comboCard.cardId, 'default', ['BG', 'OF']);

    const bs = library.browse({ query: 'BS Card' }).items[0];
    assert.equal(bs?.variant_count, 2);
    assert.equal(bs?.has_standard_ready_variant, true);
    assert.equal(bs?.has_overframe_ready_variant, false);

    const combo = library.browse({ query: 'Combo Card' }).items[0];
    assert.equal(combo?.has_standard_ready_variant, true);
    assert.equal(combo?.has_overframe_ready_variant, true);
    await service.close();
});

test('variant role conflict without authoritative binding is never reported READY', async () => {
    const { service, library } = await readyService('role conflict');
    const card = createCard(service, 'SPELL', '74000003', { EN: 'Conflict Card' });
    insertVariantState(service, card.cardId, 'default', [], 'BS');
    const summary = library.browse({ query: 'Conflict Card' }).items[0];
    assert.equal(summary?.variant_count, 1);
    assert.equal(summary?.has_standard_ready_variant, false);
    assert.equal(summary?.has_overframe_ready_variant, false);
    await service.close();
});

test('Workspace not READY returns controlled 503 while status remains available', async () => {
    const root = await tempRoot('not ready', false);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });
    assert.notEqual(service.status.state, 'READY');
    const status = await service.app.inject({ method: 'GET', url: '/api/v1/workspace/status' });
    assert.equal(status.statusCode, 200);
    const browse = await service.app.inject({ method: 'GET', url: '/api/v1/library/cards' });
    assert.equal(browse.statusCode, 503);
    assert.equal(browse.json().code, 'WORKSPACE_NOT_READY');
    const facets = await service.app.inject({ method: 'GET', url: '/api/v1/library/facets' });
    assert.equal(facets.statusCode, 503);
    await service.close();
});

test('Library query on schema 3 does not implicitly migrate Workspace', async () => {
    const root = await tempRoot('schema3');
    const databasePath = await createSchema3Database(root);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });
    assert.equal(service.status.state, 'NEEDS_MIGRATION');
    assert.equal(service.status.database_schema_version, 3);
    const response = await service.app.inject({ method: 'GET', url: '/api/v1/library/cards' });
    assert.equal(response.statusCode, 503);
    await service.close();

    const database = new Database(databasePath, { readonly: true, fileMustExist: true });
    assert.equal(database.pragma('user_version', { simple: true }), 3);
    assert.deepEqual(database.prepare('SELECT version FROM _workspace_migrations ORDER BY version').all(), [
        { version: 1 }, { version: 2 }, { version: 3 },
    ]);
    database.close();
});

test('malformed family, pagination and unknown query parameters receive controlled validation errors', async () => {
    const { service } = await readyService('validation');
    for (const url of [
        '/api/v1/library/cards?family=SKILL',
        '/api/v1/library/cards?limit=0',
        '/api/v1/library/cards?limit=201',
        '/api/v1/library/cards?offset=-1',
        '/api/v1/library/cards?unexpected=value',
    ]) {
        const response = await service.app.inject({ method: 'GET', url });
        assert.equal(response.statusCode, 400, url);
    }
    await service.close();
});

test('SQL metacharacters remain data and never become query syntax', async () => {
    const { service, library } = await readyService('sql safety');
    createCard(service, 'SPELL', '75000001', { EN: 'Ordinary Card' });
    const payload = `' OR 1=1 --`;
    assert.equal(library.browse({ query: payload }).total, 0);
    assert.equal(library.browse({ archetype: payload }).total, 0);
    const response = await service.app.inject({
        method: 'GET',
        url: `/api/v1/library/cards?query=${encodeURIComponent(payload)}`,
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().total, 0);
    await service.close();
});

test('browse is read-only: revision/classification/migration history and scan count remain unchanged', async () => {
    const { service, canonical, library, persistence } = await readyService('read only');
    const classifier = canonical.registerNamedEntity('EFFECT_CLASSIFIER', 'Reviewed');
    const card = createCard(service, 'SPELL', '76000001', { EN: 'Read Only' }, {
        effectClassifierIds: [classifier.id],
        effectReviewed: true,
    });

    const before = persistence.runRepositoryOperation(database => ({
        revision: database.prepare('SELECT revision FROM canonical_cards WHERE card_id = ?').get(card.cardId),
        classification: database.prepare('SELECT effect_reviewed FROM canonical_classification_state WHERE card_id = ?').get(card.cardId),
        migrations: database.prepare('SELECT version, name FROM _workspace_migrations ORDER BY version').all(),
        scans: database.prepare('SELECT count(*) AS count FROM asset_index_scans').get(),
    }));

    const direct = library.browse({ query: 'Read Only', preferredLanguage: 'ES' });
    assert.equal(direct.total, 1);
    const http = await service.app.inject({ method: 'GET', url: '/api/v1/library/cards?query=Read%20Only' });
    assert.equal(http.statusCode, 200);

    const after = persistence.runRepositoryOperation(database => ({
        revision: database.prepare('SELECT revision FROM canonical_cards WHERE card_id = ?').get(card.cardId),
        classification: database.prepare('SELECT effect_reviewed FROM canonical_classification_state WHERE card_id = ?').get(card.cardId),
        migrations: database.prepare('SELECT version, name FROM _workspace_migrations ORDER BY version').all(),
        scans: database.prepare('SELECT count(*) AS count FROM asset_index_scans').get(),
    }));

    assert.deepEqual(after, before);
    await service.close();
});

test('supported schema remains 4 and normal Library/status requests preserve service regression behavior', async () => {
    const { service } = await readyService('schema status');
    assert.equal(SUPPORTED_DATABASE_SCHEMA_VERSION, 4);
    assert.equal(service.status.database_schema_version, 4);
    const status = await service.app.inject({ method: 'GET', url: '/api/v1/workspace/status' });
    assert.equal(status.statusCode, 200);
    assert.equal(status.json().database_schema_version, 4);
    const browse = await service.app.inject({ method: 'GET', url: '/api/v1/library/cards?preferred_language=JP&limit=50&offset=0' });
    assert.equal(browse.statusCode, 200);
    await service.close();
});
