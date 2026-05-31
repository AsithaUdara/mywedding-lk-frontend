"use client";

import React from "react";
import { cn } from "@/shared/lib/cn";
import { glassFontVariables } from "@/modules/design-system/regal-frost/fonts";
import { eventWorkspace } from "@/modules/events/event-workspace";

/**
 * Couple event workspace — porcelain canvas with Regal Frost typography.
 */
export function ClientEventShell({
  children,
  subNav,
  header,
  className,
}: {
  children: React.ReactNode;
  subNav?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "regal-frost-shell min-h-screen bg-background font-glass-body text-foreground",
        glassFontVariables,
        className
      )}
    >
      {header ? (
        <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className={eventWorkspace.headerStack}>{header}</div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 md:pb-10 lg:px-8">
        {subNav}
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
