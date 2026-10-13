import path from 'node:path';

export const DEFAULT_WORKSPACE_HOST = '127.0.0.1';
export const DEFAULT_WORKSPACE_PORT = 4312;

export type WorkspaceServiceConfig = {
    workspaceRoot: string;
    host: string;
    port: number;
    automaticRecoveryPointRetention?: number;
    enabledExternalSources?: string[];
};

export type WorkspaceConfigOverrides = Partial<WorkspaceServiceConfig>;

export class WorkspaceConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WorkspaceConfigurationError';
    }
}

const readNonEmptyString = (value: string | undefined, label: string) => {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new WorkspaceConfigurationError(`${label} must be a non-empty string.`);
    }
    return value;
};

const parsePort = (value: number | string | undefined) => {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new WorkspaceConfigurationError('Workspace listen port must be an integer from 1 to 65535.');
    }
    return parsed;
};

export const loadWorkspaceConfig = ({
    env = process.env,
    overrides = {},
}: {
    env?: NodeJS.ProcessEnv;
    overrides?: WorkspaceConfigOverrides;
} = {}): WorkspaceServiceConfig => {
    const configuredRoot = overrides.workspaceRoot ?? env.YU3DOH_WORKSPACE_ROOT;
    const workspaceRoot = path.resolve(readNonEmptyString(configuredRoot, 'YU3DOH_WORKSPACE_ROOT'));
    const host = readNonEmptyString(
        overrides.host ?? env.YU3DOH_WORKSPACE_HOST ?? DEFAULT_WORKSPACE_HOST,
        'Workspace listen host',
    );
    const port = parsePort(overrides.port ?? env.YU3DOH_WORKSPACE_PORT ?? DEFAULT_WORKSPACE_PORT);

    const retention = Number(overrides.automaticRecoveryPointRetention ?? env.YU3DOH_AUTOMATIC_RECOVERY_POINT_RETENTION ?? 10);
    if (!Number.isSafeInteger(retention) || retention < 0) {
        throw new WorkspaceConfigurationError('Automatic recovery point retention must be a non-negative integer.');
    }
    const enabledExternalSources = overrides.enabledExternalSources
        ?? (env.YU3DOH_ENABLED_EXTERNAL_SOURCES ?? '').split(',').map(code=>code.trim()).filter(Boolean);
    if (!Array.isArray(enabledExternalSources) || enabledExternalSources.some(code=>code !== 'YGORESOURCES_CARD_DB')) {
        throw new WorkspaceConfigurationError('Only YGORESOURCES_CARD_DB can be explicitly enabled in Phase 1.');
    }
    return {
        enabledExternalSources: [...new Set(enabledExternalSources)],
        automaticRecoveryPointRetention: retention,
        workspaceRoot,
        host,
        port,
    };
};
