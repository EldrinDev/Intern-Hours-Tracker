import type { AnimatedIconName } from "@/components/ui/animated-icon";

export interface NavItem {
  href: string;
  label: string;
  icon: AnimatedIconName;
  group: "main" | "config" | "meta";
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", group: "main" },
  { href: "/records", label: "Records", icon: "records", group: "main" },
  { href: "/records/new", label: "Add Record", icon: "add", group: "main" },
  { href: "/import", label: "Import", icon: "import", group: "main" },
  { href: "/export", label: "Export", icon: "export", group: "main" },
  { href: "/dtr", label: "DTR", icon: "dtr", group: "main" },
  { href: "/settings#company", label: "Company", icon: "company", group: "config" },
  { href: "/settings", label: "Settings", icon: "settings", group: "config" },
  { href: "/settings#data", label: "Data Backup", icon: "export", group: "config" },
  { href: "/about", label: "About", icon: "about", group: "meta" },
];
