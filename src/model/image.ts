export const getDefaultImageStyle = () => ({ flipX: false, flipY: false });
export type ImageStyle = ReturnType<typeof getDefaultImageStyle>;

export type ImageSourceType = 'offline' | 'online';

export const PROXY_BASE = 'https://ygocarder-server.mr-equal1996.workers.dev';
export const toProxiedUrl = (imageUrl: string) =>
    `${PROXY_BASE}/?url=${encodeURIComponent(imageUrl)}`;
export const toBaseUrl = (imageUrl: string) =>
    `${decodeURIComponent(imageUrl.replaceAll(`${PROXY_BASE}/?url=`, ''))}`;
export const isUsingProxy = (imageUrl: string) => imageUrl.startsWith(PROXY_BASE);

const WORKSPACE_CARDER_ASSET_PATH = /^\/api\/v1\/carder\/assets\/[^/]+\/content$/;

/**
 * Workspace bridge asset URLs carry an opaque bearer grant. Treat them as protected
 * regardless of whether they are relative or absolute so they never enter legacy
 * external-proxy or telemetry fallback paths.
 */
export const isWorkspaceCarderAssetUrl = (imageUrl: string) => {
    if (!imageUrl) return false;
    try {
        const parsed = new URL(imageUrl, 'http://yu3doh.workspace.local');
        return WORKSPACE_CARDER_ASSET_PATH.test(parsed.pathname)
            && parsed.searchParams.has('grant');
    } catch {
        return false;
    }
};

export type OnlineImageErrorRecovery =
    | { action: 'WORKSPACE_FAIL_CLOSED' }
    | { action: 'UNPROXY'; source: string }
    | { action: 'PROXY'; source: string }
    | { action: 'TAINTED'; telemetrySource: string };

export const resolveOnlineImageErrorRecovery = (
    imageUrl: string,
    proxyAvailable: boolean,
): OnlineImageErrorRecovery => {
    if (isWorkspaceCarderAssetUrl(imageUrl)) {
        return { action: 'WORKSPACE_FAIL_CLOSED' };
    }
    if (isUsingProxy(imageUrl) && proxyAvailable) {
        return { action: 'UNPROXY', source: toBaseUrl(imageUrl) };
    }
    if (proxyAvailable) {
        return { action: 'PROXY', source: toProxiedUrl(imageUrl) };
    }
    return { action: 'TAINTED', telemetrySource: imageUrl };
};
