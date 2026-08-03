import { appBasePath } from "@/lib/app-base-path";

/** Matches `basePath` in next.config (GitHub Pages). */
export function getBasePath(): string {
  return appBasePath;
}

export function getSyncSharedPath(): string {
  return `${getBasePath()}/sync-shared`;
}
