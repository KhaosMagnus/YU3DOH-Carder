import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Database from 'better-sqlite3';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from '../src/persistence/constants';
import { bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { resolveWorkspaceDatabasePath } from '../src/persistence/path';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { SUPPORTED_WORKSPACE_FORMAT_VERSION, type WorkspaceManifest } from '../src/workspace/types';

const roots: string[] = [];

const manifest = (): WorkspaceManifest => ({
    workspace_id: 'workspace-run007',
    workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION,
    database_path: 'Data/workspace.db',
    created_at: '2026-10-07T00:00:00.000Z',
    name: 'RUN 007 Library Editor Test Workspace',
});

const tempRoot = async (label: string, writeManifest = true) => {
    const root = await mkdtemp(path.join(os.tmpdir(), `yu3doh run007 ${label} `));
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
    assert.ok(service.persistence);
    return { root, service, canonical: service.canonical, persistence: service.persistence };
};

const source = { source_kind: 'MANUAL', source_ref: 'run007-test', note: null as string | null };

const createSchema3Database = async (root: string) => {
    const value = manifest();
    const databasePath = resolveWorkspaceDatabasePath(root, value.database_path);
    await mkdir(path.dirname(databasePath), { recursive: true });
    const database = new Database(databasePath);
    for (const [version, name] of [
        [1, '001_repository_foundation.sql'],
        [2, '002_canonical_domain.sql'],
        [3, '003_art_variants_asset_index.sql'],
    ] as const) {
        const sql = readFileSync(path.resolve(process.cwd(), 'migrations', name), 'utf8');
        database.exec(sql);
        database.prepare('INSERT INTO _workspace_migrations (version, name) VALUES (?, ?)').run(
            version,
            name.replace(/^\d+_/, '').replace(/\.sql$/, ''),
        );
        database.pragma(`user_version = ${version}`);
    }
    database.close();
    return databasePath;
};

test.after(async () => {
    await Promise.all(roots.map(root => rm(root, { recursive: true, force: true })));
});

test('GET detail returns complete Canonical snapshot for existing card', async () => {
    const { service, canonical } = await readyService('get detail');
    const card = canonical.createCard({ family: 'SPELL', password: '10000001' });
    const mutated = canonical.mutateCard(card.cardId, card.revision, {
        localizations: [{ language: 'EN', name: 'Detail Card', cardText: 'Text', pendulumText: null }],
    });
    const response = await service.app.inject({
        method: 'GET',
        url: `/api/v1/library/cards/${mutated.cardId}`,
    });
    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.card_id, mutated.cardId);
    assert.equal(body.revision, mutated.revision);
    assert.equal(body.family, 'SPELL');
    assert.equal(body.password, '10000001');
    assert.equal(body.localizations.length, 1);
    assert.equal(body.localizations[0].language, 'EN');
    assert.equal(body.localizations[0].name, 'Detail Card');
    assert.equal(body.localizations[0].card_text, 'Text');
    assert.ok(Array.isArray(body.confirmations));
    assert.ok(Array.isArray(body.provenance));
    assert.equal(body.classification.effect_reviewed, false);
    await service.close();
});

test('GET unknown card returns 404 NOT_FOUND', async () => {
    const { service } = await readyService('get unknown');
    const response = await service.app.inject({
        method: 'GET',
        url: '/api/v1/library/cards/00000000-0000-4000-8000-000000000099',
    });
    assert.equal(response.statusCode, 404);
    assert.equal(response.json().code, 'NOT_FOUND');
    await service.close();
});

test('POST creates explicit New Draft and returns detail', async () => {
    const { service } = await readyService('post draft');
    const response = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards',
        payload: { family: 'MONSTER', password: null },
    });
    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.family, 'MONSTER');
    assert.equal(body.password, null);
    assert.equal(body.revision, '1');
    assert.deepEqual(body.confirmations, []);
    assert.equal(body.structure, null);
    await service.close();
});

test('Token Draft creates without password', async () => {
    const { service } = await readyService('token draft');
    const response = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards',
        payload: { family: 'TOKEN' },
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().family, 'TOKEN');
    assert.equal(response.json().password, null);
    await service.close();
});

