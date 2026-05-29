"use client";

/**
 * Planner workspace UI — re-exports shared primitives + planner-specific composites.
 * Import from here in planner pages for stable paths; implementation lives in shared.
 */
export {
  formatLKR,
  PageHeader,
  LoadingState,
  ErrorBanner,
  SuccessBanner,
  EmptyState,
  SectionCard,
  ProgressBar,
  QuickActionLink,
  inputClass,
  Badge,
  Button,
  Card,
} from "@/shared/components/ui";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getStatusBadgeClass } from "@/shared/components/ui";

/** Planner KPI tile — supports legacy `color` gradient icon box API */
export function StatCard({
  label,
  value,
  sub,
  icon,
  color,
  trend,
  index = 0,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.2 }}
      className="rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-xl p-3 text-white ${color}`}>{icon}</div>
        {trend && (
          <span className="rounded-full bg-accent/15 px-2 py-1 text-[11px] font-bold text-accent-foreground">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </motion.div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${getStatusBadgeClass(status)}`}
    >
      {status}
    </span>
  );
}

export function BudgetBarChart({
  data,
}: {
  data: { label: string; spent: number; total: number }[];
}) {
  const max = Math.max(...data.map((d) => Math.max(d.spent, d.total, 1)), 1);
  return (
    <div className="flex h-28 items-end gap-2">
      {data.map((d, i) => {
        const height = Math.max(8, Math.round((Math.max(d.spent, d.total) / max) * 100));
        const over = d.spent > d.total && d.total > 0;
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <motion.div
              className={`w-full rounded-t-md ${over ? "bg-destructive/70" : "bg-primary/70"}`}
              style={{ height: `${height}%` }}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            />
            <span className="w-full truncate text-center text-[9px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function EventHubCard({
  eventName,
  clientEmail,
  meta,
  href,
  actionLabel,
  badges,
  children,
}: {
  eventName: string;
  clientEmail?: string;
  meta?: string;
  href: string;
  actionLabel: string;
  badges?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const initial = (eventName || "?").charAt(0).toUpperCase();
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-3xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{eventName}</p>
            {clientEmail && <p className="text-sm text-muted-foreground">{clientEmail}</p>}
            {meta && <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>}
          </div>
        </div>
        <Link
          href={href}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {actionLabel}
        </Link>
      </div>
      {badges && <div className="mt-4 flex flex-wrap gap-2">{badges}</div>}
      {children}
    </motion.article>
  );
}
