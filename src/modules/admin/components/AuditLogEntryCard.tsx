"use client";

import { User } from "lucide-react";
import type { AuditLogItem } from "@/shared/lib/api/admin";
import {
  auditEntryRef,
  formatAuditTimestamp,
} from "@/modules/admin/dashboard/adminAuditHelpers";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const glassRow =
  "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 sm:p-5";

export function AuditLogEntryCard({ entry }: { entry: AuditLogItem }) {
  return (
    <article className={glassRow}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <div className="shrink-0 lg:w-44">
          <p className={rf.label}>When (UTC)</p>
          <time dateTime={entry.timestampUtc} className={cn("mt-0.5 block text-sm", vg.subtitle)}>
            {formatAuditTimestamp(entry.timestampUtc)}
          </time>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(rf.badge, "normal-case tracking-normal text-foreground")}>
              {entry.actionType}
            </span>
            <span className={cn("font-mono text-xs", vg.caption)} title={entry.id}>
              {auditEntryRef(entry.id)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{entry.content}</p>
          {entry.metadataJson ? (
            <pre className="overflow-x-auto rounded-lg border border-white/40 bg-white/30 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur-sm">
              {entry.metadataJson}
            </pre>
          ) : null}
        </div>

        <div className="shrink-0 lg:w-44">
          <p className={rf.label}>Actor</p>
          <div className="mt-1 flex items-start gap-2">
            <User size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-medium text-foreground">{entry.actorDisplayName}</p>
              <p className={cn("font-mono text-xs", vg.caption)} title={entry.actorId}>
                {entry.actorId.slice(0, 8)}…
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