test('Token password is rejected with 422 DOMAIN_VALIDATION', async () => {
    const { service } = await readyService('token password');
    const response = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards',
        payload: { family: 'TOKEN', password: '12345678' },
    });
    assert.equal(response.statusCode, 422);
    assert.equal(response.json().code, 'DOMAIN_VALIDATION');
    await service.close();
});

test('non-Token incomplete Draft may omit password', async () => {
    const { service } = await readyService('incomplete draft');
    const response = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards',
        payload: { family: 'TRAP' },
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().password, null);
    assert.equal(response.json().structure, null);
    await service.close();
});

test('family is immutable: PATCH rejects family property via schema', async () => {
    const { service, canonical } = await readyService('family immutable');
    const card = canonical.createCard({ family: 'SPELL' });
    const response = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${card.cardId}`,
        payload: {
            expected_revision: card.revision,
            family: 'TRAP',
        },
    });
    assert.equal(response.statusCode, 400);
    const detail = await service.app.inject({
        method: 'GET',
        url: `/api/v1/library/cards/${card.cardId}`,
    });
    assert.equal(detail.json().family, 'SPELL');
    await service.close();
});

test('successful mutation returns snapshot and advances revision', async () => {
    const { service, canonical } = await readyService('mutate success');
    const card = canonical.createCard({ family: 'SPELL', password: '20000001' });
    const response = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${card.cardId}`,
        payload: {
            expected_revision: card.revision,
            structure: { kind: 'SPELL', subtype_code: 'NORMAL' },
            localizations: [{
                language: 'EN',
                name: 'Patched',
                card_text: 'Body',
                pendulum_text: null,
            }],
        },
    });
    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.revision, '2');
    assert.equal(body.structure.kind, 'SPELL');
    assert.equal(body.structure.subtype_code, 'NORMAL');
    assert.equal(body.localizations[0].name, 'Patched');
    await service.close();
});

test('stale revision yields 409 REVISION_CONFLICT and leaves DB unchanged', async () => {
    const { service, canonical, persistence } = await readyService('stale revision');
    const card = canonical.createCard({ family: 'SPELL', password: '20000002' });
    const first = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${card.cardId}`,
        payload: {
            expected_revision: card.revision,
            localizations: [{ language: 'EN', name: 'First', card_text: null, pendulum_text: null }],
        },
    });
    assert.equal(first.statusCode, 200);
    const before = persistence.runRepositoryOperation(database =>
        database.prepare('SELECT revision, password FROM canonical_cards WHERE card_id = ?').get(card.cardId));
    const stale = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${card.cardId}`,
        payload: {
            expected_revision: card.revision,
            localizations: [{ language: 'EN', name: 'Stale', card_text: null, pendulum_text: null }],
        },
    });
    assert.equal(stale.statusCode, 409);
    assert.equal(stale.json().code, 'REVISION_CONFLICT');
    const after = persistence.runRepositoryOperation(database =>
        database.prepare('SELECT revision, password FROM canonical_cards WHERE card_id = ?').get(card.cardId));
    assert.deepEqual(after, before);
    const detail = await service.app.inject({
        method: 'GET',
        url: `/api/v1/library/cards/${card.cardId}`,
    });
    assert.equal(detail.json().localizations[0].name, 'First');
    await service.close();
});

