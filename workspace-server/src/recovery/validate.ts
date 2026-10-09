import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { openReadonlyDatabase, readDatabaseSchemaVersion } from '../persistence/database';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from '../persistence/constants';
import { verifyCurrentMigrationHistory } from '../persistence/migrations';
import { parseWorkspaceManifest } from '../workspace/manifest';
import { SUPPORTED_WORKSPACE_FORMAT_VERSION } from '../workspace/types';
import { WorkspaceRecoveryError } from './errors';
import { fileIntegrity, noLinks, safeRelative, under, walk } from './filesystem';
import type { BackupMetadata } from './types';

function invalid(message: string): never { throw new WorkspaceRecoveryError('BACKUP_INVALID', message); };
function incompatible(message: string): never { throw new WorkspaceRecoveryError('BACKUP_INCOMPATIBLE', message); };
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(v => typeof v === 'string');

export const databaseRelative = (value: string) => {
    const rel = safeRelative(value);
    if (['Backups', 'Temp', 'workspace.json'].some(root => rel.toLowerCase() === root.toLowerCase()
        || rel.toLowerCase().startsWith(`${root.toLowerCase()}/`))) {
        incompatible('database_path overlaps an excluded recovery-management root or manifest.');
    }
    if (['Config', 'Assets', 'Output'].some(root => rel.toLowerCase() === root.toLowerCase())) {
        incompatible('database_path overlaps a required directory.');
    }
    return rel;
};

export const readBackupMetadata = (container: string): BackupMetadata => {
    noLinks(container);
    const raw: unknown = JSON.parse(readFileSync(under(container, 'backup.json'), 'utf8'));
    if (!record(raw)) invalid('Backup metadata must be an object.');
    if (raw.completion_state !== 'COMPLETE') throw new WorkspaceRecoveryError('BACKUP_INCOMPLETE', 'Backup is not COMPLETE.');
    if (raw.backup_format_version !== 1) incompatible('Unsupported backup format.');
    if (raw.kind !== 'RECOVERY_POINT' && raw.kind !== 'FULL') invalid('Unknown backup kind.');
    if (raw.origin !== 'MANUAL' && raw.origin !== 'PRE_MIGRATION') invalid('Unknown backup origin.');
    if (!['NONE', 'MIGRATION_PENDING', 'MIGRATION_FAILED'].includes(String(raw.protection_state))) invalid('Unknown protection state.');
    for (const key of ['backup_id', 'workspace_id', 'created_at', 'reason', 'source_database_path']) {
        if (typeof raw[key] !== 'string' || !raw[key]) invalid(`Missing metadata ${key}.`);
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(String(raw.backup_id))) invalid('Invalid backup_id.');
    if (Number.isNaN(Date.parse(String(raw.created_at)))) invalid('Invalid backup timestamp.');
    if (typeof raw.include_output !== 'boolean' || (raw.kind === 'RECOVERY_POINT' && raw.include_output)) invalid('Invalid Output contract.');
    if (raw.workspace_format_version !== SUPPORTED_WORKSPACE_FORMAT_VERSION) incompatible('Unsupported Workspace format.');
    if (typeof raw.database_schema_version !== 'number' || !Number.isInteger(raw.database_schema_version)
        || raw.database_schema_version < 0 || raw.database_schema_version > SUPPORTED_DATABASE_SCHEMA_VERSION) incompatible('Unsupported database schema.');
    if (!strings(raw.included_roots) || !strings(raw.excluded_roots) || !strings(raw.directories)
        || !strings(raw.absent_source_roots) || !Array.isArray(raw.files)) invalid('Missing payload inventory.');
    const db = databaseRelative(String(raw.source_database_path));
    const roots = ['workspace.json', db, 'Config', ...(raw.kind === 'FULL' ? ['Assets'] : []), ...(raw.include_output ? ['Output'] : [])];
    const excluded = ['Temp', 'Backups', ...(raw.kind === 'RECOVERY_POINT' ? ['Assets'] : []), ...(!raw.include_output ? ['Output'] : [])];
    if (JSON.stringify(raw.included_roots) !== JSON.stringify(roots)
        || JSON.stringify(raw.excluded_roots) !== JSON.stringify(excluded)) invalid('Included/excluded roots contradict the backup kind.');
    const allowed = (rel: string) => rel === 'workspace.json' || rel === db || ['Config',
        ...(raw.kind === 'FULL' ? ['Assets'] : []), ...(raw.include_output ? ['Output'] : [])]
        .some(root => rel === root || rel.startsWith(`${root}/`));
    const seen = new Set<string>();
    for (const file of raw.files) {
        if (!record(file) || typeof file.relative_path !== 'string'
            || typeof file.size_bytes !== 'number' || !Number.isSafeInteger(file.size_bytes) || file.size_bytes < 0
            || typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(file.sha256)) invalid('Invalid file integrity metadata.');
        const rel = safeRelative(file.relative_path);
        if (rel !== file.relative_path || !allowed(rel) || seen.has(rel.toLowerCase())) invalid('Duplicate, aliased or unauthorized payload file.');
        seen.add(rel.toLowerCase());
    }
    if (!seen.has('workspace.json') || !seen.has(db.toLowerCase())) invalid('Required manifest/database inventory is missing.');
    const dirs = new Set<string>();
    for (const dir of raw.directories) {
        const rel = safeRelative(dir);
        // DB parent directories are also allowed, even with a custom database location.
        if (rel !== dir || (!allowed(dir) && !db.startsWith(`${dir}/`)) || dirs.has(dir.toLowerCase())
            || seen.has(dir.toLowerCase())) invalid('Invalid directory inventory.');
        dirs.add(dir.toLowerCase());
    }
    for (const required of ['Config', ...(raw.kind === 'FULL' ? ['Assets'] : []), ...(raw.include_output ? ['Output'] : [])]) {
        if (!dirs.has(required.toLowerCase())) invalid(`Required ${required} directory is missing.`);
    }
    return raw as unknown as BackupMetadata;
};

