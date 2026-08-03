import type { Metadata } from "next";
import { APP_DISPLAY_NAME } from "@/lib/app-brand";
import { sectionMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = sectionMetadata(
  "Ajustes",
  `Configura la apariencia, límites, y otras opciones de ${APP_DISPLAY_NAME}.`,
  "/settings"
);

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
