import { randomUUID, createHash } from 'node:crypto';
import {
    closeSync,
    existsSync,
    fsyncSync,
    fstatSync,
    lstatSync,
    mkdirSync,
    openSync,
    readFileSync,
    readSync,
    readdirSync,
    rmdirSync,
    unlinkSync,
    writeFileSync,
    type Stats,
} from 'node:fs';
import path from 'node:path';
import { noLinks } from '../recovery/filesystem';
import { bootstrapWorkspaceDatabase } from '../persistence/operations';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from '../persistence/constants';
import { inspectWorkspaceRoot } from './inspect';
import {
    SUPPORTED_WORKSPACE_FORMAT_VERSION,
    type WorkspaceManifest,
} from './types';
import type { WorkspaceRuntimeManager } from './runtime';

export class WorkspaceInitializationError extends Error {
    constructor(
        readonly code:
            | 'WORKSPACE_INITIALIZATION_NOT_ALLOWED'
            | 'WORKSPACE_INITIALIZATION_UNSAFE'
            | 'WORKSPACE_INITIALIZATION_FAILED',
        message: string,
        readonly statusCode: number,
        options?: ErrorOptions,
    ) {
        super(message, options);
    }
}
/** Constructor-only test boundaries: never accepted over HTTP or through environment variables. */
export type InitializationBoundary =
    | 'leased'
    | 'root_created'
    | 'bootstrap'
    | 'db_staged'
    | 'db_published'
    | 'manifest_published'
    | 'runtime_reloaded';
export type InitializationHooks = {
    atBoundary?: (boundary: InitializationBoundary) => void | Promise<void>;
};
type Owned = { file: string; stat: Stats; digest?: string };
const digest = (file: string) =>
    createHash('sha256').update(readFileSync(file)).digest('hex');
const same = (a: Stats, b: Stats) =>
    a.dev === b.dev && a.ino === b.ino && a.birthtimeMs === b.birthtimeMs;

