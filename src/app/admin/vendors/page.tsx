"use client";

import { useState } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { VendorApprovalQueue } from "@/modules/admin/VendorApprovalQueue";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

export default function AdminVendorsPage() {
  const [pendingCount, setPendingCount] = useState<number | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <GlassPageHeader
        title="Vendor KYB queue"
        description="Approve vendors after reviewing business credentials, portfolio, and contact details. Rejected applications stay off the marketplace."
        badge={
          <span className={cn(rf.badge, "inline-flex items-center gap-1.5 text-accent")}>
            <ShieldAlert size={12} aria-hidden />
            Trust & safety
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {pendingCount !== undefined && (
              <span className={cn(rf.badge, "tabular-nums")}>
                {pendingCount} pending
              </span>
            )}
            <GlassButton
              type="button"
              variant="ghost"
              className="gap-1.5"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              <RefreshCw size={16} aria-hidden />
              Refresh
            </GlassButton>
          </div>
        }
      />

      <GlassSectionCard
        title="Pending applications"
        subtitle="Review each vendor before they appear in the public directory"
      >
        <VendorApprovalQueue key={refreshKey} onPendingCount={setPendingCount} />
      </GlassSectionCard>
    </div>
  );
}