const confirmBlock = async (
    service: WorkspaceService,
    cardId: string,
    revision: string,
    block: string,
    extra: Record<string, unknown> = {},
) => {
    const response = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${cardId}`,
        payload: {
            expected_revision: revision,
            ...extra,
            confirmations: [{
                block,
                state: 'CONFIRMED',
                provenance: source,
            }],
        },
    });
    assert.equal(response.statusCode, 200, response.body);
    return response.json();
};

test('silent overwrite of CONFIRMED STRUCTURE/TEXT/CLASSIFICATION/RELATIONS is rejected', async () => {
    const { service, canonical } = await readyService('confirmed silent');
    const target = canonical.createCard({ family: 'TOKEN' });
    const created = canonical.createCard({ family: 'SPELL', password: '30000001' });
    let detail = await confirmBlock(service, created.cardId, created.revision, 'STRUCTURE', {
        structure: { kind: 'SPELL', subtype_code: 'NORMAL' },
    });
    detail = await confirmBlock(service, detail.card_id, detail.revision, 'TEXT:EN', {
        localizations: [{ language: 'EN', name: 'Confirmed', card_text: 'Text', pendulum_text: null }],
    });
    detail = await confirmBlock(service, detail.card_id, detail.revision, 'CLASSIFICATION', {
        classification: {
            effect_reviewed: true,
            archetype_ids: [],
            effect_classifier_ids: [],
            functional_tag_ids: [],
        },
    });
    detail = await confirmBlock(service, detail.card_id, detail.revision, 'RELATIONS', {
        relations: [{ target_card_id: target.cardId, relation_type_code: 'CREATES_TOKEN', note: null }],
    });

    const structureSilent = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${detail.card_id}`,
        payload: {
            expected_revision: detail.revision,
            structure: { kind: 'SPELL', subtype_code: 'CONTINUOUS' },
        },
    });
    assert.equal(structureSilent.statusCode, 422);
    assert.equal(structureSilent.json().code, 'DOMAIN_VALIDATION');

    const textSilent = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${detail.card_id}`,
        payload: {
            expected_revision: detail.revision,
            localizations: [{ language: 'EN', name: 'Changed', card_text: 'X', pendulum_text: null }],
        },
    });
    assert.equal(textSilent.statusCode, 422);

    const classSilent = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${detail.card_id}`,
        payload: {
            expected_revision: detail.revision,
            classification: { effect_reviewed: false },
        },
    });
    assert.equal(classSilent.statusCode, 422);

    const relationsSilent = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${detail.card_id}`,
        payload: {
            expected_revision: detail.revision,
            relations: [],
        },
    });
    assert.equal(relationsSilent.statusCode, 422);
    assert.equal(canonical.getCard(detail.card_id)!.revision, detail.revision);
    await service.close();
});

test('confirmed block edit with explicit DRAFT transition succeeds', async () => {
    const { service, canonical } = await readyService('confirmed draft');
    let card = canonical.createCard({ family: 'SPELL', password: '30000002' });
    const confirmed = await confirmBlock(service, card.cardId, card.revision, 'STRUCTURE', {
        structure: { kind: 'SPELL', subtype_code: 'NORMAL' },
    });
    const response = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${confirmed.card_id}`,
        payload: {
            expected_revision: confirmed.revision,
            structure: { kind: 'SPELL', subtype_code: 'FIELD' },
            confirmations: [{ block: 'STRUCTURE', state: 'DRAFT' }],
        },
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().structure.subtype_code, 'FIELD');
    const structureState = response.json().confirmations.find((item: { block: string }) => item.block === 'STRUCTURE');
    assert.equal(structureState.state, 'DRAFT');
    await service.close();
});

test('confirmed block reconfirm with provenance succeeds; without provenance fails atomically', async () => {
    const { service, canonical } = await readyService('reconfirm');
    let card = canonical.createCard({ family: 'SPELL', password: '30000003' });
    const confirmed = await confirmBlock(service, card.cardId, card.revision, 'STRUCTURE', {
        structure: { kind: 'SPELL', subtype_code: 'NORMAL' },
    });
    const missing = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${confirmed.card_id}`,
        payload: {
            expected_revision: confirmed.revision,
            structure: { kind: 'SPELL', subtype_code: 'EQUIP' },
            confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED' }],
        },
    });
    assert.equal(missing.statusCode, 422);
    assert.equal(canonical.getCard(confirmed.card_id)!.revision, confirmed.revision);

    const ok = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${confirmed.card_id}`,
        payload: {
            expected_revision: confirmed.revision,
            structure: { kind: 'SPELL', subtype_code: 'EQUIP' },
            confirmations: [{
                block: 'STRUCTURE',
                state: 'CONFIRMED',
                provenance: { source_kind: 'MANUAL', source_ref: 'reconfirm', note: 'updated' },
            }],
        },
    });
    assert.equal(ok.statusCode, 200);
    assert.equal(ok.json().structure.subtype_code, 'EQUIP');
    await service.close();
});

