"use client";

import { cn } from "@/shared/lib/cn";
import { RegalFrostShell } from "./RegalFrostShell";
import { rf } from "./tokens";

type GlassAuthLayoutProps = {
  children: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
};

/** Split auth page with optional maroon aside + porcelain mesh canvas */
export function GlassAuthLayout({ children, aside, className }: GlassAuthLayoutProps) {
  return (
    <RegalFrostShell mesh className={cn("flex min-h-screen flex-col lg:flex-row", className)}>
      {aside}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">{children}</main>
    </RegalFrostShell>
  );
}

export function GlassAuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(rf.panel, "w-full p-8 sm:p-10", className)}>{children}</div>;
}

export const glassAuthAsideClass =
  "relative hidden w-[min(100%,420px)] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 p-10 text-primary-foreground lg:flex";

export const glassAuthTitleClass = cn(rf.heroTitle, "text-2xl sm:text-3xl");
