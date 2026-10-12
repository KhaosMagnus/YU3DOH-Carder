/* Isolated fixtures only. No production route imports this file; configured root never changes. */
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { createHash } = require('node:crypto');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
async function run() {
    const parent = await fs.mkdtemp(
        path.join(os.tmpdir(), 'YU3DOH RUN016 UI 日本語 '),
    );
    const root = path.join(parent, 'configured Workspace 日本語');
    let mode = 'NONE',
        held = false,
        release,
        releaseConflict;
    const service = await createWorkspaceService(
        { workspaceRoot: root, host: '127.0.0.1', port: 4312 },
        {
            initializationHooks: {
                atBoundary: async (b) => {
                    if (mode === 'HOLD' && b === 'leased') {
                        held = true;
                        await new Promise((r) => (release = r));
                        held = false;
                        mode = 'NONE';
                    }
                    if (mode === 'FAIL' && b === 'db_staged')
                        throw new Error('QA-only controlled failure');
                    if (mode === 'FOREIGN_FAIL' && b === 'db_staged') {
                        await fs.writeFile(
                            path.join(root, 'keep-me.txt'),
                            'foreign bytes to preserve',
                        );
                        throw new Error('QA-only foreign-content failure');
                    }
                },
            },
        },
    );
    const snapshot = async () => {
        const result = { root_exists: false, files: [], directories: [] };
        try {
            await fs.lstat(root);
            result.root_exists = true;
        } catch {
            return result;
        }
        const walk = async (relative) => {
            const file = path.join(root, relative);
            const stat = await fs.lstat(file);
            if (stat.isSymbolicLink())
                throw new Error('Unexpected fixture link');
            if (stat.isDirectory()) {
                if (relative) result.directories.push(relative);
                for (const name of (await fs.readdir(file)).sort())
                    await walk(relative ? relative + '/' + name : name);
            } else {
                const bytes = await fs.readFile(file);
                result.files.push({
                    relative_path: relative,
                    size: bytes.length,
                    sha256: createHash('sha256').update(bytes).digest('hex'),
                    ...(/\.(json|txt)$/.test(relative)
                        ? { text: bytes.toString('utf8') }
                        : {}),
                });
            }
        };
        await walk('');
        return result;
    };
    const prefix = '/api/v1/workspace/_qa/';
    service.app.get(prefix + 'info', async () => ({
        root,
        workspace_id: service.status.workspace_id,
        configured_root: service.runtime.workspaceRoot,
        held,
        mode,
        status: service.status,
    }));
    service.app.get(prefix + 'fs', snapshot);
    service.app.post(prefix + 'reset', async (request) => {
        releaseConflict?.();
        releaseConflict = undefined;
        mode = 'NONE';
        service.runtime.closePersistence();
        await fs.rm(root, {
            recursive: true,
            force: true,
            maxRetries: 5,
            retryDelay: 100,
        });
        if (request.body.kind !== 'MISSING') await fs.mkdir(root);
        if (request.body.kind === 'FOREIGN')
            await fs.writeFile(
                path.join(root, 'keep-me.txt'),
                'original unknown content',
            );
        return service.runtime.reload();
    });
    service.app.post(prefix + 'foreign', async () => {
        await fs.writeFile(
            path.join(root, 'keep-me.txt'),
            'stale foreign content',
        );
        return snapshot();
    });
    service.app.post(prefix + 'mode', async (request) => {
        mode = request.body.mode;
        if (mode === 'CONFLICT')
            releaseConflict =
                service.runtime.maintenance.acquireMaintenance('BACKUP');
        return { mode };
    });
    service.app.post(prefix + 'release', async () => {
        release?.();
        releaseConflict?.();
        releaseConflict = undefined;
        mode = 'NONE';
        return { released: true };
    });
    service.app.post(prefix + 'seed', async () => {
        let c = service.canonical.createCard({
            family: 'SPELL',
            password: '16000001',
        });
        c = service.canonical.mutateCard(c.cardId, c.revision, {
            localizations: [
                {
                    language: 'EN',
                    name: 'QA Stale Card',
                    cardText: 'Stale persisted data',
                    pendulumText: null,
                },
            ],
        });
        return { card_id: c.cardId };
    });
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    console.log(
        JSON.stringify({
            ready: true,
            root,
            fixture_id: 'run016-isolated-qa',
            workspace_id: null,
        }),
    );
    for (const signal of ['SIGTERM', 'SIGINT'])
        process.once(signal, async () => {
            release?.();
            releaseConflict?.();
            await service.close();
            await fs.rm(parent, {
                recursive: true,
                force: true,
                maxRetries: 5,
                retryDelay: 100,
            });
            process.exit(0);
        });
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
