"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { HeaderBar } from "./header-bar";

/** Main app layout: fixed sidebar + sticky header + scrollable content + mobile nav. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderBar />
        <main
          key={pathname}
          className="page-enter mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10"
        >
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
