/* Disposable RC evidence only. No user Workspace and no provider traffic. */
const fs = require('node:fs/promises'),
    path = require('node:path'),
    os = require('node:os');
const { randomUUID } = require('node:crypto'),
    { execFileSync } = require('node:child_process');
const {
    bootstrapWorkspaceDatabase,
} = require('../workspace-server/dist/src/persistence/operations');
const {
    createWorkspaceService,
} = require('../workspace-server/dist/src/service');
async function run() {
    const root = await fs.mkdtemp(
        path.join(os.tmpdir(), 'YU3DOH RC UI 日本語 '),
    );
    const manifest = {
        workspace_id: randomUUID(),
        workspace_format_version: 1,
        database_path: 'Data/workspace.db',
        created_at: new Date().toISOString(),
    };
    await fs.writeFile(
        path.join(root, 'workspace.json'),
        JSON.stringify(manifest),
    );
    bootstrapWorkspaceDatabase(root, manifest);
    let provider_requests = 0;
    const service = await createWorkspaceService(
        { workspaceRoot: root, host: '127.0.0.1', port: 4312 },
        {
            externalSourceAdapterOptions: {
                fetch: async () => {
                    provider_requests++;
                    throw Error('RC provider access forbidden');
                },
            },
        },
    );
    const cards = {};
    for (const key of [
        'MAIN',
        'XYZ',
        'LINK',
        'Pendulum',
        'SPELL',
        'TRAP',
        'TOKEN',
        'Unknown',
        'Historical',
    ]) {
        const family = ['SPELL', 'TRAP', 'TOKEN'].includes(key)
            ? key
            : 'MONSTER';
        let c = service.canonical.createCard({
            family,
            password: family === 'TOKEN' ? null : '12345678',
        });
        let structure =
            family === 'MONSTER'
                ? {
                      kind: 'MONSTER',
                      summonKind:
                          key === 'XYZ'
                              ? 'XYZ'
                              : key === 'LINK'
                                ? 'LINK'
                                : key === 'Unknown'
                                  ? null
                                  : 'MAIN_DECK',
                      attributeCode: 'LIGHT',
                      raceCode: 'DRAGON',
                      level: null,
                      rank: null,
                      atk: 1000,
                      def: key === 'LINK' ? null : 1000,
                      pendulumScale: key === 'Pendulum' ? 0 : null,
                      abilities:
                          key === 'Pendulum'
                              ? ['EFFECT', 'PENDULUM']
                              : ['EFFECT'],
                      linkMarkers:
                          key === 'LINK'
                              ? ['1', '2', '3', '4', '6', '7', '8', '9']
                              : [],
                  }
                : family === 'TOKEN'
                  ? {
                        kind: 'TOKEN',
                        attributeCode: null,
                        raceCode: null,
                        level: null,
                        atk: null,
                        def: null,
                    }
                  : { kind: family, subtypeCode: null };
        c = service.canonical.mutateCard(c.cardId, c.revision, {
            structure,
            localizations: [
                {
                    language: 'EN',
                    name: 'RC ' + key,
                    cardText: null,
                    pendulumText:
                        key === 'Pendulum'
                            ? 'Persisted Pendulum text'
                            : key === 'Historical'
                              ? ''
                              : null,
                },
            ],
        });
        cards[key] = c.cardId;
        if (key === 'Historical')
            service.persistence.runRepositoryOperation((db) =>
                db
                    .prepare(
                        'UPDATE canonical_monster_structure SET rank=0, pendulum_scale=0 WHERE card_id=?',
                    )
                    .run(c.cardId),
            );
    }
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], {
        encoding: 'utf8',
    }).trim();
    service.app.get('/api/v1/workspace/_qa/info', async () => ({
        sha,
        cards,
        provider_requests,
    }));
    service.app.get('/api/v1/workspace/_qa/domain', async () => ({
        sha,
        provider_requests,
        tables: service.persistence.runRepositoryOperation((db) =>
            Object.fromEntries(
                db
                    .prepare(
                        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
                    )
                    .all()
                    .map(({ name }) => [
                        name,
                        db.prepare('SELECT * FROM "' + name + '"').all(),
                    ]),
            ),
        ),
    }));
    await service.app.listen({ host: '127.0.0.1', port: 4312 });
    console.log(
        JSON.stringify({
            ready: true,
            fixture: 'RC canonical null zero',
            sha,
            cards,
        }),
    );
    let stopping = false;
    for (const signal of ['SIGTERM', 'SIGINT'])
        process.once(signal, async () => {
            if (stopping) return;
            stopping = true;
            await service.close();
            await fs.rm(root, { recursive: true, force: true });
            process.exit(0);
        });
}
run().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
