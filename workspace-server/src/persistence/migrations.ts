import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { SUPPORTED_DATABASE_SCHEMA_VERSION } from './constants';
import { readDatabaseSchemaVersion, type SqliteDatabase } from './database';

export type SqlMigration = {
    version: number;
    name: string;
    sql: string;
};

export type MigrationResult = {
    previousVersion: number;
    currentVersion: number;
    appliedVersions: number[];
};

const migrationFilePattern = /^(\d{3})_([a-z0-9][a-z0-9_-]*)\.sql$/;

const resolveMigrationDirectory = () => {
    const candidates = [
        path.resolve(__dirname, '../../migrations'),
        path.resolve(__dirname, '../../../migrations'),
    ];
    const migrationDirectory = candidates.find(candidate => existsSync(candidate));
    if (!migrationDirectory) {
        throw new Error('Workspace migration directory could not be located.');
    }
    return migrationDirectory;
};

export const loadMigrations = (): SqlMigration[] => {
    const migrationDirectory = resolveMigrationDirectory();
    const migrations = readdirSync(migrationDirectory)
        .map(fileName => {
            const match = migrationFilePattern.exec(fileName);
            if (!match) return null;
            const versionText = match[1];
            const name = match[2];
            if (!versionText || !name) return null;
            return {
                version: Number(versionText),
                name,
                sql: readFileSync(path.join(migrationDirectory, fileName), 'utf8'),
            } satisfies SqlMigration;
        })
        .filter((migration): migration is SqlMigration => migration !== null)
        .sort((left, right) => left.version - right.version);

    if (migrations.length !== SUPPORTED_DATABASE_SCHEMA_VERSION) {
        throw new Error(
            `Expected ${SUPPORTED_DATABASE_SCHEMA_VERSION} Workspace migrations, found ${migrations.length}.`,
        );
    }

    migrations.forEach((migration, index) => {
        const expectedVersion = index + 1;
        if (migration.version !== expectedVersion) {
            throw new Error(`Workspace migrations must be contiguous; expected version ${expectedVersion}.`);
        }
    });

    return migrations;
};

export const verifyCurrentMigrationHistory = (
    database: SqliteDatabase,
    schemaVersion: number,
    migrations = loadMigrations(),
) => {
    if (schemaVersion === 0) return;
    if (schemaVersion > SUPPORTED_DATABASE_SCHEMA_VERSION) return;

    const expected = migrations.filter(migration => migration.version <= schemaVersion);
    const table = database.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = '_workspace_migrations'
    `).get() as { name?: string } | undefined;

    if (table?.name !== '_workspace_migrations') {
        throw new Error('Workspace migration history table is missing.');
    }

    const rows = database.prepare(`
        SELECT version, name
        FROM _workspace_migrations
        ORDER BY version
    `).all() as Array<{ version: number; name: string }>;

    if (rows.length !== expected.length) {
        throw new Error('Workspace migration history does not match database_schema_version.');
    }

    expected.forEach((migration, index) => {
        const row = rows[index];
        if (!row || row.version !== migration.version || row.name !== migration.name) {
            throw new Error('Workspace migration history is inconsistent.');
        }
    });
};

export const applyMigrations = (
    database: SqliteDatabase,
    migrations = loadMigrations(),
): MigrationResult => {
    const previousVersion = readDatabaseSchemaVersion(database);
    if (previousVersion < 0) throw new Error('database_schema_version cannot be negative.');
    if (previousVersion > SUPPORTED_DATABASE_SCHEMA_VERSION) {
        throw new Error(
            `Database schema ${previousVersion} is newer than supported schema ${SUPPORTED_DATABASE_SCHEMA_VERSION}.`,
        );
    }

    verifyCurrentMigrationHistory(database, previousVersion, migrations);
    const appliedVersions: number[] = [];

    for (const migration of migrations) {
        if (migration.version <= previousVersion) continue;

        const applyOne = database.transaction(() => {
            database.exec(migration.sql);
            database.prepare(`
                INSERT INTO _workspace_migrations (version, name)
                VALUES (?, ?)
            `).run(migration.version, migration.name);
            database.pragma(`user_version = ${migration.version}`);
        });

        applyOne();
        appliedVersions.push(migration.version);
    }

    const currentVersion = readDatabaseSchemaVersion(database);
    verifyCurrentMigrationHistory(database, currentVersion, migrations);

    if (currentVersion !== SUPPORTED_DATABASE_SCHEMA_VERSION) {
        throw new Error(
            `Migration runner ended at schema ${currentVersion}; expected ${SUPPORTED_DATABASE_SCHEMA_VERSION}.`,
        );
    }

    return { previousVersion, currentVersion, appliedVersions };
};
