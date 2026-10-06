import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Database from 'better-sqlite3';
import { CanonicalDomainError } from '../src/canonical/errors';
import type { CanonicalDomainService } from '../src/canonical/service';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from '../src/persistence/constants';
import { readDatabaseSchemaVersion } from '../src/persistence/database';
import { migrateWorkspaceDatabase, bootstrapWorkspaceDatabase } from '../src/persistence/operations';
import { resolveWorkspaceDatabasePath } from '../src/persistence/path';
import { createWorkspaceService, type WorkspaceService } from '../src/service';
import { inspectWorkspaceRoot } from '../src/workspace/inspect';
import {
    SUPPORTED_WORKSPACE_FORMAT_VERSION,
    type WorkspaceManifest,
} from '../src/workspace/types';

const tempRoots: string[] = [];

const createTempRoot = async (label: string) => {
    const root = await mkdtemp(path.join(os.tmpdir(), `yu3doh run003 ${label} `));
    tempRoots.push(root);
    return root;
};

const manifest = (overrides: Partial<WorkspaceManifest> = {}): WorkspaceManifest => ({
    workspace_id: 'workspace-run003',
    workspace_format_version: SUPPORTED_WORKSPACE_FORMAT_VERSION,
    database_path: 'Data/workspace.db',
    created_at: '2026-10-05T00:00:00.000Z',
    name: 'RUN 003 Test Workspace',
    ...overrides,
});

const writeManifest = async (root: string, value = manifest()) => {
    await writeFile(path.join(root, 'workspace.json'), JSON.stringify(value), 'utf8');
};

const createSchema1Database = async (root: string, value = manifest()) => {
    const databasePath = resolveWorkspaceDatabasePath(root, value.database_path);
    await mkdir(path.dirname(databasePath), { recursive: true });
    const database = new Database(databasePath);
    const migration001 = readFileSync(
        path.resolve(process.cwd(), 'migrations/001_repository_foundation.sql'),
        'utf8',
    );
    database.exec(migration001);
    database.prepare(`
        INSERT INTO _workspace_migrations (version, name)
        VALUES (1, 'repository_foundation')
    `).run();
    database.pragma('user_version = 1');
    database.close();
    return databasePath;
};

const createReadyService = async (
    label: string,
    value = manifest(),
): Promise<{ root: string; service: WorkspaceService; canonical: CanonicalDomainService }> => {
    const root = await createTempRoot(label);
    await writeManifest(root, value);
    bootstrapWorkspaceDatabase(root, value);
    const service = await createWorkspaceService({
        workspaceRoot: root,
        host: '127.0.0.1',
        port: 4312,
    });
    assert.equal(service.status.state, 'READY');
    assert.ok(service.canonical);
    return { root, service, canonical: service.canonical };
};

const registerMonsterBasics = (canonical: CanonicalDomainService) => {
    canonical.registerStructuralCode('ATTRIBUTE', 'LIGHT');
    canonical.registerStructuralCode('RACE', 'DRAGON');
};

const source = {
    sourceKind: 'MANUAL',
    sourceRef: 'run003-test',
};

test.after(async () => {
    await Promise.all(tempRoots.map(root => rm(root, { recursive: true, force: true })));
});

test('schema 1 is NEEDS_MIGRATION and status inspection does not modify it', async () => {
    const root = await createTempRoot('schema1 inspect');
    const value = manifest();
    await writeManifest(root, value);
    const databasePath = await createSchema1Database(root, value);

    const before = new Database(databasePath, { readonly: true, fileMustExist: true });
    assert.equal(readDatabaseSchemaVersion(before), 1);
    before.close();

    const status = await inspectWorkspaceRoot(root);

    assert.equal(status.state, 'NEEDS_MIGRATION');
    assert.equal(status.database_schema_version, 1);
    const after = new Database(databasePath, { readonly: true, fileMustExist: true });
    assert.equal(readDatabaseSchemaVersion(after), 1);
    assert.deepEqual(
        after.prepare('SELECT version, name FROM _workspace_migrations ORDER BY version').all(),
        [{ version: 1, name: 'repository_foundation' }],
    );
    after.close();
});

