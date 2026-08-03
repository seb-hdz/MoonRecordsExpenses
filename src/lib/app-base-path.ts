/**
 * Production GitHub Pages path for
 * https://github.com/seb-hdz/MoonRecordsExpenses
 * → https://seb-hdz.github.io/MoonRecordsExpenses/
 */
export const APP_BASE_PATH_PRODUCTION = "/MoonRecordsExpenses";

/** Matches `basePath` in `next.config.ts` (dev: "", prod: see above). */
export const appBasePath =
  process.env.NODE_ENV === "production" ? APP_BASE_PATH_PRODUCTION : "";
