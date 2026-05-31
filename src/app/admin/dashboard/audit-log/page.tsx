"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { EventAuditLogLookup } from "@/modules/admin/EventAuditLogLookup";
import { GlassPageHeader } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

type AuditSearchStats = {
  eventId: string;
  count: number;
};

export default function AdminAuditLogPage() {
  const [stats, setStats] = useState<AuditSearchStats | null>(null);

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <GlassPageHeader
        title="Event audit log"
        description="Look up immutable activity records for any wedding event by its GUID. Entries cannot be edited or deleted."
        badge={
          <span className={cn(rf.badge, "inline-flex items-center gap-1.5 text-accent")}>
            <ScrollText size={12} aria-hidden />
            Compliance
          </span>
        }
        action={
          stats ? (
            <span className={cn(rf.badge, "tabular-nums")}>
              {stats.count} record{stats.count === 1 ? "" : "s"}
            </span>
          ) : undefined
        }
      />

      <EventAuditLogLookup onSearchResult={setStats} />
    </div>
  );
}