export class WorkspaceInitializationService {
    constructor(
        private readonly runtime: WorkspaceRuntimeManager,
        private readonly hooks: InitializationHooks = {},
    ) {}
    async initialize() {
        return this.runtime.maintenance.maintain('INITIALIZATION', async () => {
            const root = this.runtime.workspaceRoot;
            const files: Owned[] = [];
            const directories: Owned[] = [];
            const rememberFile = (file: string) => {
                safe(file);
                const owned = {
                    file,
                    stat: lstatSync(file),
                    digest: digest(file),
                };
                files.push(owned);
                return owned;
            };
            const rememberDirectory = (file: string) => {
                const owned = { file, stat: lstatSync(file) };
                directories.push(owned);
                return owned;
            };
            const safe = (file: string, missing = false) => {
                try {
                    noLinks(file, missing);
                } catch (error) {
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_UNSAFE',
                        'Configured Workspace location is not a safe real filesystem target.',
                        422,
                        { cause: error },
                    );
                }
            };
            const owned = (value: Owned) => {
                try {
                    safe(value.file);
                    const current = lstatSync(value.file);
                    return (
                        same(value.stat, current) &&
                        (value.digest === undefined ||
                            digest(value.file) === value.digest)
                    );
                } catch {
                    return false;
                }
            };
            const removeFile = (value: Owned) => {
                if (owned(value)) unlinkSync(value.file);
            };
            const publishExclusive = (file: string, bytes: Buffer) => {
                safe(file, true);
                const fd = openSync(file, 'wx+', 0o600);
                const record: Owned = {
                    file,
                    stat: fstatSync(fd),
                    digest: createHash('sha256').update(bytes).digest('hex'),
                };
                files.push(record);
                try {
                    writeFileSync(fd, bytes);
                    fsyncSync(fd);
                } catch (error) {
                    const size = fstatSync(fd).size;
                    if (size <= bytes.length) {
                        const partial = Buffer.alloc(size);
                        readSync(fd, partial, 0, size, 0);
                        if (bytes.subarray(0, size).equals(partial))
                            record.digest = createHash('sha256')
                                .update(partial)
                                .digest('hex');
                    }
                    throw error;
                } finally {
                    closeSync(fd);
                }
                return record;
            };
            const emptyRoot = () => {
                safe(root);
                if (
                    !lstatSync(root).isDirectory() ||
                    readdirSync(root).length !== 0
                )
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_NOT_ALLOWED',
                        'Configured Workspace location is no longer an empty directory.',
                        409,
                    );
            };
            try {
                await this.hooks.atBoundary?.('leased');
                if (
                    this.runtime.current.status.state !== 'NEEDS_INITIALIZATION'
                )
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_NOT_ALLOWED',
                        'Workspace initialization is allowed only in NEEDS_INITIALIZATION.',
                        409,
                    );
                safe(root, true);
                const fresh = await inspectWorkspaceRoot(root);
                if (fresh.state !== 'NEEDS_INITIALIZATION')
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_NOT_ALLOWED',
                        'Configured Workspace state changed; initialization is no longer allowed.',
                        409,
                    );
                // Create each missing ancestor exclusively, recording only directories this attempt created.
                const missing: string[] = [];
                let cursor = root;
                while (!existsSync(cursor)) {
                    missing.unshift(cursor);
                    const parent = path.dirname(cursor);
                    if (parent === cursor) break;
                    cursor = parent;
                }
                for (const directory of missing) {
                    safe(directory, true);
                    try {
                        mkdirSync(directory);
                        rememberDirectory(directory);
                    } catch (error) {
                        if ((error as NodeJS.ErrnoException).code !== 'EEXIST')
                            throw error;
                    }
                    safe(directory);
                }
                await this.hooks.atBoundary?.('root_created');
                emptyRoot();
                const manifest: WorkspaceManifest = {
                    workspace_id: randomUUID(),
                    workspace_format_version:
                        SUPPORTED_WORKSPACE_FORMAT_VERSION,
                    database_path: 'Data/workspace.db',
                    created_at: new Date().toISOString(),
                };
                const stageName = '.initialization-' + randomUUID();
                const stage = path.join(root, stageName);
                safe(stage, true);
                mkdirSync(stage, { mode: 0o700 });
                rememberDirectory(stage);
                await this.hooks.atBoundary?.('bootstrap');
                // Existing bootstrap owns SQLite/migration/failed-bootstrap cleanup; staging prevents an external DB from being opened or overwritten.
                safe(stage);
                if (!owned(directories.find((d) => d.file === stage)!))
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_UNSAFE',
                        'Initialization staging ownership changed unexpectedly.',
                        422,
                    );
                bootstrapWorkspaceDatabase(root, {
                    ...manifest,
                    database_path: stageName + '/workspace.db',
                });
                const staged = rememberFile(path.join(stage, 'workspace.db'));
                await this.hooks.atBoundary?.('db_staged');
                safe(root);
                if (readdirSync(root).some((name) => name !== stageName))
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_NOT_ALLOWED',
                        'Unknown content appeared during initialization.',
                        409,
                    );
                if (
                    !owned(staged) ||
                    readdirSync(stage).some((name) => name !== 'workspace.db')
                )
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_UNSAFE',
                        'Initialization staging content changed unexpectedly.',
                        422,
                    );
                const data = path.join(root, 'Data');
                safe(data, true);
                mkdirSync(data);
                rememberDirectory(data);
                const database = path.join(data, 'workspace.db');
                safe(database, true);
                // Exclusive descriptor publication supports POSIX and Windows without relying on rename-overwrite or hard-link support.
                const databaseBytes = readFileSync(staged.file);
                if (
                    createHash('sha256').update(databaseBytes).digest('hex') !==
                    staged.digest
                )
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_UNSAFE',
                        'Initialization staging bytes changed unexpectedly.',
                        422,
                    );
                publishExclusive(database, databaseBytes);
                removeFile(staged);
                if (owned(directories.find((d) => d.file === stage)!))
                    rmdirSync(stage);
                await this.hooks.atBoundary?.('db_published');
                safe(root);
                safe(data);
                if (
                    readdirSync(root).some((name) => name !== 'Data') ||
                    readdirSync(data).some((name) => name !== 'workspace.db')
                )
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_NOT_ALLOWED',
                        'Unknown content appeared before Workspace publication.',
                        409,
                    );
                const manifestFile = path.join(root, 'workspace.json');
                safe(manifestFile, true);
                const content = JSON.stringify(manifest, null, 2) + '\n';
                publishExclusive(manifestFile, Buffer.from(content));
                await this.hooks.atBoundary?.('manifest_published');
                // Do not open a foreign replacement DB or adopt pre-existing/foreign SQLite sidecars.
                safe(root);
                safe(data);
                if (
                    readdirSync(root).some(
                        (name) => !['Data', 'workspace.json'].includes(name),
                    ) ||
                    readdirSync(data).some((name) => name !== 'workspace.db') ||
                    !owned(directories.find((d) => d.file === data)!) ||
                    !owned(files.find((f) => f.file === database)!) ||
                    !owned(files.find((f) => f.file === manifestFile)!)
                )
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_NOT_ALLOWED',
                        'Workspace publication changed before runtime adoption.',
                        409,
                    );
                const status = await this.runtime.reload();
                // Track only SQLite sidecars actually created during our reload; never enumerate/delete foreign files recursively.
                for (const suffix of ['-wal', '-shm', '-journal']) {
                    const file = database + suffix;
                    if (existsSync(file)) rememberFile(file);
                }
                await this.hooks.atBoundary?.('runtime_reloaded');
                safe(root);
                safe(database);
                safe(manifestFile);
                if (
                    status.state !== 'READY' ||
                    status.read_only ||
                    status.workspace_id !== manifest.workspace_id ||
                    status.workspace_format_version !==
                        SUPPORTED_WORKSPACE_FORMAT_VERSION ||
                    status.database_schema_version !==
                        SUPPORTED_DATABASE_SCHEMA_VERSION ||
                    !this.runtime.current.persistence ||
                    !owned(files.find((f) => f.file === manifestFile)!) ||
                    !owned(files.find((f) => f.file === database)!)
                )
                    throw new WorkspaceInitializationError(
                        'WORKSPACE_INITIALIZATION_FAILED',
                        'Initialized Workspace did not satisfy strict READY postconditions.',
                        500,
                    );
                return {
                    operation: 'INITIALIZE' as const,
                    initialized: true,
                    workspace_id: manifest.workspace_id,
                    workspace_format_version: status.workspace_format_version,
                    database_schema_version: status.database_schema_version,
                    status,
                };
            } catch (error) {
                // Stop only our persistence before compensating. Ownership + content proofs prevent deleting externally replaced/modified files.
                this.runtime.closePersistence();
                for (const file of [...files].reverse())
                    try {
                        removeFile(file);
                    } catch {
                        /* Preserve unproven content. */
                    }
                for (const directory of [...directories].reverse())
                    try {
                        if (
                            owned(directory) &&
                            readdirSync(directory.file).length === 0
                        )
                            rmdirSync(directory.file);
                    } catch {
                        /* Preserve unknown content / changed ownership. */
                    }
                try {
                    await this.runtime.reload();
                } catch {
                    this.runtime.recoveryRequired(
                        'Initialization failed; the configured Workspace could not be re-inspected.',
                    );
                }
                if (error instanceof WorkspaceInitializationError) throw error;
                throw new WorkspaceInitializationError(
                    'WORKSPACE_INITIALIZATION_FAILED',
                    'Workspace initialization failed; inspect authoritative Workspace status before retrying.',
                    500,
                    { cause: error },
                );
            }
        });
    }
}