test('EN/ES/JP edit independently without fabricating other languages', async () => {
    const { service, canonical } = await readyService('locales');
    const card = canonical.createCard({ family: 'SPELL', password: '40000001' });
    const en = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${card.cardId}`,
        payload: {
            expected_revision: card.revision,
            localizations: [{ language: 'EN', name: 'English', card_text: 'EN text', pendulum_text: null }],
        },
    });
    assert.equal(en.statusCode, 200);
    assert.equal(en.json().localizations.length, 1);
    const es = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${card.cardId}`,
        payload: {
            expected_revision: en.json().revision,
            localizations: [{ language: 'ES', name: 'Español', card_text: 'ES text', pendulum_text: null }],
        },
    });
    assert.equal(es.statusCode, 200);
    assert.equal(es.json().localizations.length, 2);
    const languages = es.json().localizations.map((item: { language: string }) => item.language).sort();
    assert.deepEqual(languages, ['EN', 'ES']);
    assert.equal(es.json().localizations.find((item: { language: string }) => item.language === 'EN').name, 'English');
    await service.close();
});

test('Monster / Pendulum / Link / Spell / Trap structures map correctly', async () => {
    const { service, canonical } = await readyService('structures');
    canonical.registerStructuralCode('ATTRIBUTE', 'LIGHT');
    canonical.registerStructuralCode('RACE', 'DRAGON');
    canonical.registerStructuralCode('ABILITY', 'PENDULUM');
    canonical.registerStructuralCode('LINK_MARKER', 'TOP');
    canonical.registerStructuralCode('LINK_MARKER', 'BOTTOM');

    const monsterCreate = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards',
        payload: { family: 'MONSTER', password: '50000001' },
    });
    const monster = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${monsterCreate.json().card_id}`,
        payload: {
            expected_revision: monsterCreate.json().revision,
            structure: {
                kind: 'MONSTER',
                summon_kind: 'MAIN_DECK',
                attribute_code: 'LIGHT',
                race_code: 'DRAGON',
                level: 4,
                rank: null,
                atk: 1800,
                def: 1200,
                pendulum_scale: 3,
                abilities: ['PENDULUM'],
                link_markers: [],
            },
        },
    });
    assert.equal(monster.statusCode, 200, monster.body);
    assert.equal(monster.json().structure.pendulum_scale, 3);
    assert.equal(monster.json().structure.link_rating, null);
    assert.equal('link_rating' in (JSON.parse(JSON.stringify(monster.json().structure))), true);

    const linkCreate = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards',
        payload: { family: 'MONSTER', password: '50000002' },
    });
    const link = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${linkCreate.json().card_id}`,
        payload: {
            expected_revision: linkCreate.json().revision,
            structure: {
                kind: 'MONSTER',
                summon_kind: 'LINK',
                attribute_code: 'LIGHT',
                race_code: 'DRAGON',
                level: null,
                rank: null,
                atk: 1000,
                def: null,
                pendulum_scale: null,
                abilities: [],
                link_markers: ['TOP', 'BOTTOM'],
            },
        },
    });
    assert.equal(link.statusCode, 200, link.body);
    assert.equal(link.json().structure.link_rating, 2);

    const spell = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards',
        payload: { family: 'SPELL', password: '50000003' },
    });
    const spellPatch = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${spell.json().card_id}`,
        payload: {
            expected_revision: spell.json().revision,
            structure: { kind: 'SPELL', subtype_code: 'QUICK_PLAY' },
        },
    });
    assert.equal(spellPatch.statusCode, 200);
    assert.equal(spellPatch.json().structure.subtype_code, 'QUICK_PLAY');

    const trap = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards',
        payload: { family: 'TRAP', password: '50000004' },
    });
    const trapPatch = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${trap.json().card_id}`,
        payload: {
            expected_revision: trap.json().revision,
            structure: { kind: 'TRAP', subtype_code: 'COUNTER' },
        },
    });
    assert.equal(trapPatch.statusCode, 200);
    assert.equal(trapPatch.json().structure.subtype_code, 'COUNTER');

    const rejectLinkRatingInput = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${linkCreate.json().card_id}`,
        payload: {
            expected_revision: link.json().revision,
            structure: {
                kind: 'MONSTER',
                summon_kind: 'LINK',
                attribute_code: 'LIGHT',
                race_code: 'DRAGON',
                level: null,
                rank: null,
                atk: 1000,
                def: null,
                pendulum_scale: null,
                abilities: [],
                link_markers: ['TOP'],
                link_rating: 99,
            },
        },
    });
    assert.equal(rejectLinkRatingInput.statusCode, 400);
    await service.close();
});

test('classification reviewed-empty and named associations round-trip', async () => {
    const { service, canonical } = await readyService('classification');
    const archetype = canonical.registerNamedEntity('ARCHETYPE', 'Blue-Eyes');
    const classifier = canonical.registerNamedEntity('EFFECT_CLASSIFIER', 'Summon');
    const tag = canonical.registerNamedEntity('FUNCTIONAL_TAG', 'Starter');
    const card = canonical.createCard({ family: 'SPELL', password: '60000001' });
    const reviewedEmpty = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${card.cardId}`,
        payload: {
            expected_revision: card.revision,
            classification: {
                effect_reviewed: true,
                archetype_ids: [],
                effect_classifier_ids: [],
                functional_tag_ids: [],
            },
        },
    });
    assert.equal(reviewedEmpty.statusCode, 200);
    assert.equal(reviewedEmpty.json().classification.effect_reviewed, true);
    assert.deepEqual(reviewedEmpty.json().classification.effect_classifiers, []);

    const associated = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${card.cardId}`,
        payload: {
            expected_revision: reviewedEmpty.json().revision,
            classification: {
                effect_reviewed: true,
                archetype_ids: [archetype.id],
                effect_classifier_ids: [classifier.id],
                functional_tag_ids: [tag.id],
            },
        },
    });
    assert.equal(associated.statusCode, 200);
    assert.deepEqual(
        associated.json().classification.archetypes.map((item: { code: string }) => item.code),
        ['Blue-Eyes'],
    );
    assert.deepEqual(
        associated.json().classification.effect_classifiers.map((item: { code: string }) => item.code),
        ['Summon'],
    );
    assert.deepEqual(
        associated.json().classification.functional_tags.map((item: { code: string }) => item.code),
        ['Starter'],
    );
    await service.close();
});

test('relations use internal IDs; dangling target rolls back', async () => {
    const { service, canonical } = await readyService('relations');
    const sourceCard = canonical.createCard({ family: 'SPELL', password: '70000001' });
    const target = canonical.createCard({ family: 'TOKEN' });
    const ok = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${sourceCard.cardId}`,
        payload: {
            expected_revision: sourceCard.revision,
            relations: [{
                target_card_id: target.cardId,
                relation_type_code: 'CREATES_TOKEN',
                note: 'explicit',
            }],
        },
    });
    assert.equal(ok.statusCode, 200);
    assert.equal(ok.json().relations[0].target_card_id, target.cardId);
    assert.equal(ok.json().relations[0].relation_type_code, 'CREATES_TOKEN');

    const dangling = await service.app.inject({
        method: 'PATCH',
        url: `/api/v1/library/cards/${sourceCard.cardId}`,
        payload: {
            expected_revision: ok.json().revision,
            relations: [{
                target_card_id: '00000000-0000-4000-8000-000000000000',
                relation_type_code: 'CREATES_TOKEN',
            }],
        },
    });
    assert.equal(dangling.statusCode, 422);
    assert.equal(dangling.json().code, 'DOMAIN_VALIDATION');
    const after = canonical.getCard(sourceCard.cardId)!;
    assert.equal(after.revision, ok.json().revision);
    assert.equal(after.relations.length, 1);
    await service.close();
});

