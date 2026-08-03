import type { Metadata } from "next";
import { APP_DISPLAY_NAME } from "@/lib/app-brand";
import { appBasePath } from "@/lib/app-base-path";

/**
 * Public site origin for absolute URLs (Open Graph, etc.).
 * Set in production so social previews resolve images correctly, e.g.
 * `NEXT_PUBLIC_SITE_URL=https://youruser.github.io` when hosted under `/MoonRecordsExpenses`.
 */
const siteOrigin = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** Base URL for this Next app (includes `/MoonRecordsExpenses` in production). */
export const metadataBase = new URL(
  `${siteOrigin}${appBasePath === "" ? "" : appBasePath}`.replace(/\/$/, "") +
    "/"
);

export const defaultSiteDescription =
  "Gestiona tus finanzas personales fácilmente desde tu dispositivo y genera reportes detallados sin necesidad de conexión a Internet.";

const ogImagePath = `${appBasePath}/icons/icon-512.png`.replace(/\/{2,}/g, "/");

/** Absolute OG image URL (social crawlers need a full URL). */
const ogImageUrl = new URL(ogImagePath.replace(/^\//, ""), `${siteOrigin}/`)
  .href;

const ogImage = {
  url: ogImageUrl,
  width: 512,
  height: 512,
  alt: APP_DISPLAY_NAME,
} as const;

export const sharedOpenGraph: NonNullable<Metadata["openGraph"]> = {
  type: "website",
  locale: "es_ES",
  siteName: APP_DISPLAY_NAME,
  images: [ogImage],
};

export const sharedTwitter: NonNullable<Metadata["twitter"]> = {
  card: "summary_large_image",
  images: [ogImage.url],
};

/** Must match `title.template` in root `layout.tsx`. */
export const siteTitleTemplate = `${APP_DISPLAY_NAME} | %s` as const;

/**
 * Título de la raíz (`/`) y previews sociales de inicio. No usa la plantilla: las rutas
 * hijas siguen con `${APP_DISPLAY_NAME} | <sección>`.
 */
export const homeDocumentTitle = `${APP_DISPLAY_NAME} | Inicio`;

/** Absolute URL for a route path (e.g. `/expenses`, `/`). */
export function absolutePageUrl(pathname: string): string {
  const segment =
    pathname === "/" ? "" : pathname.replace(/^\//, "").replace(/\/$/, "");
  return new URL(segment || ".", metadataBase).href;
}

/** Canonical + `hreflang="es"` (sitio solo en español). */
export function canonicalAlternates(pathname: string): Metadata["alternates"] {
  const canonical = absolutePageUrl(pathname);
  return {
    canonical,
    languages: {
      es: canonical,
    },
  };
}

export function sectionMetadata(
  segmentTitle: string,
  description: string,
  pathname: string
): Pick<
  Metadata,
  "title" | "description" | "alternates" | "openGraph" | "twitter"
> {
  const pageTitle = siteTitleTemplate.replace("%s", segmentTitle);
  const canonical = absolutePageUrl(pathname);
  return {
    title: segmentTitle,
    description,
    alternates: {
      canonical,
      languages: {
        es: canonical,
      },
    },
    openGraph: {
      ...sharedOpenGraph,
      title: pageTitle,
      description,
      url: canonical,
      locale: "es_ES",
    },
    twitter: {
      ...sharedTwitter,
      title: pageTitle,
      description,
    },
  };
}
