"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatedIcon, type AnimatedIconHandle, type AnimatedIconName } from "@/components/ui/animated-icon";

const ITEMS: { href: string; label: string; icon: AnimatedIconName }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/records", label: "Records", icon: "records" },
  { href: "/records/new", label: "Add", icon: "add" },
  { href: "/import", label: "Import", icon: "import" },
  { href: "/settings", label: "More", icon: "settings" },
];

function MobileItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: AnimatedIconName;
  active: boolean;
}) {
  const iconRef = useRef<AnimatedIconHandle>(null);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      onTouchStart={() => iconRef.current?.startAnimation()}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
        active ? "text-accent" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
          active && "bg-accent/10"
        )}
      >
        <AnimatedIcon ref={iconRef} name={icon} size={20} />
      </span>
      {label}
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {ITEMS.map((item) => {
        const active =
          pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return <MobileItem key={item.href} {...item} active={active} />;
      })}
    </nav>
  );
}
