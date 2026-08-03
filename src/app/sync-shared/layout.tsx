import type { Metadata } from "next";
import { sectionMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = {
  ...sectionMetadata(
    "Inicio",
    "Redirección: la sincronización de cuentas compartidas no está disponible.",
    "/sync-shared"
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default function SyncSharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
