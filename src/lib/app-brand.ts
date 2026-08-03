/** User-facing product name (titles, PWA, copy). Not storage/path IDs. */
export const APP_DISPLAY_NAME = "Moon Records Expenses" as const;

/** Shorter label for home screen / cramped UI (PWA `short_name`). */
export const APP_SHORT_NAME = "Moon Records" as const;

/**
 * Slug for filenames, Dexie, localStorage, Cache Storage, and custom events.
 * Keep distinct from Finanzzz on the same `github.io` origin.
 */
export const APP_FILE_SLUG = "moon-records-expenses" as const;

export const APP_THEME_STORAGE_KEY = `${APP_FILE_SLUG}-theme` as const;
export const APP_THEME_AUTO_DARK_AT_KEY =
  `${APP_FILE_SLUG}-theme-auto-dark-at` as const;
export const APP_HOME_DASHBOARD_LAYOUT_STORAGE_KEY =
  `${APP_FILE_SLUG}-home-dashboard-layout` as const;
export const APP_SHARE_STASH_CACHE = `${APP_FILE_SLUG}-share-stash` as const;
export const APP_STANDALONE_INFO_DISMISSED_KEY =
  `${APP_FILE_SLUG}:standalone-info-dismissed` as const;
export const APP_STANDALONE_INFO_DISMISSED_EVENT =
  `${APP_FILE_SLUG}:standalone-info-dismissed` as const;
/** Backup download extension (with leading dot). */
export const APP_BACKUP_EXTENSION = `.${APP_FILE_SLUG}` as const;
