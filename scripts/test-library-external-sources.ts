import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExternalSourcesPanel } from '../src/library/external-sources-panel';
import {
    validExternalCardId,
    claimText,
} from '../src/library/external-source-model';
import {
    getExternalSourceHistory,
    getExternalSourceRetrieval,
    retrieveExternalSource,
    compareExternalSource,
    setLibraryMaintenanceFence,
    LibraryHttpError,
} from '../src/library/api';
import type { LibraryCardDetail } from '../src/library/model';
export async function runExternalSourceChecks() {
    let count = 0;
    const check = async (name: string, fn: () => void | Promise<void>) => {
        await fn();
        console.log(`RUN020 client ${++count} ${name} PASS`);
    };
    for (const value of ['1', '17625', '99999999999999999999'])
        await check(`valid string ID ${value}`, () =>
            assert.equal(validExternalCardId(value), true),
        );
    for (const value of [
        '',
        '0',
        '01',
        ' 1',
        '1 ',
        '1\n',
        '1\r',
        '1\r\n',
        '+1',
        '-1',
        '1.0',
        '１',
        '123456789012345678901',
        '1?x=2',
        'https://evil.invalid',
    ])
        await check(`invalid ID ${JSON.stringify(value)}`, () =>
            assert.equal(validExternalCardId(value), false),
        );
    const evidence = {
        document_id: 'doc',
        locale: 'EN' as const,
        source_path: '$.cardData.en.name',
    };
    await check('ABSENT stays distinct from PRESENT empty string', () => {
        assert.equal(claimText({ state: 'ABSENT', evidence }), 'ABSENT');
        assert.equal(
            claimText({ state: 'PRESENT', value: '', evidence }),
            '""',
        );
    });
    await check('UNMAPPED and INVALID states stay explicit', () => {
        assert.equal(
            claimText({
                state: 'UNMAPPED',
                raw_value: 'unrecognized',
                evidence,
            }),
            'UNMAPPED',
        );
        assert.equal(
            claimText({ state: 'INVALID', raw_value: 1.5, evidence }),
            'INVALID',
        );
    });
    const prior = globalThis.fetch;
    const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
    globalThis.fetch = (async (url, init) => {
        calls.push({ url: String(url), init });
        return new Response(
            JSON.stringify({ source: { enabled: false }, retrievals: [] }),
            { headers: { 'Content-Type': 'application/json' } },
        );
    }) as typeof fetch;
    const target = { target_card_id: 'card', target_expected_revision: '12' };
    try {
        await check('history uses encoded local route only', async () => {
            await getExternalSourceHistory('card/with space');
            assert.equal(
                calls.at(-1)!.url,
                '/api/v1/library/cards/card%2Fwith%20space/external-sources',
            );
            assert.equal(calls.at(-1)!.init?.method, undefined);
        });
        await check('stored detail omits raw by default', async () => {
            await getExternalSourceRetrieval('retrieval');
            assert.equal(
                calls.at(-1)!.url,
                '/api/v1/library/external-sources/retrievals/retrieval',
            );
        });
        await check('raw evidence request is explicit and local', async () => {
            await getExternalSourceRetrieval('retrieval', true);
            assert.equal(
                calls.at(-1)!.url,
                '/api/v1/library/external-sources/retrievals/retrieval?include_raw=true',
            );
        });
        await check(
            'retrieve posts strings and exact frozen target to Workspace Service',
            async () => {
                await retrieveExternalSource({
                    ...target,
                    external_card_id: '17625',
                });
                assert.equal(
                    calls.at(-1)!.url,
                    '/api/v1/library/external-sources/ygoresources/retrieve',
                );
                assert.equal(calls.at(-1)!.init!.method, 'POST');
                assert.deepEqual(
                    JSON.parse(calls.at(-1)!.init!.body as string),
                    {
                        ...target,
                        external_card_id: '17625',
                    },
                );
            },
        );
        await check('diff posts persisted target revision only', async () => {
            await compareExternalSource('candidate', target);
            assert.deepEqual(
                JSON.parse(calls.at(-1)!.init!.body as string),
                target,
            );
            assert.equal(
                calls.at(-1)!.url,
                '/api/v1/library/external-sources/candidates/candidate/diff',
            );
        });
        await check(
            'backup permits stored history/detail/read-only diff',
            async () => {
                setLibraryMaintenanceFence('BACKUP');
                await getExternalSourceHistory('card');
                await getExternalSourceRetrieval('retrieval');
                await compareExternalSource('candidate', target);
            },
        );
        await check(
            'backup still fences remote retrieve/publication',
            async () => {
                const before = calls.length;
                await assert.rejects(
                    retrieveExternalSource({
                        ...target,
                        external_card_id: '17625',
                    }),
                    (e) =>
                        e instanceof LibraryHttpError &&
                        e.code === 'WORKSPACE_MAINTENANCE_ACTIVE',
                );
                assert.equal(calls.length, before);
            },
        );
        for (const mode of ['RESTORE', 'MIGRATION', 'INITIALIZATION'] as const)
            await check(
                `${mode} fences all External Source requests`,
                async () => {
                    setLibraryMaintenanceFence(mode);
                    const before = calls.length;
                    await assert.rejects(getExternalSourceHistory('card'));
                    await assert.rejects(
                        compareExternalSource('candidate', target),
                    );
                    await assert.rejects(
                        retrieveExternalSource({
                            ...target,
                            external_card_id: '17625',
                        }),
                    );
                    assert.equal(calls.length, before);
                },
            );
        setLibraryMaintenanceFence('NONE');
        const detail: LibraryCardDetail = {
            card_id: 'card',
            revision: '12',
            family: 'SPELL',
            password: null,
            structure: null,
            localizations: [],
            confirmations: [],
            provenance: [],
            relations: [],
            classification: {
                effect_reviewed: false,
                archetypes: [],
                effect_classifiers: [],
                functional_tags: [],
            },
        };
        await check(
            'SSR/detail opening never initiates provider or local requests',
            () => {
                const before = calls.length;
                renderToStaticMarkup(
                    createElement(ExternalSourcesPanel, {
                        detail,
                        dirty: false,
                        enabled: true,
                    }),
                );
                assert.equal(calls.length, before);
            },
        );
        await check('dirty warning excludes unsaved Canonical edits', () => {
            const html = renderToStaticMarkup(
                createElement(ExternalSourcesPanel, {
                    detail,
                    dirty: true,
                    enabled: true,
                }),
            );
            assert.match(html, /Unsaved Canonical edits are not included/);
        });
        await check(
            'Phase1 surface has no apply/import/confirm/merge action',
            () => {
                const html = renderToStaticMarkup(
                    createElement(ExternalSourcesPanel, {
                        detail,
                        dirty: false,
                        enabled: true,
                    }),
                );
                for (const action of [
                    'Apply',
                    'Accept',
                    'Import',
                    'Create Draft',
                    'Confirm',
                    'Move to Draft',
                    'Merge',
                    'Rebase',
                    'Auto-match',
                ])
                    assert.equal(html.includes('>' + action + '<'), false);
            },
        );
        await check(
            'inspection source code has no executable remote rendering',
            () => {
                const code = readFileSync(
                    'src/library/external-sources-panel.tsx',
                    'utf8',
                );
                for (const pattern of [
                    'dangerouslySetInnerHTML',
                    'new Function',
                    '<iframe',
                    '<img',
                    '<script',
                    'window.open',
                    'href=',
                    'src=',
                ])
                    assert.equal(code.includes(pattern), false);
                assert.doesNotMatch(code, /\beval\s*\(/);
            },
        );
        await check(
            'browser calls remain same-origin Workspace paths only',
            () => {
                assert(
                    calls.every((c) => c.url.startsWith('/api/v1/library/')),
                );
            },
        );
    } finally {
        globalThis.fetch = prior;
        setLibraryMaintenanceFence('NONE');
    }
}
