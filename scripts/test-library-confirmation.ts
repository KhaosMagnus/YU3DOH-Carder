import assert from 'node:assert/strict';
import * as api from '../src/library/api';
import {
    ConfirmationController,
    canReviewBlock,
    type ConfirmationClient,
} from '../src/library/confirmation-state';
import { type LibraryCardDetail, type SemanticBlock } from '../src/library/model';
const detail = (): LibraryCardDetail => ({
    card_id: 'card',
    revision: '1',
    family: 'SPELL',
    password: null,
    structure: null,
    localizations: [],
    classification: {
        effect_reviewed: false,
        archetypes: [],
        effect_classifiers: [],
        functional_tags: [],
    },
    relations: [],
    provenance: [],
    confirmations: [],
});
function fixture() {
    let current = detail();
    let failure = '';
    let valid = true;
    const calls: { method: string; body?: any }[] = [];
    const client: ConfirmationClient = {
        getLibraryCard: async () => {
            calls.push({ method: 'reload' });
            return { ...current, revision: '2' };
        },
        reviewCanonicalConfirmation: async (id, block, revision) => {
            calls.push({ method: 'review', body: { id, block, revision } });
            if (failure)
                throw new api.LibraryHttpError({ status: 409, code: failure, message: 'injected' });
            return {
                card_id: id,
                block,
                revision,
                state: 'DRAFT',
                confirmable: valid,
                validation: {
                    status: valid ? 'PASS' : 'FAIL',
                    code: valid ? null : 'DOMAIN_VALIDATION',
                    message: valid ? null : 'invalid',
                },
            };
        },
        patchLibraryCard: async (id, body) => {
            calls.push({ method: 'patch', body });
            if (failure)
                throw new api.LibraryHttpError({ status: 409, code: failure, message: 'injected' });
            current = {
                ...current,
                revision: '2',
                confirmations: [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance_id: 1 }],
            };
            return current;
        },
    };
    const c = new ConfirmationController(current, 'STRUCTURE', client);
    c.onAdopt = () => {
        calls.push({ method: 'adopt' });
    };
    return {
        c,
        calls,
        fail: (code: string) => {
            failure = code;
        },
        invalid: () => {
            valid = false;
        },
    };
}
export async function runConfirmationChecks() {
    let count = 0;
    const check = async (name: string, f: () => void | Promise<void>) => {
        await f();
        count++;
        console.log(`RUN014 ${name} PASS`);
    };
    await check('Only persisted Draft blocks outside editing expose initial action', () => {
        assert.equal(canReviewBlock(detail(), 'STRUCTURE', false), true);
        assert.equal(canReviewBlock(detail(), 'STRUCTURE', true), false);
        const d = detail();
        d.confirmations = [{ block: 'STRUCTURE', state: 'CONFIRMED', provenance_id: 1 }];
        assert.equal(canReviewBlock(d, 'STRUCTURE', false), false);
    });
    await check('Review uses exact block/revision, no mutation or adoption', async () => {
        const f = fixture();
        await f.c.review();
        assert.deepEqual(f.calls, [
            { method: 'review', body: { id: 'card', block: 'STRUCTURE', revision: '1' } },
        ]);
    });
    await check('Server PASS permits empty frontend data; no client inference', async () => {
        const f = fixture();
        await f.c.review();
        assert.equal(f.c.canConfirm(), true);
    });
    await check('Server FAIL disables confirm, leaves snapshot intact', async () => {
        const f = fixture();
        f.invalid();
        await f.c.review();
        await f.c.confirm();
        assert.equal(f.c.canConfirm(), false);
        assert.equal(f.calls.length, 1);
        assert.deepEqual(f.c.view.detail, detail());
    });
    await check('Blank provenance prevents submission', async () => {
        const f = fixture();
        await f.c.review();
        f.c.provenance('  ', '', '');
        await f.c.confirm();
        assert.equal(f.calls.length, 1);
    });
    await check(
        'Confirmation-only exact payload, reviewed revision and authoritative adoption',
        async () => {
            const f = fixture();
            await f.c.review();
            f.c.provenance(' MANUAL ', '  ', ' reviewed ');
            await f.c.confirm();
            assert.deepEqual(f.calls[1], {
                method: 'patch',
                body: {
                    expected_revision: '1',
                    confirmations: [
                        {
                            block: 'STRUCTURE',
                            state: 'CONFIRMED',
                            provenance: {
                                source_kind: 'MANUAL',
                                source_ref: null,
                                note: 'reviewed',
                            },
                        },
                    ],
                },
            });
            assert.equal(f.c.view.phase, 'SUCCESS');
            assert.equal(f.c.view.detail.revision, '2');
            assert.equal(f.calls[2].method, 'adopt');
        },
    );
    for (const timing of ['review', 'confirm'])
        await check(`Stale ${timing} reloads, invalidates and never replays`, async () => {
            const f = fixture();
            if (timing === 'confirm') await f.c.review();
            f.fail('REVISION_CONFLICT');
            if (timing === 'review') await f.c.review();
            else await f.c.confirm();
            assert.equal(f.c.view.phase, 'STALE');
            assert.equal(f.c.view.review, null);
            assert.equal(f.c.view.detail.revision, '2');
            assert.equal(f.c.canConfirm(), false);
            const n = f.calls.length;
            await f.c.confirm();
            assert.equal(f.calls.length, n);
        });
    for (const code of ['DOMAIN_VALIDATION', 'WORKSPACE_NOT_READY', 'NOT_FOUND', 'HTTP_500'])
        await check(`Distinct ${code}, no success or replay`, async () => {
            const f = fixture();
            await f.c.review();
            f.fail(code);
            await f.c.confirm();
            assert.equal(f.c.view.phase, 'ERROR');
            assert.match(f.c.view.error!, new RegExp(code));
            assert.equal(f.c.view.review, null);
            assert.equal(
                f.calls.some((c) => c.method === 'adopt'),
                false,
            );
        });
    await check(
        'Controller clones authoritative input, cannot confirm working-copy edits',
        async () => {
            const d = detail();
            const f = fixture();
            const c = new ConfirmationController(d, 'STRUCTURE', {} as ConfirmationClient);
            d.password = 'edited';
            assert.equal(c.view.detail.password, null);
        },
    );
    await check('Review HTTP body and route preserve revision/block', async () => {
        const original = globalThis.fetch;
        let captured: any;
        globalThis.fetch = async (url, init) => {
            captured = { url, body: JSON.parse(String(init?.body)), method: init?.method };
            return new Response(
                JSON.stringify({ confirmable: false, validation: { status: 'FAIL' } }),
                { status: 200 },
            );
        };
        try {
            await api.reviewCanonicalConfirmation('c/id', 'TEXT:JP', '7');
            assert.deepEqual(captured, {
                url: '/api/v1/library/cards/c%2Fid/confirmation-review',
                body: { block: 'TEXT:JP', expected_revision: '7' },
                method: 'POST',
            });
        } finally {
            globalThis.fetch = original;
        }
    });
    console.log(`Library RUN 014 confirmation checks: ${count} PASS / 0 FAIL / 0 SKIP`);
}
