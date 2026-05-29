"use client";

import React from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Lighter ivory shell for couple event workspace — sub-nav + content, not full B2B chrome.
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
    <div className={cn("min-h-screen bg-background font-roboto text-foreground", className)}>
      {header && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">{header}</div>
      )}
      <div className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 md:pb-10 lg:px-8">
        {subNav && (
          <div className="mb-6 border-b border-border pb-0">{subNav}</div>
        )}
        {children}
      </div>
    </div>
  );
}
