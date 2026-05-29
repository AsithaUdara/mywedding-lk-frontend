"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CheckSquare, Wallet, Users, Palette, Store } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface EventNavigationProps {
  eventId: string;
}

const EventNavigation = ({ eventId }: EventNavigationProps) => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: `/events/${eventId}`, icon: LayoutGrid, exact: true },
    { name: "My Tasks", href: `/events/${eventId}/checklist`, icon: CheckSquare, exact: false },
    { name: "Budget", href: `/events/${eventId}/budget`, icon: Wallet, exact: false },
    { name: "Vendors", href: `/events/${eventId}/vendors`, icon: Store, exact: false },
    { name: "Team", href: `/events/${eventId}/team`, icon: Users, exact: false },
    { name: "Design Board", href: `/events/${eventId}/style`, icon: Palette, exact: false },
  ];

  const linkClass = (isActive: boolean) =>
    cn(
      "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <>
      <div className="mb-6 hidden overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-sm no-scrollbar md:block">
        <div className="flex min-w-max items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link key={item.name} href={item.href} className={linkClass(isActive)}>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} aria-hidden />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-card/95 px-2 py-3 pb-safe shadow-[0_-8px_30px_rgba(128,0,32,0.06)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex min-w-[56px] flex-col items-center gap-1 transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl p-1.5 transition-all",
                    isActive && "scale-110 bg-primary/10"
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} aria-hidden />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tighter">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default EventNavigation;
