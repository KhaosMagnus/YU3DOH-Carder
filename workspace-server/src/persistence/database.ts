import Database from 'better-sqlite3';
import { SQLITE_BUSY_TIMEOUT_MS } from './constants';

export type SqliteDatabase = Database.Database;

export type SqliteRuntimeConfiguration = {
    foreignKeys: boolean;
    journalMode: string;
    busyTimeoutMs: number;
};

const readIntegerPragma = (database: SqliteDatabase, pragma: string) => {
    const value = database.pragma(pragma, { simple: true });
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new Error(`SQLite PRAGMA ${pragma} did not return an integer.`);
    }
    return value;
};

const readStringPragma = (database: SqliteDatabase, pragma: string) => {
    const value = database.pragma(pragma, { simple: true });
    if (typeof value !== 'string') {
        throw new Error(`SQLite PRAGMA ${pragma} did not return a string.`);
    }
    return value;
};

export const readDatabaseSchemaVersion = (database: SqliteDatabase) =>
    readIntegerPragma(database, 'user_version');

export const assertReadableSqliteDatabase = (database: SqliteDatabase) => {
    readIntegerPragma(database, 'schema_version');
};

export const configureOperationalDatabase = (database: SqliteDatabase): SqliteRuntimeConfiguration => {
    database.pragma('foreign_keys = ON');
    database.pragma('journal_mode = WAL');
    database.pragma(`busy_timeout = ${SQLITE_BUSY_TIMEOUT_MS}`);

    const foreignKeys = readIntegerPragma(database, 'foreign_keys') === 1;
    const journalMode = readStringPragma(database, 'journal_mode').toLowerCase();
    const busyTimeoutMs = readIntegerPragma(database, 'busy_timeout');

    if (!foreignKeys) throw new Error('SQLite foreign_keys could not be enabled.');
    if (journalMode !== 'wal') throw new Error(`SQLite journal_mode is ${journalMode}, expected wal.`);
    if (busyTimeoutMs !== SQLITE_BUSY_TIMEOUT_MS) {
        throw new Error(`SQLite busy_timeout is ${busyTimeoutMs}, expected ${SQLITE_BUSY_TIMEOUT_MS}.`);
    }

    return { foreignKeys, journalMode, busyTimeoutMs };
};

export const openReadonlyDatabase = (databasePath: string) => {
    const database = new Database(databasePath, {
        readonly: true,
        fileMustExist: true,
    });
    try {
        assertReadableSqliteDatabase(database);
        return database;
    } catch (error) {
        database.close();
        throw error;
    }
};

export const openOperationalDatabase = (databasePath: string) => {
    const database = new Database(databasePath, {
        fileMustExist: true,
    });
    try {
        assertReadableSqliteDatabase(database);
        const runtimeConfiguration = configureOperationalDatabase(database);
        return { database, runtimeConfiguration };
    } catch (error) {
        database.close();
        throw error;
    }
};

export class WorkspacePersistence {
    private closed = false;

    constructor(
        private readonly database: SqliteDatabase,
        private readonly runtimeConfiguration: SqliteRuntimeConfiguration,
    ) {}

    get isOpen() {
        return !this.closed && this.database.open;
    }

    getRuntimeConfiguration(): SqliteRuntimeConfiguration {
        return { ...this.runtimeConfiguration };
    }

    runRepositoryOperation<T>(operation: (database: SqliteDatabase) => T): T {
        if (!this.isOpen) throw new Error('Workspace persistence is closed.');
        return operation(this.database);
    }

    transaction<T>(operation: (database: SqliteDatabase) => T): T {
        if (!this.isOpen) throw new Error('Workspace persistence is closed.');
        const runTransaction = this.database.transaction(() => operation(this.database));
        return runTransaction();
    }

    close() {
        if (this.closed) return;
        this.closed = true;
        if (this.database.open) this.database.close();
    }
}

export const acquireWorkspacePersistence = (databasePath: string) => {
    const { database, runtimeConfiguration } = openOperationalDatabase(databasePath);
    return new WorkspacePersistence(database, runtimeConfiguration);
};
