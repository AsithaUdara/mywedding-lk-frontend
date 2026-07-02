"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { AdminAttentionItem } from "@/modules/admin/dashboard/adminDashboardHelpers";
import { GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

function AttentionRow({ item }: { item: AdminAttentionItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
          item.priority === "high"
            ? "border-primary/25 bg-primary/5 hover:border-primary/40 hover:bg-primary/10"
            : "border-white/55 bg-white/40 hover:border-primary/25 hover:bg-white/55"
        )}
      >
        <div className="min-w-0">
          <p className={cn("font-medium", vg.body)}>{item.title}</p>
          <p className={cn("mt-0.5", vg.caption)}>{item.description}</p>
        </div>
        <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}

export function AdminAttentionPanel({ items }: { items: AdminAttentionItem[] }) {
  return (
    <GlassSectionCard
      title="Needs attention"
      subtitle="Operational queues that need admin action"
    >
      {items.length === 0 ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border border-white/55 bg-white/35 px-4 py-4",
            vg.subtitle
          )}
        >
          <CheckCircle2 size={20} className="shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-medium text-foreground">All clear</p>
            <p className="mt-0.5 text-sm">No pending KYB reviews or unsettled payouts.</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          {items.map((item) => (
            <AttentionRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </GlassSectionCard>
  );
}
