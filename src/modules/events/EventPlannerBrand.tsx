"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { EventPlannerBranding } from "@/shared/lib/api/events";

interface EventPlannerBrandProps {
  branding: EventPlannerBranding;
  variant?: "hero" | "card" | "inline";
  className?: string;
}

export function EventPlannerBrand({
  branding,
  variant = "inline",
  className,
}: EventPlannerBrandProps) {
  const showLogo = Boolean(branding.agencyLogoUrl);

  if (variant === "hero") {
    return (
      <div className={cn("flex items-center gap-4 sm:gap-5", className)}>
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_4px_20px_hsl(345_100%_25%/0.08)]",
            showLogo ? "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" : "h-16 w-16 bg-primary/10"
          )}
        >
          {showLogo ? (
            <Image
              src={branding.agencyLogoUrl!}
              alt={`${branding.businessName} logo`}
              fill
              className="object-contain p-2.5 sm:p-3"
              sizes="(max-width: 640px) 64px, 72px"
              unoptimized
              priority
            />
          ) : (
            <Sparkles size={28} className="text-primary/70" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
            Planned by your studio
          </p>
          <p className="mt-1 truncate font-luxury-section text-lg font-medium leading-tight text-foreground sm:text-xl">
            {branding.businessName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {branding.isWhiteLabeled
              ? "Your dedicated wedding planning partner"
              : `Led by ${branding.displayName}`}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border border-border/60 bg-gradient-to-r from-primary/[0.04] to-transparent px-4 py-3.5",
          className
        )}
      >
        <div
          className={cn(
            "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/70 bg-white shadow-sm",
            !showLogo && "bg-primary/10"
          )}
        >
          {showLogo ? (
            <Image
              src={branding.agencyLogoUrl!}
              alt={`${branding.businessName} logo`}
              fill
              className="object-contain p-2"
              sizes="56px"
              unoptimized
            />
          ) : (
            <Sparkles size={22} className="text-primary/70" aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            From your planner
          </p>
          <p className="truncate text-base font-semibold text-foreground">{branding.businessName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showLogo ? (
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm">
          <Image
            src={branding.agencyLogoUrl!}
            alt={`${branding.businessName} logo`}
            fill
            className="object-contain p-1.5"
            sizes="44px"
            unoptimized
          />
        </div>
      ) : null}
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Planned by
        </p>
        <p className="truncate text-sm font-semibold text-foreground">{branding.businessName}</p>
      </div>
    </div>
  );
}
