import { lstat } from 'node:fs/promises';
import path from 'node:path';
import { CarderPrepareError } from './errors';

/**
 * Resolve a DB-sourced relative path to a regular file under the workspace root
 * without following symlinks/junctions (read-only equivalent of Managed Asset policy).
 */
export const resolveNoLinksFileUnderRoot = async (
    workspaceRoot: string,
    relativePath: string,
): Promise<string> => {
    const segments = relativePath.split('/');
    if (
        segments.length === 0
        || segments.some(segment => segment === '' || segment === '.' || segment === '..'
            || segment.includes('\\')
            || segment.includes(':'))
        || path.isAbsolute(relativePath)
    ) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            'Asset relative path is invalid or escapes the workspace root.',
        );
    }

    const root = path.resolve(workspaceRoot);
    let rootStats;
    try {
        rootStats = await lstat(root);
    } catch {
        throw new CarderPrepareError(
            'ASSET_STALE',
            'Workspace root is not accessible for asset content.',
        );
    }
    if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) {
        throw new CarderPrepareError(
            'ASSET_STALE',
            'Workspace root must be a real directory.',
        );
    }

    let current = root;
    for (let index = 0; index < segments.length; index += 1) {
        const segment = segments[index]!;
        current = path.join(current, segment);
        let stats;
        try {
            stats = await lstat(current);
        } catch {
            throw new CarderPrepareError(
                'ASSET_STALE',
                'Asset path component is missing or inaccessible.',
            );
        }
        const isFinal = index === segments.length - 1;
        if (stats.isSymbolicLink()) {
            throw new CarderPrepareError(
                'ASSET_STALE',
                'Asset path traverses a filesystem link/junction.',
            );
        }
        if (isFinal) {
            if (!stats.isFile()) {
                throw new CarderPrepareError(
                    'ASSET_STALE',
                    'Asset path does not resolve to a regular file.',
                );
            }
        } else if (!stats.isDirectory()) {
            throw new CarderPrepareError(
                'ASSET_STALE',
                'Asset path component is not a real directory.',
            );
        }
    }

    return current;
};
