/* Disposable CR-0001.2 fixtures. Never opens a user Workspace. */
const fs = require("node:fs/promises"),
  path = require("node:path"),
  os = require("node:os");
const { randomUUID } = require("node:crypto");
const { execFileSync } = require("node:child_process");
const {
  bootstrapWorkspaceDatabase,
} = require("../workspace-server/dist/src/persistence/operations");
const {
  createWorkspaceService,
} = require("../workspace-server/dist/src/service");
const {
  publishPackage,
} = require("../workspace-server/dist/src/external-sources/repository");
const {
  STRUCTURE_FIELDS,
} = require("../workspace-server/dist/src/external-sources/normalizer");
async function run() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "YU3DOH CR-0001-2 "));
  const manifest = {
    workspace_id: randomUUID(),
    workspace_format_version: 1,
    database_path: "Data/workspace.db",
    created_at: new Date().toISOString(),
  };
  await fs.writeFile(
    path.join(root, "workspace.json"),
    JSON.stringify(manifest),
  );
  bootstrapWorkspaceDatabase(root, manifest);
  let provider_requests = 0;
  const service = await createWorkspaceService(
    { workspaceRoot: root, host: "127.0.0.1", port: 4312 },
    {
      externalSourceAdapterOptions: {
        fetch: async () => {
          provider_requests++;
          throw Error("Provider access forbidden in CR-0001.2 evidence");
        },
      },
    },
  );
  const cards = {};
  for (const key of ["MAIN", "XYZ", "TOKEN", "Historical", "External"]) {
    const family = key === "TOKEN" ? "TOKEN" : "MONSTER";
    let card = service.canonical.createCard({
      family,
      password: family === "TOKEN" ? null : "12345678",
    });
    const structure =
      family === "TOKEN"
        ? {
            kind: family,
            attributeCode: "LIGHT",
            raceCode: "DRAGON",
            level: 0,
            atk: 0,
            def: 0,
          }
        : {
            kind: family,
            summonKind: key === "XYZ" ? "XYZ" : "MAIN_DECK",
            attributeCode: "LIGHT",
            raceCode: "DRAGON",
            level: key === "XYZ" ? null : 0,
            rank: key === "XYZ" ? 0 : null,
            atk: 0,
            def: 0,
            pendulumScale: null,
            abilities: ["EFFECT"],
            linkMarkers: [],
          };
    card = service.canonical.mutateCard(card.cardId, card.revision, {
      structure,
      localizations: [
        {
          language: "EN",
          name: key,
          cardText: "CR-0001.2 evidence",
          pendulumText: null,
        },
      ],
    });
    cards[key] = card.cardId;
    if (key === "Historical")
      service.persistence.runRepositoryOperation((db) =>
        db
          .prepare(
            "UPDATE canonical_monster_structure SET level=18 WHERE card_id=?",
          )
          .run(card.cardId),
      );
  }
  const candidates = {};
  for (const value of [18, 12]) {
    const candidate_id = randomUUID(),
      retrieval_id = randomUUID(),
      document_id = randomUUID(),
      source_record_id = randomUUID(),
      timestamp = new Date().toISOString();
    const fields = Object.fromEntries(
      STRUCTURE_FIELDS.map((field) => [
        field,
        {
          state: "ABSENT",
          evidence: { document_id, locale: "EN", source_path: "$." + field },
        },
      ]),
    );
    for (const [field, v] of Object.entries({
      family: "MONSTER",
      summon_kind: "MAIN_DECK",
      attribute_code: "LIGHT",
      race_code: "DRAGON",
      level: value,
      atk: 0,
      def: 0,
      abilities: ["EFFECT"],
    }))
      fields[field] = {
        state: "PRESENT",
        value: v,
        evidence: { document_id, locale: "EN", source_path: "$." + field },
      };
    const candidate = {
      candidate_schema_version: 1,
      authoritative: false,
      identity: {
        source_code: "YGORESOURCES_CARD_DB",
        external_record_key: "13036",
      },
      blocks: {
        STRUCTURE: { fields },
        "TEXT:EN": { fields: {} },
        "TEXT:ES": { fields: {} },
        "TEXT:JP": { fields: {} },
      },
    };
    const retrieval = {
      retrieval_id,
      source_record_id,
      source_code: "YGORESOURCES_CARD_DB",
      external_record_key: "13036",
      target_card_id: cards.External,
      target_expected_revision: service.canonical.getCard(cards.External)
        .revision,
      adapter_version: 1,
      status: "SUCCESS",
      error_code: null,
      error_message: null,
      retrieved_at: timestamp,
    };
    service.persistence.transaction((db) =>
      publishPackage(
        db,
        source_record_id,
        retrieval,
        {
          document_id,
          document_kind: "CARD_JSON",
          source_ref: "cr-0001-2-fixture",
          status: "SUCCESS",
          http_status: 200,
          content_type: "application/json",
          payload_hash: "0".repeat(64),
          raw_payload: JSON.stringify({ level: value }),
          source_cache_revision: null,
          error_code: null,
          error_message: null,
        },
        {
          candidate_id,
          retrieval_id,
          candidate_schema_version: 1,
          normalizer_version: 2,
          candidate,
          diagnostics: [],
          created_at: timestamp,
        },
      ),
    );
    candidates[value] = candidate_id;
  }
  const sha = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  service.app.get("/api/v1/workspace/_qa/info", async () => ({
    sha,
    cards,
    candidates,
    provider_requests,
  }));
  await service.app.listen({ host: "127.0.0.1", port: 4312 });
  console.log(JSON.stringify({ ready: true, sha, cards }));
  for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, async () => {
      await service.close();
      await fs.rm(root, { recursive: true, force: true });
      process.exit(0);
    });
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