test('explicit migration upgrades schema 1 through canonical schema to current schema with continuous history', async () => {
    const root = await createTempRoot('schema1 explicit migration');
    const value = manifest();
    await writeManifest(root, value);
    const databasePath = await createSchema1Database(root, value);

    const result = migrateWorkspaceDatabase(root, value);

    assert.equal(result.previousVersion, 1);
    assert.equal(result.currentVersion, SUPPORTED_DATABASE_SCHEMA_VERSION);
    assert.deepEqual(result.appliedVersions, [2, 3, 4]);

    const database = new Database(databasePath, { readonly: true, fileMustExist: true });
    assert.equal(readDatabaseSchemaVersion(database), SUPPORTED_DATABASE_SCHEMA_VERSION);
    assert.deepEqual(
        database.prepare('SELECT version, name FROM _workspace_migrations ORDER BY version').all(),
        [
            { version: 1, name: 'repository_foundation' },
            { version: 2, name: 'canonical_domain' },
            { version: 3, name: 'art_variants_asset_index' },
            { version: 4, name: 'managed_asset_ingest' },
        ],
    );
    database.close();
});

test('fresh bootstrap preserves canonical migration ordering and reaches current schema', async () => {
    const root = await createTempRoot('fresh schema2');
    const value = manifest();
    await writeManifest(root, value);

    const result = bootstrapWorkspaceDatabase(root, value);

    assert.equal(result.previousVersion, 0);
    assert.equal(result.currentVersion, SUPPORTED_DATABASE_SCHEMA_VERSION);
    assert.deepEqual(result.appliedVersions, [1, 2, 3, 4]);
});

