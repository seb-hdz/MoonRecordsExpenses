import Dexie, { type EntityTable } from "dexie";
import type {
  Source,
  Expense,
  Tag,
  GlobalConfig,
  SharedSourceSync,
} from "./types";
import {
  PREDEFINED_TAGS,
  DEFAULT_GLOBAL_CONFIG,
  DEFAULT_SOURCES,
} from "./constants";
import {
  HOME_QUICK_ACTION_CONFIG_NONE,
  resolveHomeQuickActionConfigId,
} from "./home-quick-action-paths";
import { normalizeUiZoomPercent } from "./ui-zoom";
import { clearHomeDashboardLayoutStorage } from "./home-dashboard-layout";
import { v4 as uuid } from "uuid";

export const db = new Dexie("moon-records-expenses") as Dexie & {
  sources: EntityTable<Source, "id">;
  expenses: EntityTable<Expense, "id">;
  tags: EntityTable<Tag, "id">;
  config: EntityTable<GlobalConfig, "id">;
  sharedSync: EntityTable<SharedSourceSync, "sourceId">;
};

db.version(1).stores({
  sources: "id, name, type, createdAt",
  expenses: "id, sourceId, date, amount, createdAt, *tagIds",
  tags: "id, name, isPredefined",
  config: "id",
});

db.version(2)
  .stores({
    sources: "id, name, type, createdAt, sharedPublicId",
    expenses: "id, sourceId, date, amount, createdAt, *tagIds",
    tags: "id, name, isPredefined",
    config: "id",
    sharedSync: "sourceId",
  })
  .upgrade(async (tx) => {
    const table = tx.table("config");
    const row = await table.get("global");
    if (row && row.sharedStaleHours === undefined) {
      await table.update("global", {
        sharedStaleHours: DEFAULT_GLOBAL_CONFIG.sharedStaleHours,
      });
    }
  });

export function createDefaultSharedSyncState(
  sourceId: string
): SharedSourceSync {
  return {
    sourceId,
    emissions: [],
    updates: [],
    lastReceivedRemoteAt: null,
    outboundPassword: null,
    outboundPasswordLocked: false,
    storedInboundPassword: null,
    peerSavedPassword: false,
    emittedExpenseIds: [],
  };
}

async function insertDefaultTagsAndConfig(
  tagsTable: typeof db.tags,
  configTable: typeof db.config
) {
  const tags = PREDEFINED_TAGS.map((t) => ({ ...t, id: uuid() }));
  await tagsTable.bulkAdd(tags);
  await configTable.add(DEFAULT_GLOBAL_CONFIG);
}

async function insertDefaultSources(sourcesTable: typeof db.sources) {
  const now = Date.now();
  const sources = DEFAULT_SOURCES.map((s) => ({
    ...s,
    id: uuid(),
    createdAt: now,
  }));
  await sourcesTable.bulkAdd(sources);
}

/** Borra cuentas, gastos, etiquetas, ajustes y estado de sync; deja la app como recién instalada. */
export async function resetLocalDatabase() {
  await db.transaction(
    "rw",
    [db.sources, db.expenses, db.tags, db.config, db.sharedSync],
    async (tx) => {
      await tx.table("sources").clear();
      await tx.table("expenses").clear();
      await tx.table("tags").clear();
      await tx.table("config").clear();
      await tx.table("sharedSync").clear();
      await insertDefaultTagsAndConfig(tx.table("tags"), tx.table("config"));
      await insertDefaultSources(tx.table("sources"));
    }
  );
  clearHomeDashboardLayoutStorage();
}

export async function seedDatabase() {
  const tagCount = await db.tags.count();
  if (tagCount === 0) {
    await insertDefaultTagsAndConfig(db.tags, db.config);
  }

  const sourceCount = await db.sources.count();
  if (sourceCount === 0) {
    await insertDefaultSources(db.sources);
  }

  const configExists = await db.config.get("global");
  if (!configExists) {
    await db.config.add(DEFAULT_GLOBAL_CONFIG);
  } else if (configExists.sharedStaleHours === undefined) {
    await db.config.update("global", {
      sharedStaleHours: DEFAULT_GLOBAL_CONFIG.sharedStaleHours,
    });
  }
  if (configExists?.homeQuickActionId === undefined) {
    await db.config.update("global", {
      homeQuickActionId: HOME_QUICK_ACTION_CONFIG_NONE,
    });
  } else {
    const resolved = resolveHomeQuickActionConfigId(
      configExists.homeQuickActionId
    );
    if (configExists.homeQuickActionId !== resolved) {
      await db.config.update("global", { homeQuickActionId: resolved });
    }
  }
  if (configExists?.homeQuickActionEnabled === undefined) {
    await db.config.update("global", {
      homeQuickActionEnabled: DEFAULT_GLOBAL_CONFIG.homeQuickActionEnabled,
    });
  }
  const configRow = await db.config.get("global");
  if (configRow) {
    const normalized = normalizeUiZoomPercent(configRow.uiZoomPercent);
    if (configRow.uiZoomPercent !== normalized) {
      await db.config.update("global", { uiZoomPercent: normalized });
    }
  }
}
