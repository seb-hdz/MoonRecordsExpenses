import type { Tag, GlobalConfig, Source } from "./types";
import { HOME_QUICK_ACTION_CONFIG_NONE } from "./home-quick-action-paths";
import { DEFAULT_UI_ZOOM_PERCENT } from "./ui-zoom";

export const PREDEFINED_TAGS: Omit<Tag, "id">[] = [
  { name: "Transporte", color: "#4A81E2", isPredefined: true },
  { name: "Almacen", color: "#8DC63F", isPredefined: true },
  { name: "Otros", color: "#737373", isPredefined: true },
  { name: "Rectificacion", color: "#E15252", isPredefined: true },
];

/** Seeded when the sources table is empty (fresh install / reset). */
export const DEFAULT_SOURCES: Omit<Source, "id" | "createdAt">[] = [
  {
    name: "Gastos en Efectivo",
    type: "bank_account",
    minLimit: -1,
    maxLimit: -1,
    color: "#429D51",
    icon: "bank_account",
  },
  {
    name: "Gastos en Crédito",
    type: "credit_card",
    minLimit: -1,
    maxLimit: -1,
    color: "#5DE073",
    icon: "credit_card",
  },
];

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  id: "global",
  totalMaxLimit: -1,
  limitInterval: "monthly",
  warningThreshold: 0.7,
  dangerThreshold: 0.9,
  sharedStaleHours: 168,
  homeQuickActionEnabled: true,
  homeQuickActionId: HOME_QUICK_ACTION_CONFIG_NONE,
  uiZoomPercent: DEFAULT_UI_ZOOM_PERCENT,
};

export const CURRENCY = "PEN";
export const CURRENCY_SYMBOL = "S/.";