test('detail and editor-metadata reads do not mutate revision, scans, or migrations', async () => {
    const { service, canonical, persistence } = await readyService('read only editor');
    const card = canonical.createCard({ family: 'SPELL', password: '80000001' });
    const before = persistence.runRepositoryOperation(database => ({
        revision: database.prepare('SELECT revision FROM canonical_cards WHERE card_id = ?').get(card.cardId),
        migrations: database.prepare('SELECT version, name FROM _workspace_migrations ORDER BY version').all(),
        scans: database.prepare('SELECT count(*) AS count FROM asset_index_scans').get(),
        schema: database.pragma('user_version', { simple: true }),
    }));

    const detail = await service.app.inject({
        method: 'GET',
        url: `/api/v1/library/cards/${card.cardId}`,
    });
    assert.equal(detail.statusCode, 200);
    const metadata = await service.app.inject({
        method: 'GET',
        url: '/api/v1/library/editor-metadata',
    });
    assert.equal(metadata.statusCode, 200);
    assert.ok(metadata.json().summon_kinds.includes('LINK'));
    assert.ok(metadata.json().spell_subtypes.includes('NORMAL'));
    assert.ok(metadata.json().relation_types.includes('CREATES_TOKEN'));
    assert.deepEqual(metadata.json().languages, ['EN', 'ES', 'JP']);

    const after = persistence.runRepositoryOperation(database => ({
        revision: database.prepare('SELECT revision FROM canonical_cards WHERE card_id = ?').get(card.cardId),
        migrations: database.prepare('SELECT version, name FROM _workspace_migrations ORDER BY version').all(),
        scans: database.prepare('SELECT count(*) AS count FROM asset_index_scans').get(),
        schema: database.pragma('user_version', { simple: true }),
    }));
    assert.deepEqual(after, before);
    assert.equal(SUPPORTED_DATABASE_SCHEMA_VERSION, 5);
    await service.close();
});

