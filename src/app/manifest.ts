import type { MetadataRoute } from "next";
import { APP_DISPLAY_NAME, APP_SHORT_NAME } from "@/lib/app-brand";
import { appBasePath } from "@/lib/app-base-path";
import { HOME_QUICK_ACTION_PATHS } from "@/lib/home-quick-action-paths";

export const dynamic = "force-static";

/**
 * Orden: PNG del atajo → fallback al icono general de la app.
 */
const SHORTCUT_ICONS = (name: string) => {
  const prefix = appBasePath;
  return [
    {
      src: `${prefix}/icons/shortcut-${name}.png`,
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: `${prefix}/icons/icon-192.png`,
      sizes: "192x192",
      type: "image/png",
    },
  ];
};

export default function manifest(): MetadataRoute.Manifest {
  const prefix = appBasePath;

  return {
    name: APP_DISPLAY_NAME,
    short_name: APP_SHORT_NAME,
    description: "Control de gastos personales",
    start_url: `${prefix}/`,
    scope: `${prefix}/`,
    /**
     * Chrome (p. ej. macOS): sin esto, `auto` suele abrir un cliente nuevo al usar
     * accesos del manifiesto. `navigate-existing` reutiliza la ventana y navega.
     * @see https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/launch_handler
     */
    launch_handler: {
      client_mode: ["navigate-existing", "auto"],
    },
    display: "standalone",
    background_color: "#0F180F",
    theme_color: "#0F180F",
    orientation: "portrait-primary",
    icons: [
      {
        src: `${prefix}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${prefix}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Nuevo gasto",
        description: "Registra un nuevo gasto",
        url: `${prefix}${HOME_QUICK_ACTION_PATHS.new_expense}`,
        icons: SHORTCUT_ICONS("expense"),
      },
      {
        name: "Generar reporte",
        description: "Genera un reporte de tus gastos",
        url: `${prefix}${HOME_QUICK_ACTION_PATHS.report}`,
        icons: SHORTCUT_ICONS("reports"),
      },
      {
        name: "Ajustes",
        description: "Configura tu aplicación",
        url: `${prefix}/settings`,
        icons: SHORTCUT_ICONS("settings"),
      },
    ],
    share_target: {
      action: `${prefix}/share-sync-ingest`,
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [
          {
            name: "files",
            accept: ["image/*"],
          },
        ],
      },
    },
  };
}
