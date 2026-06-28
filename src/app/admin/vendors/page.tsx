"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, RefreshCw, ShieldAlert, Tags } from "lucide-react";
import { useKybQueue } from "@/modules/admin/hooks/useKybQueue";
import {
  filterKybVendors,
  kybQueueStats,
} from "@/modules/admin/dashboard/adminKybHelpers";
import { KybVendorCard } from "@/modules/admin/components/KybVendorCard";
import { VendorKybToolbar } from "@/modules/admin/components/VendorKybToolbar";
import { EmptyState, ErrorBanner, PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export default function AdminVendorsPage() {
  const { vendors, loading, refreshing, error, actionState, reload, approve, reject } =
    useKybQueue();
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => kybQueueStats(vendors), [vendors]);
  const filteredVendors = useMemo(
    () => filterKybVendors(vendors, searchQuery),
    [vendors, searchQuery]
  );

  if (loading && vendors.length === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <GlassPageHeader
        title="KYB queue"
        description="Review vendor applications before they appear on the marketplace. Approve complete profiles or reject applications that fail trust & safety checks."
        badge={
          <span className={cn(rf.badge, "inline-flex items-center gap-1.5 text-accent")}>
            <ShieldAlert size={12} aria-hidden />
            Trust & safety
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {stats.pending > 0 && (
              <span className={cn(rf.badge, "tabular-nums")}>{stats.pending} pending</span>
            )}
            <GlassButton
              type="button"
              variant="ghost"
              disabled={refreshing}
              onClick={() => void reload()}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} aria-hidden />
              Refresh
            </GlassButton>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      {stats.pending === 0 ? (
        <GlassSectionCard title="Queue status" subtitle="Nothing waiting for admin review">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border border-white/55 bg-white/35 px-4 py-4",
              vg.subtitle
            )}
          >
            <CheckCircle2 size={20} className="shrink-0 text-success" aria-hidden />
            <div>
              <p className="font-medium text-foreground">KYB queue is clear</p>
              <p className="mt-0.5 text-sm">
                New vendor signups will land here. Browse{" "}
                <Link href="/admin/vendors/directory" className="font-medium text-primary hover:underline">
                  all vendors
                </Link>{" "}
                to see verified and rejected accounts.
              </p>
            </div>
          </div>
        </GlassSectionCard>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <GlassStatCard
              label="Pending"
              value={stats.pending}
              sub="Applications in queue"
              icon={ShieldAlert}
              iconTheme="warning"
            />
            <GlassStatCard
              label="Ready to review"
              value={stats.readyToReview}
              sub="Complete profiles"
              icon={CheckCircle2}
              iconTheme="success"
            />
            <GlassStatCard
              label="Needs info"
              value={stats.incomplete}
              sub="Missing description, category, or contact"
              icon={ClipboardList}
              iconTheme={stats.incomplete > 0 ? "warning" : "success"}
            />
            <GlassStatCard
              label="Categories"
              value={stats.categories}
              sub="Represented in queue"
              icon={Tags}
              iconTheme="primary"
            />
          </div>

          <GlassSectionCard
            title="Pending applications"
            subtitle="Approve to list on the marketplace · reject to block directory access"
          >
            <div className="space-y-5">
              <VendorKybToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                resultCount={filteredVendors.length}
                totalCount={vendors.length}
              />

              {filteredVendors.length === 0 ? (
                <EmptyState
                  title="No vendors match your search"
                  description="Try a different keyword or clear the search."
                />
              ) : (
                <ul className="space-y-3" role="list">
                  {filteredVendors.map((vendor) => {
                    const isActing = actionState?.id === vendor.userId;
                    const isApproving = isActing && actionState?.type === "approve";
                    const isRejecting = isActing && actionState?.type === "reject";

                    return (
                      <li key={vendor.userId}>
                        <KybVendorCard
                          vendor={vendor}
                          isApproving={isApproving}
                          isRejecting={isRejecting}
                          isActing={isActing}
                          onApprove={() => void approve(vendor.userId)}
                          onReject={() => void reject(vendor.userId, vendor.businessName)}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </GlassSectionCard>
        </>
      )}
    </div>
  );
}