test('Workspace not READY returns 503 for detail/create/patch/metadata', async () => {
    const root = await tempRoot('not ready', false);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });
    assert.notEqual(service.status.state, 'READY');
    for (const [method, url, payload] of [
        ['GET', '/api/v1/library/cards/00000000-0000-4000-8000-000000000001', undefined],
        ['POST', '/api/v1/library/cards', { family: 'SPELL' }],
        ['PATCH', '/api/v1/library/cards/00000000-0000-4000-8000-000000000001', { expected_revision: '1' }],
        ['GET', '/api/v1/library/editor-metadata', undefined],
    ] as const) {
        const response = await service.app.inject({
            method,
            url,
            ...(payload ? { payload } : {}),
        });
        assert.equal(response.statusCode, 503, url);
        assert.equal(response.json().code, 'WORKSPACE_NOT_READY');
    }
    const status = await service.app.inject({ method: 'GET', url: '/api/v1/workspace/status' });
    assert.equal(status.statusCode, 200);
    await service.close();
});

test('editor mutation does not implicitly migrate schema 3', async () => {
    const root = await tempRoot('schema3');
    const databasePath = await createSchema3Database(root);
    const service = await createWorkspaceService({ workspaceRoot: root, host: '127.0.0.1', port: 4312 });
    assert.equal(service.status.state, 'NEEDS_MIGRATION');
    const response = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards',
        payload: { family: 'SPELL' },
    });
    assert.equal(response.statusCode, 503);
    await service.close();
    const database = new Database(databasePath, { readonly: true, fileMustExist: true });
    assert.equal(database.pragma('user_version', { simple: true }), 3);
    database.close();
});

test('createCard transaction rolls back on Token password validation', async () => {
    const { service, persistence } = await readyService('create rollback');
    const before = persistence.runRepositoryOperation(database =>
        database.prepare('SELECT count(*) AS count FROM canonical_cards').get() as { count: number });
    const response = await service.app.inject({
        method: 'POST',
        url: '/api/v1/library/cards',
        payload: { family: 'TOKEN', password: 'bad' },
    });
    assert.equal(response.statusCode, 422);
    const after = persistence.runRepositoryOperation(database =>
        database.prepare('SELECT count(*) AS count FROM canonical_cards').get() as { count: number });
    assert.equal(after.count, before.count);
    await service.close();
});
