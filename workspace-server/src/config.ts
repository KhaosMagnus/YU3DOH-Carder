import path from 'node:path';

export const DEFAULT_WORKSPACE_HOST = '127.0.0.1';
export const DEFAULT_WORKSPACE_PORT = 4312;

export type WorkspaceServiceConfig = {
    workspaceRoot: string;
    host: string;
    port: number;
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

    return {
        workspaceRoot,
        host,
        port,
    };
};
