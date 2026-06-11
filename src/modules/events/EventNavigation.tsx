"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CheckSquare, Wallet, Users, Palette, Store } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useEventVendorPendingActions } from "@/shared/hooks/useEventVendorPendingActions";

interface EventNavigationProps {
  eventId: string;
}

const EventNavigation = ({ eventId }: EventNavigationProps) => {
  const pathname = usePathname();
  const { totalPending } = useEventVendorPendingActions(eventId);

  const navItems = [
    { name: "Home", href: `/events/${eventId}`, icon: LayoutGrid, exact: true },
    { name: "My Tasks", href: `/events/${eventId}/checklist`, icon: CheckSquare, exact: false },
    { name: "Budget", href: `/events/${eventId}/budget`, icon: Wallet, exact: false },
    { name: "Vendors", href: `/events/${eventId}/vendors`, icon: Store, exact: false },
    { name: "Team", href: `/events/${eventId}/team`, icon: Users, exact: false },
    { name: "Design Board", href: `/events/${eventId}/style`, icon: Palette, exact: false },
  ];

  const isActive = (item: (typeof navItems)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      <nav
        aria-label="Event sections"
        className="mb-8 hidden overflow-x-auto border-b border-border/70 no-scrollbar md:block"
      >
        <div className="flex min-w-max items-end gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} strokeWidth={active ? 2.25 : 2} aria-hidden />
                <span>{item.name}</span>
                {item.name === "Vendors" && totalPending > 0 ? (
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold tabular-nums leading-none text-primary-foreground">
                    {totalPending}
                  </span>
                ) : null}
                {active ? (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav
        aria-label="Event sections"
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border/70 bg-background/95 px-1 py-2 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex min-w-[52px] flex-col items-center gap-1 rounded-lg px-1 py-1 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "rounded-lg p-1.5 transition-colors",
                    active && "bg-primary/10"
                  )}
                >
                  <Icon size={18} strokeWidth={active ? 2.25 : 2} aria-hidden />
                </span>
                <span className="relative max-w-[56px] truncate text-[10px] font-semibold">
                  {item.name}
                  {item.name === "Vendors" && totalPending > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold tabular-nums leading-none text-primary-foreground">
                      {totalPending}
                    </span>
                  ) : null}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default EventNavigation;
