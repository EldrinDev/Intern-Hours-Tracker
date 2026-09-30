"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "./nav-items";
import { SidebarProgress } from "./sidebar-progress";
import { AnimatedIcon, type AnimatedIconHandle } from "@/components/ui/animated-icon";

function isActive(pathname: string, href: string): boolean {
  const base = href.split("#")[0];
  if (base === "/dashboard") return pathname === "/dashboard";
  if (base === "/records") return pathname === "/records";
  if (base === "/settings") return pathname === "/settings";
  return pathname === base || pathname.startsWith(base + "/");
}

const GROUP_LABELS: Record<"main" | "config" | "meta", string | null> = {
  main: null,
  config: "Configuration",
  meta: null,
};

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  const iconRef = useRef<AnimatedIconHandle>(null);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-accent/10 text-accent"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
      )}
      <AnimatedIcon ref={iconRef} name={item.icon} size={18} className="shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const renderGroup = (group: "main" | "config" | "meta") => {
    const label = GROUP_LABELS[group];
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <div className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {label}
          </div>
        )}
        {NAV_ITEMS.filter((i) => i.group === group).map((item) => (
          <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </div>
    );
  };

  return (
    <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <Link
        href="/dashboard"
        className="group flex h-16 items-center gap-2 border-b border-border px-5 transition-colors hover:bg-muted/40"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <AnimatedIcon name="clock" size={20} autoPlay autoPlayInterval={3000} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">OJT Tracker</div>
          <div className="text-[11px] text-muted-foreground">Hours &amp; DTR</div>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {renderGroup("main")}
        {renderGroup("config")}
        <div className="my-2 border-t border-border" />
        {renderGroup("meta")}
      </nav>

      <div className="border-t border-border p-3">
        <SidebarProgress />
      </div>
    </aside>
  );
}
