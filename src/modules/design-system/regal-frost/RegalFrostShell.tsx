"use client";

import { cn } from "@/shared/lib/cn";
import { glassFontVariables } from "./fonts";

type RegalFrostShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Show ambient mesh gradient orbs (workspace-style pages) */
  mesh?: boolean;
  /** Marketing / public-site shell styling */
  marketing?: boolean;
};

/** Root wrapper for Regal Frost porcelain canvas + glass typography */
export function RegalFrostShell({
  children,
  className,
  mesh = false,
  marketing = false,
}: RegalFrostShellProps) {
  return (
    <div
      className={cn(
        "regal-frost-shell font-glass-body text-foreground",
        mesh && "vgo-flex-shell relative flex min-h-screen w-full flex-col",
        marketing && "marketing-page",
        glassFontVariables,
        className
      )}
    >
      {mesh && (
        <>
          <div className="vgo-mesh-orb vgo-mesh-orb--gold" aria-hidden />
          <div className="vgo-mesh-orb vgo-mesh-orb--maroon" aria-hidden />
          <div className="vgo-mesh-orb vgo-mesh-orb--slate" aria-hidden />
        </>
      )}
      {children}
    </div>
  );
}
