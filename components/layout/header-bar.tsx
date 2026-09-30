"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { AnimatedIcon, type AnimatedIconHandle } from "@/components/ui/animated-icon";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/records": "Records",
  "/records/new": "Add Record",
  "/import": "Import",
  "/export": "Export",
  "/dtr": "Daily Time Record",
  "/settings": "Settings",
  "/about": "About",
};

function titleFor(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/records/")) return "Record";
  return "OJT Tracker";
}

export function HeaderBar() {
  const pathname = usePathname();
  const title = titleFor(pathname);
  const showAdd = pathname !== "/records/new";
  const addRef = useRef<AnimatedIconHandle>(null);

  return (
    <header className="app-header no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      {/* Mobile brand */}
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <AnimatedIcon name="clock" size={20} autoPlay autoPlayInterval={3000} />
        </div>
        <span className="text-sm font-semibold">OJT Tracker</span>
      </Link>

      {/* Desktop page title */}
      <div className="hidden md:block">
        <span className="text-sm font-semibold text-muted-foreground">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        {showAdd && (
          <Link
            href="/records/new"
            className="hidden sm:block"
            onMouseEnter={() => addRef.current?.startAnimation()}
            onMouseLeave={() => addRef.current?.stopAnimation()}
          >
            <Button size="sm">
              <AnimatedIcon ref={addRef} name="add" size={16} /> New Record
            </Button>
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
