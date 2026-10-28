export type LibraryTheme = 'LIGHT' | 'DARK';

export const LIBRARY_THEME_KEY = 'yu3doh.library.theme.v1';
export const LIBRARY_THEME_ATTRIBUTE = 'data-yu3doh-library-theme';
export const TEMPORARY_THEME_MESSAGE = 'Theme preference could not be saved; this selection is temporary.';

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;
type StorageProvider = () => ThemeStorage;
const browserStorage: StorageProvider = () => window.localStorage;

export const resolveLibraryTheme = (value: unknown): LibraryTheme =>
    value === 'LIGHT' ? 'LIGHT' : 'DARK';

// Accessing localStorage itself can throw (not only getItem/setItem).
export const readLibraryTheme = (storage: StorageProvider = browserStorage): LibraryTheme => {
    try {
        return resolveLibraryTheme(storage().getItem(LIBRARY_THEME_KEY));
    } catch {
        return 'DARK';
    }
};

export const applyLibraryTheme = (theme: LibraryTheme, root = document.documentElement) => {
    root.setAttribute(LIBRARY_THEME_ATTRIBUTE, theme);
};

export const selectLibraryTheme = (theme: LibraryTheme, storage: StorageProvider = browserStorage) => {
    applyLibraryTheme(theme);
    try {
        storage().setItem(LIBRARY_THEME_KEY, theme);
        return { theme, status: null };
    } catch {
        return { theme, status: TEMPORARY_THEME_MESSAGE };
    }
};
