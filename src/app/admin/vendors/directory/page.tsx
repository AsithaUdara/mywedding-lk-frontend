"use client";

import { useState } from "react";
import { RefreshCw, Store } from "lucide-react";
import { AdminVendorDirectory } from "@/modules/admin/AdminVendorDirectory";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

export default function AdminVendorDirectoryPage() {
  const [vendorCount, setVendorCount] = useState<number | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <GlassPageHeader
        title="Vendor directory"
        description="View every registered vendor across pending, verified, and rejected states. Approved vendors appear on the public marketplace once they publish active services."
        badge={
          <span className={cn(rf.badge, "inline-flex items-center gap-1.5")}>
            <Store size={12} aria-hidden />
            Vendor ops
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {vendorCount !== undefined && (
              <span className={cn(rf.badge, "tabular-nums")}>
                {vendorCount} shown
              </span>
            )}
            <GlassButton href="/admin/vendors" variant="ghost">
              KYB queue
            </GlassButton>
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
        title="All vendors"
        subtitle="Filter by verification status, search by business or owner, and open storefronts for live listings"
      >
        <AdminVendorDirectory key={refreshKey} onVendorCount={setVendorCount} />
      </GlassSectionCard>
    </div>
  );
}
