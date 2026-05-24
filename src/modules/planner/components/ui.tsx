"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";

export function formatLKR(amount: number) {
  if (amount >= 1_000_000) return `LKR ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `LKR ${(amount / 1_000).toFixed(0)}K`;
  return `LKR ${amount.toLocaleString()}`;
}

export function PageHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-charcoal">{title}</h1>
        {description && <p className="mt-1 text-slate-500">{description}</p>}
      </div>
      {badge && (
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
          {badge}
        </span>
      )}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <Loader2 className="mr-3 animate-spin" size={24} />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
      <AlertCircle size={18} className="flex-shrink-0" />
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
      {message}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <p className="font-semibold text-charcoal">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={`rounded-xl p-3 text-white ${color}`}>{icon}</div>
        {trend && (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600">
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-charcoal">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </motion.div>
  );
}

export function ProgressBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-charcoal">
          {count}{" "}
          <span className="font-normal text-slate-400">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
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
              className={`w-full rounded-t-md ${over ? "bg-red-400" : "bg-primary/70"}`}
              style={{ height: `${height}%` }}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
            <span className="w-full truncate text-center text-[9px] text-slate-400">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-800",
    OnHold: "bg-amber-100 text-amber-800",
    Completed: "bg-slate-100 text-slate-700",
    Archived: "bg-slate-50 text-slate-500",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-charcoal">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function QuickActionLink({
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
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 transition-all hover:border-primary/20 hover:bg-primary/5"
    >
      {icon && (
        <div className="rounded-lg bg-white p-2 text-primary shadow-sm group-hover:shadow-md">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-charcoal group-hover:text-primary">{label}</p>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
    </Link>
  );
}

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10";

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
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/30 text-lg font-bold text-primary">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-charcoal">{eventName}</p>
            {clientEmail && <p className="text-sm text-slate-500">{clientEmail}</p>}
            {meta && <p className="mt-0.5 text-xs text-slate-400">{meta}</p>}
          </div>
        </div>
        <Link
          href={href}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-primary/25 transition hover:bg-primary/90"
        >
          {actionLabel}
        </Link>
      </div>
      {badges && <div className="mt-4 flex flex-wrap gap-2">{badges}</div>}
      {children}
    </motion.article>
  );
}
