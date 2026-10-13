/* Disposable QA only: no production routes, user Workspaces, or runtime configuration are changed. */
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const Database = require('../workspace-server/node_modules/better-sqlite3');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
async function run() {
    const root = await fs.mkdtemp(
        path.join(os.tmpdir(), 'YU3DOH RUN015 QA 日本語 '),
    );
    const manifest = {
        workspace_id: 'run015-isolated-qa',
        workspace_format_version: 1,
        database_path: 'Data/workspace.db',
        created_at: new Date().toISOString(),
        name: 'RUN015 disposable QA',
    };
    await fs.writeFile(
        path.join(root, 'workspace.json'),
        JSON.stringify(manifest),
    );
    await fs.mkdir(path.join(root, 'Data'));
    new Database(path.join(root, manifest.database_path)).close();
    await fs.mkdir(path.join(root, 'Output'));
    await fs.writeFile(
        path.join(root, 'Output', 'render.txt'),
        'fixture output',
    );
    let mode = 'NONE',
        held = false,
        release;
    const service = await createWorkspaceService(
        {
            workspaceRoot: root,
            host: '127.0.0.1',
            port: 4312,
            automaticRecoveryPointRetention: 0,
        },
        {
            recoveryHooks: {
                atBoundary: async (boundary) => {
                    if (mode === 'FAIL_MIGRATION' && boundary === 'migration') {
                        await fs.writeFile(
                            path.join(root, manifest.database_path),
                            'QA-only unprovable database after failed migration',
                        );
                        throw new Error('QA-only migration failure');
                    }
                    if (
                        mode === 'WARN_RETENTION' &&
                        boundary === 'retention_cleanup'
                    )
                        throw new Error('QA-only retention failure');
                    if (
                        (mode === 'HOLD_BACKUP' &&
                            boundary === 'db_snapshot') ||
                        (mode === 'HOLD_RESTORE' && boundary === 'active_move')
                    ) {
                        held = true;
                        await new Promise((resolve) => {
                            release = resolve;
                        });
                        held = false;
                        mode = 'NONE';
                    }
                },
            },
        },
    );
    const old = await service.recovery.create('RECOVERY_POINT');
    await service.recovery.migrate();
    let card = service.canonical.createCard({
        family: 'SPELL',
        password: '15000001',
    });
    card = service.canonical.mutateCard(card.cardId, card.revision, {
        structure: { kind: 'SPELL', subtypeCode: 'NORMAL' },
        localizations: [
            {
                language: 'EN',
                name: 'QA Recovery Card',
                cardText: 'Persisted checkpoint text',
                pendulumText: null,
            },
        ],
        classification: { effectReviewed: true },
    });
    const ready = await service.recovery.create('RECOVERY_POINT');
    const protectedBackup = await service.recovery.create('RECOVERY_POINT');
    const metadataPath = path.join(
        root,
        'Backups',
        protectedBackup.backup_id,
        'backup.json',
    );
    await fs.writeFile(
        metadataPath,
        JSON.stringify({
            ...protectedBackup,
            origin: 'PRE_MIGRATION',
            protection_state: 'MIGRATION_PENDING',
            reason: 'QA protected pre-migration checkpoint',
        }),
    );
    const info = {
        root,
        workspace_id: manifest.workspace_id,
        card_id: card.cardId,
        old_backup_id: old.backup_id,
        ready_backup_id: ready.backup_id,
        protected_backup_id: protectedBackup.backup_id,
    };
    service.app.get('/api/v1/workspace/_qa/info', async () => ({
        ...info,
        held,
        mode,
    }));
    service.app.post('/api/v1/workspace/_qa/mode', async (request) => {
        mode = request.body.mode;
        return { mode };
    });
    service.app.post('/api/v1/workspace/_qa/release', async () => {
        release?.();
        return { released: true };
    });
    service.app.post('/api/v1/workspace/_qa/old', async () => {
        service.runtime.closePersistence();
        await fs.rm(path.join(root, 'Data'), {
            recursive: true,
            force: true,
            maxRetries: 5,
            retryDelay: 100,
        });
        await fs.mkdir(path.join(root, 'Data'));
        new Database(path.join(root, manifest.database_path)).close();
        return service.runtime.reload();
    });
    service.app.post('/api/v1/workspace/_qa/recovery', async () => {
        service.runtime.recoveryRequired(
            'QA-only recovery-required fixture; restore a valid checkpoint.',
        );
        return service.status;
    });
    service.app.post('/api/v1/workspace/_qa/change-persisted', async () => {
        const current = service.canonical.getCard(info.card_id);
        service.canonical.mutateCard(current.cardId, current.revision, {
            password: '15888888',
        });
        let extra = service.canonical.createCard({
            family: 'TRAP',
            password: '15000002',
        });
        extra = service.canonical.mutateCard(extra.cardId, extra.revision, {
            localizations: [
                {
                    language: 'EN',
                    name: 'QA Post Backup Card',
                    cardText: 'Must disappear after restore',
                    pendulumText: null,
                },
            ],
        });
        return { extra_card_id: extra.cardId };
    });
    service.app.post('/api/v1/workspace/_qa/retention-candidate', async () => {
        const backup = await service.recovery.create('RECOVERY_POINT');
        await fs.writeFile(
            path.join(root, 'Backups', backup.backup_id, 'backup.json'),
            JSON.stringify({
                ...backup,
                origin: 'PRE_MIGRATION',
                protection_state: 'NONE',
                reason: 'QA-only eligible retention candidate',
            }),
        );
        return { backup_id: backup.backup_id };
    });
    service.app.post('/api/v1/workspace/_qa/incompatible', async (request) => {
        const file = path.join(
            root,
            'Backups',
            request.body.backup_id,
            'backup.json',
        );
        const data = JSON.parse(await fs.readFile(file, 'utf8'));
        await fs.writeFile(
            file,
            JSON.stringify({ ...data, database_schema_version: 8 }),
        );
        return { altered: true };
    });
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    console.log(JSON.stringify({ ready: true, ...info }));
    for (const signal of ['SIGINT', 'SIGTERM'])
        process.once(signal, async () => {
            release?.();
            await service.close();
            await fs.rm(root, {
                recursive: true,
                force: true,
                maxRetries: 5,
                retryDelay: 100,
            });
            process.exit(0);
        });
}
run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
