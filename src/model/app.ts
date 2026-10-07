/** Webpack use base url without trailing slash, vite does have it. */
// Prefer Vite-provided BASE_URL; fall back for Node test runners without Vite inject.
const viteBaseUrl = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
export const PUBLIC_PATH = viteBaseUrl.endsWith('/')
    ? viteBaseUrl.slice(0, -1)
    : viteBaseUrl;
