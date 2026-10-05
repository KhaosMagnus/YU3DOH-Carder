import path from 'node:path';
import { isWorkspaceRelativePath } from '../workspace/manifest';

export class WorkspaceDatabasePathError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WorkspaceDatabasePathError';
    }
}

export const resolveWorkspaceDatabasePath = (workspaceRoot: string, databasePath: string) => {
    if (!isWorkspaceRelativePath(databasePath)) {
        throw new WorkspaceDatabasePathError('database_path must remain a safe Workspace-relative path.');
    }

    const resolvedRoot = path.resolve(workspaceRoot);
    const platformRelativePath = databasePath.split(/[\\/]+/).join(path.sep);
    const resolvedDatabasePath = path.resolve(resolvedRoot, platformRelativePath);
    const relativeToRoot = path.relative(resolvedRoot, resolvedDatabasePath);

    if (
        relativeToRoot === ''
        || relativeToRoot === '..'
        || relativeToRoot.startsWith(`..${path.sep}`)
        || path.isAbsolute(relativeToRoot)
    ) {
        throw new WorkspaceDatabasePathError('Resolved database_path escapes the configured Workspace root.');
    }

    return resolvedDatabasePath;
};
