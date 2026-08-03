import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Receipt,
  Tags,
  FileText,
  Settings,
} from "lucide-react";

export type NavItemConfig = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Primary bottom tabs; everything else opens from "Más". */
  mobile: "tab" | "more";
  /** Opens in a new browser tab (e.g. GitHub). */
  external?: boolean;
};

export const NAV_ITEMS: NavItemConfig[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard, mobile: "tab" },
  { href: "/expenses", label: "Gastos", icon: Receipt, mobile: "tab" },
  { href: "/reports", label: "Reportes", icon: FileText, mobile: "tab" },
  { href: "/tags", label: "Tags", icon: Tags, mobile: "more" },
  { href: "/settings", label: "Ajustes", icon: Settings, mobile: "more" },
];