test('unsupported SKILL family is rejected and supported family identity is UUID-compatible', async () => {
    const { service, canonical } = await createReadyService('family validation');
    assert.throws(
        () => canonical.createCard({ family: 'SKILL' as never }),
        (error: unknown) => error instanceof CanonicalDomainError && error.code === 'DOMAIN_VALIDATION',
    );

    const card = canonical.createCard({ family: 'MONSTER' });
    assert.match(card.cardId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    assert.equal(card.password, null);
    assert.equal(card.revision, '1');
    await service.close();
});

test('draft non-Token without password persists but STRUCTURE confirmation fails atomically', async () => {
    const { service, canonical } = await createReadyService('draft no password');
    registerMonsterBasics(canonical);
    const card = canonical.createCard({ family: 'MONSTER' });

    const draft = canonical.mutateCard(card.cardId, card.revision, {
        structure: {
            kind: 'MONSTER',
            summonKind: 'MAIN_DECK',
            attributeCode: 'LIGHT',
            raceCode: 'DRAGON',
            level: 4,
            rank: null,
            atk: 1800,
            def: 1200,
            pendulumScale: null,
            abilities: ['EFFECT'],
            linkMarkers: [],
        },
    });
    assert.equal(draft.password, null);
    assert.equal(draft.confirmations.length, 0);

    assert.throws(
        () => canonical.mutateCard(draft.cardId, draft.revision, {
            confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
        }),
        (error: unknown) => error instanceof CanonicalDomainError && error.code === 'DOMAIN_VALIDATION',
    );

    const after = canonical.getCard(card.cardId);
    assert.ok(after);
    assert.equal(after.revision, draft.revision);
    assert.equal(after.confirmations.length, 0);
    assert.equal(after.provenance.length, 0);
    await service.close();
});

test('Token without password confirms successfully with Token structural rules', async () => {
    const { service, canonical } = await createReadyService('token confirm');
    registerMonsterBasics(canonical);
    const token = canonical.createCard({ family: 'TOKEN' });

    const confirmed = canonical.mutateCard(token.cardId, token.revision, {
        structure: {
            kind: 'TOKEN',
            attributeCode: 'LIGHT',
            raceCode: 'DRAGON',
            level: 1,
            atk: '?',
            def: 0,
        },
        confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
    });

    assert.equal(confirmed.password, null);
    assert.equal(confirmed.confirmations.find(block => block.block === 'STRUCTURE')?.state, 'CONFIRMED');
    await service.close();
});

test('internal identity remains stable when password changes and passwords are not unique keys', async () => {
    const { service, canonical } = await createReadyService('identity password');
    const first = canonical.createCard({ family: 'SPELL', password: '00000001' });
    const second = canonical.createCard({ family: 'TRAP', password: '00000001' });
    assert.notEqual(first.cardId, second.cardId);

    const mutated = canonical.mutateCard(first.cardId, first.revision, { password: '99999999' });
    assert.equal(mutated.cardId, first.cardId);
    assert.equal(mutated.password, '99999999');
    await service.close();
});

test('Monster summon kind, ordered abilities and stats round-trip independently', async () => {
    const { service, canonical } = await createReadyService('monster roundtrip');
    registerMonsterBasics(canonical);
    const card = canonical.createCard({ family: 'MONSTER', password: '12345678' });

    const saved = canonical.mutateCard(card.cardId, card.revision, {
        structure: {
            kind: 'MONSTER',
            summonKind: 'SYNCHRO',
            attributeCode: 'LIGHT',
            raceCode: 'DRAGON',
            level: 8,
            rank: null,
            atk: 2500,
            def: '?',
            pendulumScale: null,
            abilities: ['TUNER', 'EFFECT'],
            linkMarkers: [],
        },
        confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
    });

    assert.deepEqual(saved.structure, {
        kind: 'MONSTER',
        summonKind: 'SYNCHRO',
        attributeCode: 'LIGHT',
        raceCode: 'DRAGON',
        level: 8,
        rank: null,
        atk: 2500,
        def: '?',
        pendulumScale: null,
        abilities: ['TUNER', 'EFFECT'],
        linkMarkers: [],
        linkRating: null,
    });
    await service.close();
});

test('Spell and Trap controlled subtype codes round-trip', async () => {
    const { service, canonical } = await createReadyService('spell trap');
    const spell = canonical.createCard({ family: 'SPELL', password: '11111111' });
    const trap = canonical.createCard({ family: 'TRAP', password: '22222222' });

    const savedSpell = canonical.mutateCard(spell.cardId, spell.revision, {
        structure: { kind: 'SPELL', subtypeCode: 'QUICK_PLAY' },
        confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
    });
    const savedTrap = canonical.mutateCard(trap.cardId, trap.revision, {
        structure: { kind: 'TRAP', subtypeCode: 'COUNTER' },
        confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
    });

    assert.deepEqual(savedSpell.structure, { kind: 'SPELL', subtypeCode: 'QUICK_PLAY' });
    assert.deepEqual(savedTrap.structure, { kind: 'TRAP', subtypeCode: 'COUNTER' });
    await service.close();
});

test('Pendulum persists one canonical scale and requires localized Pendulum text when TEXT is confirmed', async () => {
    const { service, canonical } = await createReadyService('pendulum');
    registerMonsterBasics(canonical);
    const card = canonical.createCard({ family: 'MONSTER', password: '33333333' });

    const structured = canonical.mutateCard(card.cardId, card.revision, {
        structure: {
            kind: 'MONSTER',
            summonKind: 'FUSION',
            attributeCode: 'LIGHT',
            raceCode: 'DRAGON',
            level: 7,
            rank: null,
            atk: 2400,
            def: 2000,
            pendulumScale: 4,
            abilities: ['PENDULUM', 'EFFECT'],
            linkMarkers: [],
        },
        localizations: [{
            language: 'EN',
            name: 'Pendulum Example',
            cardText: 'Monster text',
            pendulumText: 'Pendulum text',
        }],
        confirmations: [
            { block: 'STRUCTURE', state: 'CONFIRMED', provenance: source },
            { block: 'TEXT:EN', state: 'CONFIRMED', provenance: source },
        ],
    });

    assert.equal(structured.structure?.kind === 'MONSTER' ? structured.structure.pendulumScale : null, 4);
    assert.equal(structured.localizations[0]?.pendulumText, 'Pendulum text');
    await service.close();
});

test('invalid Xyz/Level and Link/DEF structures cannot become confirmed; Link Rating is marker-derived', async () => {
    const { service, canonical } = await createReadyService('structural invariants');
    registerMonsterBasics(canonical);

    const xyz = canonical.createCard({ family: 'MONSTER', password: '44444444' });
    assert.throws(
        () => canonical.mutateCard(xyz.cardId, xyz.revision, {
            structure: {
                kind: 'MONSTER',
                summonKind: 'XYZ',
                attributeCode: 'LIGHT',
                raceCode: 'DRAGON',
                level: 4,
                rank: 4,
                atk: 2000,
                def: 1500,
                pendulumScale: null,
                abilities: ['EFFECT'],
                linkMarkers: [],
            },
            confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
        }),
        (error: unknown) => error instanceof CanonicalDomainError && error.code === 'DOMAIN_VALIDATION',
    );

    canonical.registerStructuralCode('LINK_MARKER', 'TOP');
    canonical.registerStructuralCode('LINK_MARKER', 'LEFT');
    const link = canonical.createCard({ family: 'MONSTER', password: '55555555' });
    const saved = canonical.mutateCard(link.cardId, link.revision, {
        structure: {
            kind: 'MONSTER',
            summonKind: 'LINK',
            attributeCode: 'LIGHT',
            raceCode: 'DRAGON',
            level: null,
            rank: null,
            atk: 2300,
            def: null,
            pendulumScale: null,
            abilities: ['EFFECT'],
            linkMarkers: ['TOP', 'LEFT'],
        },
        confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
    });

    assert.equal(saved.structure?.kind === 'MONSTER' ? saved.structure.linkRating : null, 2);
    await service.close();
});

test('EN-only localization can confirm independently and missing ES/JP remain absent', async () => {
    const { service, canonical } = await createReadyService('en only');
    const card = canonical.createCard({ family: 'SPELL', password: '66666666' });

    const saved = canonical.mutateCard(card.cardId, card.revision, {
        localizations: [{
            language: 'EN',
            name: 'English Name',
            cardText: 'English text',
            pendulumText: null,
        }],
        confirmations: [{ block: 'TEXT:EN', state: 'CONFIRMED', provenance: source }],
    });

    assert.deepEqual(saved.localizations.map(item => item.language), ['EN']);
    assert.equal(saved.confirmations.find(block => block.block === 'TEXT:EN')?.state, 'CONFIRMED');
    assert.equal(saved.confirmations.some(block => block.block === 'TEXT:ES'), false);
    assert.equal(saved.confirmations.some(block => block.block === 'TEXT:JP'), false);
    await service.close();
});

test('EN/ES/JP localizations persist independently with different confirmation states', async () => {
    const { service, canonical } = await createReadyService('three languages');
    const card = canonical.createCard({ family: 'TRAP', password: '77777777' });

    const saved = canonical.mutateCard(card.cardId, card.revision, {
        localizations: [
            { language: 'EN', name: 'Name EN', cardText: 'Text EN', pendulumText: null },
            { language: 'ES', name: 'Nombre ES', cardText: 'Texto ES', pendulumText: null },
            { language: 'JP', name: '名称JP', cardText: '本文JP', pendulumText: null },
        ],
        confirmations: [
            { block: 'TEXT:EN', state: 'CONFIRMED', provenance: source },
            { block: 'TEXT:ES', state: 'DRAFT' },
            { block: 'TEXT:JP', state: 'CONFIRMED', provenance: source },
        ],
    });

    assert.deepEqual(saved.localizations.map(item => item.language), ['EN', 'ES', 'JP']);
    assert.equal(saved.confirmations.find(block => block.block === 'TEXT:EN')?.state, 'CONFIRMED');
    assert.equal(saved.confirmations.find(block => block.block === 'TEXT:ES')?.state, 'DRAFT');
    assert.equal(saved.confirmations.find(block => block.block === 'TEXT:JP')?.state, 'CONFIRMED');
    await service.close();
});

test('duplicate localized language blocks in one mutation are rejected atomically', async () => {
    const { service, canonical } = await createReadyService('duplicate localization');
    const card = canonical.createCard({ family: 'SPELL', password: '88888888' });

    assert.throws(
        () => canonical.mutateCard(card.cardId, card.revision, {
            localizations: [
                { language: 'EN', name: 'A', cardText: 'A', pendulumText: null },
                { language: 'EN', name: 'B', cardText: 'B', pendulumText: null },
            ],
        }),
        (error: unknown) => error instanceof CanonicalDomainError && error.code === 'DOMAIN_VALIDATION',
    );
    assert.deepEqual(canonical.getCard(card.cardId)?.localizations, []);
    await service.close();
});

test('field/block provenance persists and round-trips with confirmed data', async () => {
    const { service, canonical } = await createReadyService('provenance');
    const card = canonical.createCard({ family: 'SPELL', password: '99999999', provenance: source });

    const saved = canonical.mutateCard(card.cardId, card.revision, {
        provenance: [{
            targetKind: 'FIELD',
            targetKey: 'password',
            sourceKind: 'CARDER_JSON_IMPORT',
            sourceRef: 'fixture.json',
            note: 'Imported passcode',
        }],
        localizations: [{
            language: 'EN',
            name: 'Provenance Card',
            cardText: 'Text',
            pendulumText: null,
        }],
        confirmations: [{
            block: 'TEXT:EN',
            state: 'CONFIRMED',
            provenance: { sourceKind: 'MANUAL_REVIEW', sourceRef: 'review-1' },
        }],
    });

    assert.ok(saved.provenance.some(item =>
        item.targetKind === 'FIELD'
        && item.targetKey === 'password'
        && item.sourceKind === 'CARDER_JSON_IMPORT'));
    assert.ok(saved.provenance.some(item =>
        item.targetKind === 'BLOCK'
        && item.targetKey === 'TEXT:EN'
        && item.sourceKind === 'MANUAL_REVIEW'));
    await service.close();
});

test('Archetypes, Effect Classifiers and Functional Tags persist as independent 0..N dimensions', async () => {
    const { service, canonical } = await createReadyService('classification dimensions');
    const card = canonical.createCard({ family: 'SPELL', password: '10101010' });
    const archetypeA = canonical.registerNamedEntity('ARCHETYPE', 'ARCHETYPE_A');
    const archetypeB = canonical.registerNamedEntity('ARCHETYPE', 'ARCHETYPE_B');
    const destroy = canonical.registerNamedEntity('EFFECT_CLASSIFIER', 'DESTROY');
    const negate = canonical.registerNamedEntity('EFFECT_CLASSIFIER', 'NEGATE');
    const staple = canonical.registerNamedEntity('FUNCTIONAL_TAG', 'STAPLE');
    const starter = canonical.registerNamedEntity('FUNCTIONAL_TAG', 'STARTER');

    const saved = canonical.mutateCard(card.cardId, card.revision, {
        classification: {
            effectReviewed: true,
            archetypeIds: [archetypeA.id, archetypeB.id],
            effectClassifierIds: [destroy.id, negate.id],
            functionalTagIds: [staple.id, starter.id],
        },
        confirmations: [{ block: 'CLASSIFICATION', state: 'CONFIRMED', provenance: source }],
    });

    assert.deepEqual(saved.classification.archetypes.map(item => item.code), ['ARCHETYPE_A', 'ARCHETYPE_B']);
    assert.deepEqual(saved.classification.effectClassifiers.map(item => item.code), ['DESTROY', 'NEGATE']);
    assert.deepEqual(saved.classification.functionalTags.map(item => item.code), ['STAPLE', 'STARTER']);
    await service.close();
});

test('unreviewed zero classifiers and reviewed-empty classifiers are distinguishable', async () => {
    const { service, canonical } = await createReadyService('reviewed empty');
    const card = canonical.createCard({ family: 'SPELL', password: '11112222' });
    assert.equal(card.classification.effectReviewed, false);
    assert.deepEqual(card.classification.effectClassifiers, []);

    const reviewed = canonical.mutateCard(card.cardId, card.revision, {
        classification: { effectReviewed: true, effectClassifierIds: [] },
        confirmations: [{ block: 'CLASSIFICATION', state: 'CONFIRMED', provenance: source }],
    });

    assert.equal(reviewed.classification.effectReviewed, true);
    assert.deepEqual(reviewed.classification.effectClassifiers, []);
    await service.close();
});

test('confirmed blocks reject silent overwrites and accept explicit block transitions', async () => {
    const { service, canonical } = await createReadyService('confirmed overwrite guard');
    const card = canonical.createCard({ family: 'SPELL', password: '15151515' });
    const token = canonical.createCard({ family: 'TOKEN' });
    const tag = canonical.registerNamedEntity('FUNCTIONAL_TAG', 'RECOVERY_GUARD');

    const confirmed = canonical.mutateCard(card.cardId, card.revision, {
        structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
        localizations: [{
            language: 'EN',
            name: 'Confirmed Name',
            cardText: 'Confirmed text',
            pendulumText: null,
        }],
        classification: {
            effectReviewed: true,
            functionalTagIds: [],
        },
        relations: [{
            targetCardId: token.cardId,
            relationTypeCode: 'CREATES_TOKEN',
        }],
        confirmations: [
            { block: 'STRUCTURE', state: 'CONFIRMED', provenance: source },
            { block: 'TEXT:EN', state: 'CONFIRMED', provenance: source },
            { block: 'CLASSIFICATION', state: 'CONFIRMED', provenance: source },
            { block: 'RELATIONS', state: 'CONFIRMED', provenance: source },
        ],
    });

    const isSilentOverwriteError = (error: unknown) =>
        error instanceof CanonicalDomainError
        && error.code === 'DOMAIN_VALIDATION'
        && error.message.includes('silently overwrite confirmed block');

    assert.throws(
        () => canonical.mutateCard(card.cardId, confirmed.revision, { password: '16161616' }),
        isSilentOverwriteError,
    );
    assert.throws(
        () => canonical.mutateCard(card.cardId, confirmed.revision, {
            localizations: [{
                language: 'EN',
                name: 'Silent replacement',
                cardText: 'Must not persist',
                pendulumText: null,
            }],
        }),
        isSilentOverwriteError,
    );
    assert.throws(
        () => canonical.mutateCard(card.cardId, confirmed.revision, {
            classification: { functionalTagIds: [tag.id] },
        }),
        isSilentOverwriteError,
    );
    assert.throws(
        () => canonical.mutateCard(card.cardId, confirmed.revision, { relations: [] }),
        isSilentOverwriteError,
    );

    const unchanged = canonical.getCard(card.cardId);
    assert.ok(unchanged);
    assert.equal(unchanged.revision, confirmed.revision);
    assert.equal(unchanged.password, '15151515');
    assert.equal(unchanged.localizations[0]?.name, 'Confirmed Name');
    assert.deepEqual(unchanged.classification.functionalTags, []);
    assert.equal(unchanged.relations.length, 1);

    const explicitDraft = canonical.mutateCard(card.cardId, confirmed.revision, {
        localizations: [{
            language: 'EN',
            name: 'Explicit replacement',
            cardText: 'Allowed after explicit transition',
            pendulumText: null,
        }],
        confirmations: [{ block: 'TEXT:EN', state: 'DRAFT' }],
    });

    assert.notEqual(explicitDraft.revision, confirmed.revision);
    assert.equal(explicitDraft.localizations[0]?.name, 'Explicit replacement');
    assert.equal(
        explicitDraft.confirmations.find(block => block.block === 'TEXT:EN')?.state,
        'DRAFT',
    );
    await service.close();
});

test('relations use internal IDs, support creator to Token, and preserve Token password absence', async () => {
    const { service, canonical } = await createReadyService('creator relation');
    const creator = canonical.createCard({ family: 'MONSTER', password: '12121212' });
    const token = canonical.createCard({ family: 'TOKEN' });

    const saved = canonical.mutateCard(creator.cardId, creator.revision, {
        relations: [{
            targetCardId: token.cardId,
            relationTypeCode: 'CREATES_TOKEN',
            note: 'Creates this Token',
            provenance: source,
        }],
        confirmations: [{ block: 'RELATIONS', state: 'CONFIRMED', provenance: source }],
    });

    assert.equal(saved.relations.length, 1);
    assert.equal(saved.relations[0]?.sourceCardId, creator.cardId);
    assert.equal(saved.relations[0]?.targetCardId, token.cardId);
    assert.equal(saved.relations[0]?.relationTypeCode, 'CREATES_TOKEN');
    assert.equal(canonical.getCard(token.cardId)?.password, null);
    await service.close();
});

test('dangling internal-ID relation is rejected by SQLite foreign-key integrity with no revision advance', async () => {
    const { service, canonical } = await createReadyService('dangling relation');
    const card = canonical.createCard({ family: 'SPELL', password: '13131313' });

    assert.throws(() => canonical.mutateCard(card.cardId, card.revision, {
        relations: [{
            targetCardId: '00000000-0000-4000-8000-000000000000',
            relationTypeCode: 'CREATES_TOKEN',
        }],
    }));

    const after = canonical.getCard(card.cardId);
    assert.ok(after);
    assert.equal(after.revision, card.revision);
    assert.deepEqual(after.relations, []);
    await service.close();
});

test('successful mutation advances opaque revision; stale expected_revision yields REVISION_CONFLICT with no partial write', async () => {
    const { service, canonical } = await createReadyService('revision conflict');
    const card = canonical.createCard({ family: 'SPELL', password: '14141414' });

    const first = canonical.mutateCard(card.cardId, card.revision, {
        localizations: [{
            language: 'EN',
            name: 'Fresh',
            cardText: 'Fresh text',
            pendulumText: null,
        }],
    });
    assert.notEqual(first.revision, card.revision);

    assert.throws(
        () => canonical.mutateCard(card.cardId, card.revision, {
            password: 'CHANGED',
            localizations: [{
                language: 'ES',
                name: 'Stale',
                cardText: 'Should rollback',
                pendulumText: null,
            }],
        }),
        (error: unknown) => error instanceof CanonicalDomainError && error.code === 'REVISION_CONFLICT',
    );

    const after = canonical.getCard(card.cardId);
    assert.ok(after);
    assert.equal(after.revision, first.revision);
    assert.equal(after.password, '14141414');
    assert.deepEqual(after.localizations.map(item => item.language), ['EN']);
    await service.close();
});

test('multi-table Canonical mutation rolls back when confirmed-block validation fails', async () => {
    const { service, canonical } = await createReadyService('multi table rollback');
    registerMonsterBasics(canonical);
    const card = canonical.createCard({ family: 'MONSTER' });
    const archetype = canonical.registerNamedEntity('ARCHETYPE', 'ROLLBACK_ARCHETYPE');

    assert.throws(
        () => canonical.mutateCard(card.cardId, card.revision, {
            structure: {
                kind: 'MONSTER',
                summonKind: 'MAIN_DECK',
                attributeCode: 'LIGHT',
                raceCode: 'DRAGON',
                level: 4,
                rank: null,
                atk: 1000,
                def: 1000,
                pendulumScale: null,
                abilities: ['EFFECT'],
                linkMarkers: [],
            },
            localizations: [{
                language: 'EN',
                name: 'Rollback',
                cardText: 'Rollback',
                pendulumText: null,
            }],
            classification: {
                effectReviewed: true,
                archetypeIds: [archetype.id],
            },
            confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance: source }],
        }),
        (error: unknown) => error instanceof CanonicalDomainError && error.code === 'DOMAIN_VALIDATION',
    );

    const after = canonical.getCard(card.cardId);
    assert.ok(after);
    assert.equal(after.revision, card.revision);
    assert.equal(after.structure, null);
    assert.deepEqual(after.localizations, []);
    assert.equal(after.classification.effectReviewed, false);
    assert.deepEqual(after.classification.archetypes, []);
    assert.deepEqual(after.confirmations, []);
    await service.close();
});

test('current-schema Workspace is READY and status endpoint reports current database_schema_version', async () => {
    const { service } = await createReadyService('schema2 status');
    assert.equal(service.status.database_schema_version, SUPPORTED_DATABASE_SCHEMA_VERSION);
    const response = await service.app.inject({ method: 'GET', url: '/api/v1/workspace/status' });
    assert.equal(response.statusCode, 200);
    assert.equal(response.json().database_schema_version, SUPPORTED_DATABASE_SCHEMA_VERSION);
    await service.close();
});

test('Unicode Workspace path retains Canonical persistence behavior on Windows-compatible paths', async () => {
    const parent = await createTempRoot('unicode parent');
    const root = path.join(parent, 'Workspace Canonical 日本語');
    await mkdir(root);
    const value = manifest({ database_path: 'データ files/workspace.db' });
    await writeManifest(root, value);
    bootstrapWorkspaceDatabase(root, value);
    const service = await createWorkspaceService({
        workspaceRoot: root,
        host: '127.0.0.1',
        port: 4312,
    });
    assert.ok(service.canonical);
    const card = service.canonical.createCard({ family: 'SPELL', password: '15151515' });
    assert.equal(service.canonical.getCard(card.cardId)?.cardId, card.cardId);
    await service.close();
});
