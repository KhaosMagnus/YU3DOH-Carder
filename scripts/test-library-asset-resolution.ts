import assert from 'node:assert/strict';
import * as api from '../src/library/api';
import { AssetResolutionController, assetResolutionError, resolverOperations, type ResolverDependencies } from '../src/library/asset-resolution-state';
import type { AssetOperationResponse, AssetResolutionState, IndexedLibraryAsset, LibraryVariantDetail, ManagedAssetPreview } from '../src/library/model';

const asset: IndexedLibraryAsset = { assetId: 'a', relativePath: 'Assets/Managed/c/default/BS.png', fileName: 'BS.png', extension: 'png',
    sizeBytes: 20, modifiedTimeMs: 1, contentHash: 'hash', parsedCardName: 'Hint only', parsedPassword: '10000000', role: 'BS',
    variantLabel: 'Default', variantKey: 'default', associationState: 'RESOLVED', cardId: 'c', variantId: 'v',
    imageWidth: 20, imageHeight: 20, hasTransparency: false, validAsset: true, present: true };
const variant: LibraryVariantDetail = { card_id: 'c', variant_id: 'v', variant_key: 'default', display_label: 'Default',
    standard: { state: 'READY', sources: ['BG', 'OF'] }, overframe: { state: 'READY', sources: ['BS', 'OF'] },
    roles: { BS: { slot_state: 'BOUND', asset: { asset_id: 'a', relative_path: asset.relativePath, file_name: 'BS.png', extension: 'png',
        image_width: 20, image_height: 20, has_transparency: false, present: true, valid_asset: true, ownership: 'managed', managed_asset_id: 'm' },
        issues: [], candidates: [asset], expected_state_token: 'state' }, BG: { slot_state: 'EMPTY', asset: null, issues: [] }, OF: { slot_state: 'EMPTY', asset: null, issues: [] } } };
