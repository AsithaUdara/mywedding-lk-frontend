"use client";

import React, { isValidElement } from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { rf } from "@/modules/design-system/regal-frost/tokens";

export type WinRateSummaryLike = {
  won: number;
  pending: number;
  lost: number;
};

function isRenderableIcon(icon: LucideIcon | React.ReactNode): icon is LucideIcon {
  if (icon == null || isValidElement(icon)) return false;
  return typeof icon === "function" || (typeof icon === "object" && "render" in icon);
}

const ICON_THEMES = {
  primary: rf.iconPrimary,
  accent: rf.iconAccent,
  success: rf.iconSuccess,
  warning: "bg-warning/10 text-warning ring-1 ring-warning/15",
  muted: "bg-white/50 text-muted-foreground ring-1 ring-white/60",
} as const;

export function GlassPageHeader({
  title,
  description,
  badge,
  action,
  className,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn(rf.panel, "px-5 py-5 sm:px-6 sm:py-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {typeof badge === "string" ? <span className={rf.badge}>{badge}</span> : badge}
          </div>
          <h1 className={cn(rf.heroTitle, "font-glass-body")}>{title}</h1>
          {description && <p className={cn("mt-1.5 max-w-xl", rf.subtitle)}>{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}

export function GlassSectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(rf.panel, "flex flex-col", className)}>
      <div className={cn("flex items-start justify-between gap-3", rf.panelHeader)}>
        <div className="min-w-0">
          <h2 className={cn(rf.sectionTitle, "font-glass-body")}>{title}</h2>
          {subtitle && <p className={cn("mt-0.5", rf.caption)}>{subtitle}</p>}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn(rf.panelBody, "flex min-h-0 flex-1 flex-col")}>{children}</div>
    </section>
  );
}

export function GlassQuickActionLink({
  href,
  label,
  description,
  icon,
}: {
  href: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link href={href} className={rf.quickLink}>
      {icon && <div className={rf.quickLinkIcon}>{icon}</div>}
      <div className="min-w-0">
        <p className={rf.linkLabel}>{label}</p>
        {description && <p className={cn("mt-0.5", rf.caption)}>{description}</p>}
      </div>
    </Link>
  );
}

export function GlassStatCard({
  label,
  value,
  sub,
  icon,
  iconTheme = "primary",
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon | React.ReactNode;
  iconTheme?: keyof typeof ICON_THEMES;
  index?: number;
  className?: string;
}) {
  const iconNode = !icon ? null : isRenderableIcon(icon) ? (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", ICON_THEMES[iconTheme])}>
      {React.createElement(icon, { size: 18, strokeWidth: 2, "aria-hidden": true })}
    </div>
  ) : (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", ICON_THEMES[iconTheme])}>
      {icon}
    </div>
  );

  return (
    <div className={cn(rf.statCard, className)}>
      {iconNode}
      <div className="min-w-0">
        <p className={rf.label}>{label}</p>
        <p className={cn("mt-0.5", rf.statValue)}>{value}</p>
        {sub && <p className={cn("mt-0.5", rf.caption)}>{sub}</p>}
      </div>
    </div>
  );
}

export function GlassButton({
  href,
  children,
  variant = "ghost",
  className,
  onClick,
  type = "button",
  disabled,
  title,
  target,
  rel,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "ghost" | "primary";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  title?: string;
  target?: string;
  rel?: string;
}) {
  const classes = cn(variant === "primary" ? rf.btnPrimary : rf.btnGhost, className);

  if (href) {
    return (
      <Link href={href} className={classes} title={title} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

export function GlassChartCard({
  label,
  sublabel,
  children,
  className,
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(rf.chartCard, className)}>
      <p className={rf.chartTitle}>{label}</p>
      {sublabel && <p className={cn("mt-0.5", rf.caption)}>{sublabel}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

const WIN_PIPELINE_SEGMENTS = [
  { key: "won" as const, label: "Won", barClass: "bg-primary", dotClass: "bg-primary" },
  { key: "pending" as const, label: "Pending", barClass: "vgo-bar-accent", dotClass: "bg-[hsl(var(--vgo-gold))]" },
  { key: "lost" as const, label: "Lost", barClass: "bg-muted-foreground/35", dotClass: "bg-muted-foreground/50" },
];

export function GlassWinRatePipeline({
  winRate,
  winPct,
  winTotal,
}: {
  winRate: WinRateSummaryLike;
  winPct: number;
  winTotal: number;
}) {
  const segments = WIN_PIPELINE_SEGMENTS.map((seg) => {
    const value = winRate[seg.key];
    const pct = winTotal > 0 ? Math.round((value / winTotal) * 100) : 0;
    return { ...seg, value, pct };
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={rf.label}>Lead conversion</p>
          <p className={cn(rf.statValue, "text-3xl sm:text-4xl")}>{winPct}%</p>
          <p className={cn(rf.caption, "mt-1")}>
            {winTotal === 0
              ? "No leads in your pipeline yet"
              : `${winRate.won} of ${winTotal} inquiries confirmed as bookings`}
          </p>
        </div>
        {winRate.pending > 0 && (
          <p className={cn(rf.caption, "max-w-xs rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-primary")}>
            {winRate.pending} still in progress — reply in your inbox to convert them.
          </p>
        )}
      </div>

      {winTotal > 0 ? (
        <>
          <div
            className="flex h-3 overflow-hidden rounded-full bg-white/40 ring-1 ring-white/55"
            role="img"
            aria-label={`Pipeline: ${winRate.won} won, ${winRate.pending} pending, ${winRate.lost} lost`}
          >
            {segments
              .filter((seg) => seg.value > 0)
              .map((seg) => (
                <div
                  key={seg.key}
                  className={cn(seg.barClass, "min-w-[4px] transition-all duration-500")}
                  style={{ width: `${seg.pct}%` }}
                  title={`${seg.label}: ${seg.value}`}
                />
              ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {segments.map((seg) => (
              <div key={seg.key} className={cn(rf.glassSubtle, "rounded-xl px-4 py-3.5")}>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", seg.dotClass)} aria-hidden />
                  <span className={rf.label}>{seg.label}</span>
                </div>
                <p className={cn(rf.statValue, "mt-1.5 text-xl")}>{seg.value}</p>
                <p className={rf.caption}>{seg.pct}% of pipeline</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className={rf.subtitle}>When planners and clients reach out, your conversion breakdown appears here.</p>
      )}
    </div>
  );
}