export const validateBackup = async (container: string, expectedId?: string) => {
    try {
        const metadata = readBackupMetadata(container);
        const payload = under(container, 'payload');
        const tree = walk(payload);
        if (JSON.stringify([...tree.files].sort()) !== JSON.stringify(metadata.files.map(f => f.relative_path).sort())
            || JSON.stringify([...tree.directories].sort()) !== JSON.stringify([...metadata.directories].sort())) invalid('Payload inventory differs from metadata.');
        for (const entry of metadata.files) {
            const actual = await fileIntegrity(under(payload, entry.relative_path));
            if (actual.size_bytes !== entry.size_bytes || actual.sha256 !== entry.sha256) invalid('Payload hash or size mismatch.');
        }
        const parsed = parseWorkspaceManifest(readFileSync(under(payload, 'workspace.json'), 'utf8'));
        if (!parsed.ok) invalid('Invalid payload workspace.json.');
        const manifest = parsed.manifest;
        if (manifest.workspace_id !== metadata.workspace_id || manifest.workspace_format_version !== metadata.workspace_format_version
            || databaseRelative(manifest.database_path) !== metadata.source_database_path) invalid('Manifest and backup metadata disagree.');
        if (expectedId && manifest.workspace_id !== expectedId) {
            throw new WorkspaceRecoveryError('WORKSPACE_ID_MISMATCH', 'Backup belongs to a different Workspace identity.');
        }
        const db = openReadonlyDatabase(under(payload, metadata.source_database_path));
        try {
            if (readDatabaseSchemaVersion(db) !== metadata.database_schema_version) invalid('Database schema disagrees with backup metadata.');
            if (db.pragma('quick_check', { simple: true }) !== 'ok') invalid('Backup database integrity check failed.');
            verifyCurrentMigrationHistory(db, metadata.database_schema_version);
        } finally { db.close(); }
        // Read-only SQLite validation must not introduce un-inventoried WAL/SHM files.
        if (!lstatSync(path.join(payload, ...metadata.source_database_path.split('/'))).isFile()) invalid('Database is not regular.');
        return { metadata, manifest, payload };
    } catch (error) {
        if (error instanceof WorkspaceRecoveryError) throw error;
        throw new WorkspaceRecoveryError('BACKUP_INVALID', 'Backup could not be fully validated.', { cause: error });
    }
};