const preview: ManagedAssetPreview = { operation: 'REMOVE', managed_asset: { managedAssetId: 'm', cardId: 'c', variantId: 'v', variantKey: 'default',
    displayLabel: 'Default', role: 'BS', managedRelativePath: asset.relativePath, contentHash: 'hash', originalFileName: 'original.png', extension: 'png', createdAt: 'now' },
    expected_state_token: 'preview-token', affected_slot: { card_id: 'c', variant_id: 'v', role: 'BS' }, candidates: [asset],
    readiness_before: { standard: variant.standard, overframe: variant.overframe },
    readiness_after: { standard: { state: 'INCOMPLETE', sources: [] }, overframe: { state: 'READY', sources: ['BG', 'OF'] } }, recovery_policy: 'PRESERVE_PREVIOUS_STATE' };
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
function harness() {
    let snapshot: AssetResolutionState = { expected_state_token: 'state', assets: [clone(asset)], overrides: [], variants: [] };
    let variants = [clone(variant), { ...clone(variant), variant_id: 'other', variant_key: 'other', display_label: 'Other' }];
    const calls: Array<{ method: string; args?: unknown }> = [];
    let failure: Error | null = null;
    let draftFailure = false;
    const result = (operation: AssetOperationResponse['operation']): AssetOperationResponse => ({ ...snapshot, operation, changed: operation !== 'LEAVE' });
    const client: ResolverDependencies = {
        getResolutionState: async () => { calls.push({ method: 'state' }); return clone(snapshot); },
        refreshResolutionState: async () => { calls.push({ method: 'refresh' }); snapshot.expected_state_token = 'fresh'; return clone(snapshot); },
        getLibraryVariants: async (id) => { calls.push({ method: 'variants', args: id }); return { card_id: id, variants: clone(variants.filter(v => v.card_id === id)) }; },
        previewManagedAsset: async (id, body) => { calls.push({ method: 'preview', args: { id, body: clone(body) } }); return { ...clone(preview), operation: body.operation }; },
        mutateManagedAsset: async body => { calls.push({ method: 'mutate', args: clone(body) }); if (failure) throw failure; return result(body.operation); },
        resolveAsset: async body => {
            calls.push({ method: 'resolve', args: clone(body) }); if (failure) throw failure;
            if (body.operation === 'UNASSIGN') {
                snapshot.overrides = [{ asset_id: body.asset_id!, disposition: 'UNASSIGN', variant_id: null, role: null }];
                Object.assign(snapshot.assets[0], { cardId: null, variantId: null, associationState: 'UNRESOLVED' });
                snapshot.expected_state_token = 'protected';
            }
            return result(body.operation);
        },
        createLibraryCard: async body => { calls.push({ method: 'draft', args: body }); if (draftFailure) throw new api.LibraryHttpError({ status: 422, code: 'CANONICAL_INVALID', message: 'injected' }); return { card_id: 'draft' } as any; },
    };
    const controller = new AssetResolutionController(client);
    controller.onChanged = async () => { calls.push({ method: 'views' }); };
    controller.onBlocked = async () => { calls.push({ method: 'blocked' }); };
    return { controller, calls, get snapshot() { return snapshot; }, variants,
        fail: (code: string, status = 422) => { failure = new api.LibraryHttpError({ status, code, message: 'injected' }); },
        failDraft: () => { draftFailure = true; },
        clear: () => { failure = null; draftFailure = false; } };
}
export async function runAssetResolutionChecks() {
    let passed = 0;
    const check = async (name: string, run: () => void | Promise<void>) => { await run(); passed++; console.log(`RUN012 ${name} PASS`); };
    await check('API state / refresh / resolve / preview / mutate contracts and HTTP semantic errors', async () => {
        const oldFetch = globalThis.fetch;
        const requests: Array<{ path: string; method: string; body: any }> = [];
        globalThis.fetch = (async (url: any, init: any) => {
            requests.push({ path: String(url), method: init.method ?? 'GET', body: init.body ? JSON.parse(init.body) : null });
            return new Response(JSON.stringify({ code: 'ASSET_SOURCE_UNSAFE', message: 'rejected' }), { status: 422 });
        }) as typeof fetch;
        try {
            const bodies = [{ operation: 'ATTACH', asset_id: 'x', role: 'BG', expected_state_token: 'opaque', create_variant: { card_id: 'c', variant_key: 'Alt' } },
                { operation: 'REPLACE', source_file: 'C:\\art 日本語\\source.png' },
                { operation: 'RELINK', target_asset_id: 'x', asset_id: 's', expected_state_token: 'opaque' }];
            for (const request of [() => api.getResolutionState(), () => api.refreshResolutionState(), () => api.resolveAsset(bodies[0] as any),
                () => api.previewManagedAsset('id with space', bodies[1] as any), () => api.mutateManagedAsset(bodies[2] as any)]) {
                await assert.rejects(request(), (e: any) => e.status === 422 && e.code === 'ASSET_SOURCE_UNSAFE' && e.message === 'rejected');
            }
            assert.deepEqual(requests.map(r => [r.path, r.method]), [
                ['/api/v1/library/assets/resolution-state', 'GET'], ['/api/v1/library/assets/resolution-state/refresh', 'POST'],
                ['/api/v1/library/assets/resolve', 'POST'], ['/api/v1/library/managed-assets/id%20with%20space/preview', 'POST'],
                ['/api/v1/library/managed-assets/mutate', 'POST']]);
            assert.deepEqual(requests.slice(2).map(r => r.body), bodies);
        } finally { globalThis.fetch = oldFetch; }
    });
    await check('Open persisted state only; no Canonical creation or implicit scan', async () => {
        const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS' });
        assert.deepEqual(h.calls.map(c => c.method), ['state', 'variants']);
        assert.deepEqual(resolverOperations(h.controller.view), ['REPLACE', 'REMOVE', 'LEAVE']);
    });
    await check('Cancel after REMOVE preview never executes or refreshes/scans', async () => {
        const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'REMOVE' });
        await h.controller.review(); assert.equal(h.controller.view.phase, 'PREVIEW_READY');
        h.controller.close(); await h.controller.confirm();
        assert.deepEqual(h.calls.map(c => c.method), ['state', 'variants', 'preview']);
    });
    await check('REMOVE confirms preview token and same fixed target; server readiness retained', async () => {
        const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'REMOVE' });
        await h.controller.confirm(); assert.equal(h.calls.some(c => c.method === 'mutate'), false);
        await h.controller.review(); assert.deepEqual(h.controller.view.preview?.readiness_before, preview.readiness_before);
        await h.controller.confirm();
        assert.deepEqual(h.calls.find(c => c.method === 'mutate')?.args, { operation: 'REMOVE', managed_asset_id: 'm',
            expected_state_token: 'preview-token', card_id: 'c', variant_id: 'v', role: 'BS' });
        assert.equal(h.calls.some(c => c.method === 'refresh'), false); assert.equal(h.controller.view.phase, 'SUCCESS');
        assert.deepEqual(h.calls.slice(-3).map(c => c.method), ['state', 'variants', 'views']);
    });
    for (const sourceMode of ['path', 'indexed'] as const) await check(`REPLACE ${sourceMode} same source preview/execute and stable token`, async () => {
        const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'REPLACE' });
        h.controller.select({ sourceMode, sourceFile: 'C:\\art 日本語\\new.png', sourceAssetId: 'source' });
        await h.controller.review(); await h.controller.confirm();
        const request = (h.calls.find(c => c.method === 'preview')!.args as any).body;
        const body = h.calls.find(c => c.method === 'mutate')!.args as any;
        assert.equal(body.expected_state_token, 'preview-token');
        assert.equal(body.source_file, request.source_file); assert.equal(body.asset_id, request.asset_id);
        assert.notEqual(Boolean(body.source_file), Boolean(body.asset_id));
    });
    await check('Editing after preview invalidates confirmation and needs a new preview', async () => {
        const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'REPLACE' });
        h.controller.select({ sourceFile: '/first.png' }); await h.controller.review();
        h.controller.select({ sourceFile: '/second.png' }); await h.controller.confirm();
        assert.equal(h.controller.view.preview, null); assert.equal(h.calls.some(c => c.method === 'mutate'), false);
        await h.controller.review(); await h.controller.confirm(); assert.equal((h.calls.find(c => c.method === 'mutate')!.args as any).source_file, '/second.png');
    });
    await check('REPLACE requires one selected source; REMOVE sends no source', async () => {
        const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'REPLACE' });
        await h.controller.review(); assert.equal(h.controller.view.phase, 'ERROR'); assert.equal(h.calls.some(c => c.method === 'preview'), false);
        h.controller.select({ operation: 'REMOVE', sourceFile: '/not-used.png' }); await h.controller.review();
        assert.deepEqual((h.calls.find(c => c.method === 'preview')!.args as any).body, { operation: 'REMOVE' });
    });
    await check('STALE preserves context, refreshes, invalidates preview and never replays', async () => {
        const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'REPLACE' });
        h.controller.select({ sourceFile: '/art 日本語/new.png' }); await h.controller.review(); h.fail('ASSET_STATE_STALE', 409); await h.controller.confirm();
        assert.equal(h.controller.view.phase, 'STALE'); assert.equal(h.controller.view.preview, null); assert.equal(h.controller.view.snapshot?.expected_state_token, 'fresh');
        assert.equal(h.controller.view.selection.sourceFile, '/art 日本語/new.png'); assert.ok(h.controller.view.warning?.includes('Review'));
        await h.controller.confirm(); assert.equal(h.calls.filter(c => c.method === 'mutate').length, 1);
        h.clear(); await h.controller.review(); await h.controller.confirm(); assert.equal(h.calls.filter(c => c.method === 'mutate').length, 2);
    });
    await check('Managed RELINK source-free preview, fixed identity, source only at execution', async () => {
        const h = harness(); h.variants[0].roles.BS.slot_state = 'MISSING'; h.variants[0].roles.BS.asset!.present = false;
        await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'RELINK' }); h.controller.select({ sourceFile: '/new.png', cardId: 'other', variantId: 'other', role: 'OF' });
        await h.controller.review(); await h.controller.confirm();
        assert.deepEqual((h.calls.find(c => c.method === 'preview')!.args as any).body, { operation: 'RELINK' });
        const body = h.calls.find(c => c.method === 'mutate')!.args as any; assert.equal(body.card_id, 'c'); assert.equal(body.variant_id, 'v'); assert.equal(body.role, 'BS'); assert.equal(body.source_file, '/new.png');
    });
    await check('Unmanaged missing uses target_asset_id RELINK; no unsupported preview/REPLACE', async () => {
        const h = harness(); h.snapshot.assets[0].present = false; h.variants[0].roles.BS.slot_state = 'MISSING';
        h.variants[0].roles.BS.asset!.ownership = 'unmanaged'; h.variants[0].roles.BS.asset!.managed_asset_id = null;
        await h.controller.open({ assetId: 'a' }); assert.deepEqual(resolverOperations(h.controller.view), ['RELINK', 'LEAVE']);
        h.controller.select({ sourceFile: '/new.png' }); await h.controller.review(); await h.controller.confirm();
        assert.equal(h.calls.some(c => c.method === 'preview'), false); assert.equal((h.calls.find(c => c.method === 'mutate')!.args as any).target_asset_id, 'a');
    });
    const conflictHarness = () => {
        const h = harness(); h.variants[0].roles.BS.slot_state = 'CONFLICT'; h.variants[0].roles.BS.asset = null;
        h.variants[0].roles.BS.candidates = [clone(asset), { ...clone(asset), assetId: 'b', relativePath: 'Assets/B.png' }]; return h;
    };
    await check('Conflict no preselected winner; CHOOSE sends one winner only', async () => {
        const h = conflictHarness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS' });
        assert.equal(h.controller.view.selection.candidateId, ''); await h.controller.review(); assert.equal(h.calls.some(c => c.method === 'resolve'), false);
        h.controller.select({ candidateId: 'b' }); await h.controller.review(); await h.controller.confirm();
        assert.deepEqual(h.calls.find(c => c.method === 'resolve')?.args, { operation: 'CHOOSE', expected_state_token: 'state', asset_id: 'b', role: 'BS', variant_id: 'v' });
        assert.equal(h.calls.filter(c => c.method === 'resolve').length, 1);
    });
    await check('Conflict MOVE existing variant stays same card/role', async () => {
        const h = conflictHarness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS' });
        h.controller.select({ operation: 'MOVE', candidateId: 'a', variantId: 'other', cardId: 'wrong', role: 'OF' });
        await h.controller.review(); await h.controller.confirm();
        assert.deepEqual(h.calls.find(c => c.method === 'resolve')?.args, { operation: 'MOVE', expected_state_token: 'state', asset_id: 'a', role: 'BS', variant_id: 'other' });
    });
    await check('Conflict resolver-only create_variant stays same Canonical card', async () => {
        const h = conflictHarness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS' });
        h.controller.select({ operation: 'MOVE', candidateId: 'a', createVariant: true, variantKey: 'Alt', displayLabel: 'Alt art', cardId: 'wrong' });
        await h.controller.review(); await h.controller.confirm();
        assert.deepEqual((h.calls.find(c => c.method === 'resolve')!.args as any).create_variant, { card_id: 'c', variant_key: 'Alt', display_label: 'Alt art' });
        assert.equal(h.calls.some(c => c.method === 'draft'), false);
    });
    await check('LEAVE explicit no-op contract; cancel is separate', async () => {
        const h = conflictHarness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS' }); h.controller.select({ operation: 'LEAVE' });
        await h.controller.review(); await h.controller.confirm();
        assert.deepEqual(h.calls.find(c => c.method === 'resolve')?.args, { operation: 'LEAVE', expected_state_token: 'state' });
        assert.ok(h.controller.view.result?.includes('No asset changes'));
    });
    const unresolvedHarness = () => { const h = harness(); Object.assign(h.snapshot.assets[0], { cardId: null, variantId: null, associationState: 'UNRESOLVED', validAsset: false }); return h; };
    await check('Unresolved ATTACH requires explicit role; hints do not choose card/variant', async () => {
        const h = unresolvedHarness(); await h.controller.open({ assetId: 'a' }); assert.equal(h.controller.view.selection.role, ''); assert.equal(h.controller.view.selection.cardId, '');
        await h.controller.selectCard('c'); h.controller.select({ variantId: 'other' }); await h.controller.review(); assert.equal(h.controller.view.phase, 'ERROR');
        h.controller.select({ role: 'BG' }); await h.controller.review(); await h.controller.confirm();
        assert.deepEqual(h.calls.find(c => c.method === 'resolve')?.args, { operation: 'ATTACH', expected_state_token: 'state', asset_id: 'a', role: 'BG', variant_id: 'other' });
    });
    await check('Draft creation separate; attach failure preserves Draft and retry never creates another', async () => {
        const h = unresolvedHarness(); await h.controller.open({ assetId: 'a' }); h.controller.select({ role: 'BS', createVariant: true, variantKey: 'First' });
        await h.controller.createDraft({ family: 'TOKEN' }); assert.equal(h.calls.filter(c => c.method === 'resolve').length, 0); await h.controller.confirm();
        assert.equal(h.calls.filter(c => c.method === 'resolve').length, 1); assert.equal(h.controller.view.createdDraftId, 'draft');
        h.controller.select({ role: 'BS', variantKey: 'First' }); await h.controller.review(); h.fail('ASSET_SOURCE_INVALID'); await h.controller.confirm();
        assert.equal(h.controller.view.createdDraftId, 'draft'); assert.equal(h.controller.view.result, 'Draft created. Asset not attached.');
        await h.controller.createDraft({ family: 'TOKEN' }); h.controller.select({ cardId: 'c' }); assert.equal(h.controller.view.selection.cardId, 'draft');
        h.clear(); await h.controller.review(); await h.controller.confirm(); assert.equal(h.calls.filter(c => c.method === 'draft').length, 1);
        assert.deepEqual((h.calls.filter(c => c.method === 'resolve').at(-1)!.args as any).create_variant, { card_id: 'draft', variant_key: 'First' });
    });
    await check('UNASSIGN appears only for explicit ASSIGN', async () => {
        const h = harness(); h.variants[0].roles.BS.asset!.ownership = 'unmanaged'; h.variants[0].roles.BS.asset!.managed_asset_id = null;
        await h.controller.open({ assetId: 'a' }); assert.equal(resolverOperations(h.controller.view).includes('UNASSIGN'), false);
        h.snapshot.overrides.push({ asset_id: 'a', disposition: 'ASSIGN', role: 'BS', variant_id: 'v' }); await h.controller.open({ assetId: 'a' });
        assert.equal(resolverOperations(h.controller.view).includes('UNASSIGN'), true);
        h.controller.select({ operation: 'UNASSIGN' }); await h.controller.review(); await h.controller.confirm();
        assert.deepEqual(h.calls.find(c => c.method === 'resolve')?.args, { operation: 'UNASSIGN', expected_state_token: 'state', asset_id: 'a' });
    });
    for (const code of ['ASSET_MUTATION_RECOVERY_REQUIRED', 'WORKSPACE_NOT_READY']) await check(`${code} persists blocking state`, async () => {
        const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'REMOVE' }); await h.controller.review(); h.fail(code, 503); await h.controller.confirm();
        assert.equal(h.controller.view.phase, 'RECOVERY_BLOCKED'); assert.equal(h.controller.view.snapshot, null); assert.deepEqual(resolverOperations(h.controller.view), []);
        await h.controller.review(); await h.controller.confirm(); assert.equal(h.calls.filter(c => c.method === 'mutate').length, 1); assert.equal(h.calls.filter(c => c.method === 'blocked').length, 1);
    });
    await check('Occupied/unsafe/maintenance/validation errors distinct; context retained', async () => {
        const codes = ['ASSET_SLOT_OCCUPIED', 'ASSET_DESTINATION_OCCUPIED', 'ASSET_SOURCE_UNSAFE', 'ASSET_SOURCE_INVALID', 'ASSET_ROLE_INVALID', 'ASSET_TARGET_INVALID', 'WORKSPACE_MAINTENANCE_ACTIVE'];
        const messages = codes.map(code => assetResolutionError(new api.LibraryHttpError({ status: 422, code, message: code })));
        assert.equal(new Set(messages).size, codes.length);
        const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'REPLACE' }); h.controller.select({ sourceFile: '/chosen.png' });
        await h.controller.review(); h.fail('ASSET_DESTINATION_OCCUPIED', 409); await h.controller.confirm(); assert.equal(h.controller.view.selection.sourceFile, '/chosen.png');
        assert.equal(h.calls.some(c => c.method === 'refresh'), false); assert.equal(h.controller.view.phase, 'ERROR');
    });
    await check('Mutation failure / not found refresh before another review, no optimistic changes', async () => {
        for (const code of ['ASSET_MUTATION_FAILED', 'ASSET_NOT_FOUND']) {
            const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'REMOVE' }); await h.controller.review(); h.fail(code, 503); await h.controller.confirm();
            assert.ok(h.calls.some(c => c.method === 'refresh')); assert.equal(h.controller.view.phase, 'ERROR'); assert.equal(h.controller.view.variants[0].roles.BS.slot_state, 'BOUND');
            await h.controller.confirm(); assert.equal(h.calls.filter(c => c.method === 'mutate').length, 1);
        }
    });
    await check('Review cannot optimistically mutate authoritative binding/readiness', async () => {
        const h = harness(); await h.controller.open({ cardId: 'c', variantId: 'v', role: 'BS', operation: 'REMOVE' }); const before = JSON.stringify(h.controller.view.snapshot);
        await h.controller.review(); assert.equal(JSON.stringify(h.controller.view.snapshot), before); assert.deepEqual(h.controller.view.variants[0].standard, variant.standard);
    });
    const draftReview = async (h: ReturnType<typeof harness>) => {
        await h.controller.open({ assetId: 'a' });
        h.controller.select({ role: 'BS', createVariant: true, variantKey: 'Explicit', displayLabel: 'Explicit art' });
        await h.controller.createDraft({ family: 'SPELL', password: '10000000' });
    };
    const draftCreated = async (h: ReturnType<typeof harness>) => { await draftReview(h); await h.controller.confirm(); };
    await check('DRAFT-UI-01 confirmation precedes any UNASSIGN/Canonical write; cancellation is read-only', async () => {
        const h = unresolvedHarness(); await draftReview(h);
        assert.equal(h.controller.view.phase, 'CONFIRMING'); assert.equal(h.controller.view.draftReview?.password, '10000000');
        assert.equal(h.calls.some(c => ['resolve', 'draft'].includes(c.method)), false);
        h.controller.close(); await h.controller.confirm(); assert.equal(h.calls.some(c => ['resolve', 'draft'].includes(c.method)), false);
    });
    await check('DRAFT-UI-02 UNASSIGN succeeds before matching-password Canonical creation', async () => {
        const h = unresolvedHarness(); await draftCreated(h);
        assert.deepEqual(h.calls.filter(c => ['resolve', 'draft'].includes(c.method)).map(c => c.method), ['resolve', 'draft']);
        assert.deepEqual(h.calls.find(c => c.method === 'resolve')?.args, { operation: 'UNASSIGN', asset_id: 'a', expected_state_token: 'state' });
    });
    await check('DRAFT-UI-03 failed fence prevents Canonical creation', async () => {
        const h = unresolvedHarness(); await draftReview(h); h.fail('ASSET_SOURCE_INVALID'); await h.controller.confirm();
        assert.equal(h.calls.some(c => c.method === 'draft'), false); assert.equal(h.controller.view.createdDraftId, null);
    });
    await check('DRAFT-UI-04 protected response state/token retained through creation and explicit ATTACH', async () => {
        const h = unresolvedHarness(); await draftCreated(h);
        assert.equal(h.controller.view.snapshot?.expected_state_token, 'protected');
        assert.equal(h.controller.view.snapshot?.overrides[0].disposition, 'UNASSIGN');
        await h.controller.review(); await h.controller.confirm();
        assert.equal((h.calls.filter(c => c.method === 'resolve').at(-1)?.args as any).expected_state_token, 'protected');
    });
    await check('DRAFT-UI-05 Canonical failure reports retained fence; explicit retry skips redundant UNASSIGN', async () => {
        const h = unresolvedHarness(); await draftReview(h); h.failDraft(); await h.controller.confirm();
        assert.equal(h.controller.view.createdDraftId, null);
        assert.equal(h.controller.view.result, 'Draft was not created. The asset remains explicitly unassigned and safe for resolution.');
        h.clear(); await h.controller.createDraft({ family: 'SPELL', password: '10000000' }); await h.controller.confirm();
        assert.equal(h.calls.filter(c => c.method === 'resolve').length, 1); assert.equal(h.controller.view.createdDraftId, 'draft');
    });
    await check('DRAFT-UI-06 attachment failure preserves createdDraftId, source and target context', async () => {
        const h = unresolvedHarness(); await draftCreated(h); await h.controller.review(); h.fail('ASSET_SOURCE_INVALID'); await h.controller.confirm();
        assert.equal(h.controller.view.createdDraftId, 'draft'); assert.equal(h.controller.view.entry?.assetId, 'a');
        assert.equal(h.controller.view.selection.variantKey, 'Explicit'); assert.equal(h.controller.view.selection.role, 'BS');
        assert.equal(h.controller.view.snapshot?.overrides[0].disposition, 'UNASSIGN');
    });
    await check('DRAFT-UI-07 retry refreshes state and performs only ATTACH, never a second Canonical creation', async () => {
        const h = unresolvedHarness(); await draftCreated(h); await h.controller.review(); h.fail('ASSET_SOURCE_INVALID'); await h.controller.confirm();
        h.clear(); const start = h.calls.length; await h.controller.review(); await h.controller.confirm();
        assert.equal(h.calls[start].method, 'state');
        assert.deepEqual(h.calls.slice(start).filter(c => ['resolve', 'draft'].includes(c.method)).map(c => (c.args as any).operation), ['ATTACH']);
        assert.equal(h.calls.filter(c => c.method === 'draft').length, 1);
    });
    await check('DRAFT-UI-08 stale after Draft refreshes, preserves Draft and never replays attachment', async () => {
        const h = unresolvedHarness(); await draftCreated(h); await h.controller.review(); h.fail('ASSET_STATE_STALE', 409); await h.controller.confirm();
        assert.equal(h.controller.view.phase, 'STALE'); assert.equal(h.controller.view.createdDraftId, 'draft');
        assert.equal(h.controller.view.selection.variantKey, 'Explicit'); assert.ok(h.calls.some(c => c.method === 'refresh'));
        const count = h.calls.length; await h.controller.confirm(); assert.equal(h.calls.length, count);
        h.clear(); await h.controller.review(); await h.controller.confirm(); assert.equal(h.calls.filter(c => c.method === 'draft').length, 1);
        assert.equal((h.calls.filter(c => c.method === 'resolve').at(-1)?.args as any).expected_state_token, 'fresh');
    });
    await check('DRAFT-UI-09 non-TOKEN Draft preserves supplied matching password and resolver target', async () => {
        const h = unresolvedHarness(); await draftCreated(h);
        assert.deepEqual(h.calls.find(c => c.method === 'draft')?.args, { family: 'SPELL', password: '10000000' });
        await h.controller.review(); await h.controller.confirm();
        assert.deepEqual((h.calls.filter(c => c.method === 'resolve').at(-1)?.args as any).create_variant,
            { card_id: 'draft', variant_key: 'Explicit', display_label: 'Explicit art' });
    });
    console.log(`Library RUN 012 resolver checks: ${passed} PASS / 0 FAIL / 0 SKIP`);
}
