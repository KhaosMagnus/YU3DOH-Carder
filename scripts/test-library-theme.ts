import assert from 'node:assert/strict';
import { applyLibraryTheme, LIBRARY_THEME_ATTRIBUTE, LIBRARY_THEME_KEY, readLibraryTheme, resolveLibraryTheme, selectLibraryTheme, TEMPORARY_THEME_MESSAGE } from '../src/library/theme';

let stored: string | null = null;
let effective = '';
let writes: string[] = [];
let denyRead = false;
let denyWrite = false;
const root = { setAttribute: (key: string, value: string) => {
    assert.equal(key, LIBRARY_THEME_ATTRIBUTE);
    effective = value;
} };
Object.defineProperty(globalThis, 'document', { value: { documentElement: root } });
const storage = () => ({
    getItem: (key: string) => { assert.equal(key, LIBRARY_THEME_KEY); if (denyRead) throw Error('denied'); return stored; },
    setItem: (key: string, value: string) => {
        assert.equal(key, LIBRARY_THEME_KEY);
        // Persistence is attempted only after the chosen theme is already applied.
        assert.equal(effective, value);
        if (denyWrite) throw Error('quota');
        writes.push(value); stored = value;
    },
});
const run = (id: string, check: () => void) => { check(); console.log(`${id} PASS`); };
run('DT-U01', () => { assert.equal(readLibraryTheme(storage), 'DARK'); assert.deepEqual(writes, []); });
run('DT-U02', () => { stored = 'LIGHT'; assert.equal(readLibraryTheme(storage), 'LIGHT'); });
run('DT-U03', () => { stored = 'DARK'; assert.equal(readLibraryTheme(storage), 'DARK'); });
run('DT-U04', () => { stored = 'unknown'; assert.equal(readLibraryTheme(storage), 'DARK'); assert.equal(stored, 'unknown'); assert.deepEqual(writes, []); });
run('DT-U05', () => {
    denyRead = true; assert.equal(readLibraryTheme(storage), 'DARK'); denyRead = false;
    assert.equal(readLibraryTheme(() => { throw Error('storage getter denied'); }), 'DARK');
});
run('DT-U06', () => { assert.deepEqual(selectLibraryTheme('LIGHT', storage), { theme: 'LIGHT', status: null }); assert.equal(effective, 'LIGHT'); assert.deepEqual(writes, ['LIGHT']); });
run('DT-U07', () => { assert.deepEqual(selectLibraryTheme('DARK', storage), { theme: 'DARK', status: null }); assert.equal(effective, 'DARK'); assert.deepEqual(writes, ['LIGHT', 'DARK']); });
run('DT-U08', () => {
    denyWrite = true;
    assert.deepEqual(selectLibraryTheme('LIGHT', storage), { theme: 'LIGHT', status: TEMPORARY_THEME_MESSAGE });
    assert.equal(effective, 'LIGHT'); assert.equal(stored, 'DARK');
    assert.equal(selectLibraryTheme('DARK', () => { throw Error('getter denied'); }).status, TEMPORARY_THEME_MESSAGE);
});
run('DT-U09', () => { denyWrite = false; assert.equal(selectLibraryTheme('LIGHT', storage).status, null); assert.equal(stored, 'LIGHT'); });
run('DT-U10', () => { for (const value of ['light', 'Dark', ' Dark ', '', 'LIGHT ', '\tDARK', null, undefined, 0]) assert.equal(resolveLibraryTheme(value), 'DARK'); });
run('DT-U11', () => {
    Object.defineProperty(globalThis, 'window', { value: { matchMedia: () => { throw Error('OS preferences must never be consulted'); } } });
    for (const value of ['SYSTEM', 'AUTO']) assert.equal(resolveLibraryTheme(value), 'DARK');
    stored = 'LIGHT'; assert.equal(readLibraryTheme(storage), 'LIGHT');
    stored = null; assert.equal(readLibraryTheme(storage), 'DARK');
});
run('DT-U12', () => { assert.equal(LIBRARY_THEME_KEY, 'yu3doh.library.theme.v1'); applyLibraryTheme('DARK', root as HTMLElement); assert.equal(effective, 'DARK'); });
