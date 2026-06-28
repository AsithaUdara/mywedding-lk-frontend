"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Package,
  RefreshCw,
  ShieldAlert,
  Store,
  Users,
} from "lucide-react";
import {
  useAdminVendorDirectory,
  VENDOR_DIRECTORY_PAGE_SIZE,
} from "@/modules/admin/hooks/useAdminVendorDirectory";
import {
  summaryStatusCounts,
  type VendorDirectoryStatusTab,
} from "@/modules/admin/dashboard/adminVendorDirectoryHelpers";
import { AdminVendorCard } from "@/modules/admin/components/AdminVendorCard";
import { AdminPagination } from "@/modules/admin/components/AdminPagination";
import { VendorDirectoryToolbar } from "@/modules/admin/components/VendorDirectoryToolbar";
import { EmptyState, ErrorBanner, PageLoadingSkeleton } from "@/shared/components/ui";
import { clampPage } from "@/shared/lib/pagination";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export default function AdminVendorDirectoryPage() {
  const [statusTab, setStatusTab] = useState<VendorDirectoryStatusTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [statusTab, debouncedSearch]);

  const { vendors, pagination, summary, loading, refreshing, error, reload } =
    useAdminVendorDirectory({
      page,
      statusTab,
      search: debouncedSearch,
    });

  const statusCounts = summaryStatusCounts(summary);
  const currentPage = clampPage(page, Math.max(pagination.totalPages, 1));

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [page, currentPage]);

  if (loading && vendors.length === 0 && summary.total === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <GlassPageHeader
        title="All vendors"
        description="Browse every vendor account by verification status. Verified vendors with active services appear on the public marketplace."
        badge={
          <span className={cn(rf.badge, "inline-flex items-center gap-1.5")}>
            <Store size={12} aria-hidden />
            Vendor ops
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(rf.badge, "tabular-nums")}>{summary.total} total</span>
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
            {summary.pending > 0 && (
              <GlassButton href="/admin/vendors" variant="primary" className="gap-1.5">
                <ShieldAlert size={16} aria-hidden />
                {summary.pending} in KYB
              </GlassButton>
            )}
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStatCard
          label="Registered"
          value={summary.total}
          sub="All vendor accounts"
          icon={Users}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Verified"
          value={summary.verified}
          sub="KYB approved"
          icon={Store}
          iconTheme="success"
        />
        <GlassStatCard
          label="Live listings"
          value={summary.liveListings}
          sub="Verified with active services"
          icon={Package}
          iconTheme="accent"
        />
        <GlassStatCard
          label="Pending KYB"
          value={summary.pending}
          sub={summary.pending > 0 ? "Awaiting review" : "Queue clear"}
          icon={ShieldAlert}
          iconTheme={summary.pending > 0 ? "warning" : "success"}
        />
      </div>

      {summary.pending > 0 && (
        <div
          className={cn(
            "flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5",
            vg.subtitle
          )}
        >
          <p className="text-sm">
            <strong className="text-foreground">{summary.pending} vendor{summary.pending === 1 ? "" : "s"}</strong>{" "}
            still need KYB review before they can list on the marketplace.
          </p>
          <GlassButton href="/admin/vendors" variant="primary" className="gap-1.5 shrink-0">
            Open KYB queue
            <ArrowRight size={14} aria-hidden />
          </GlassButton>
        </div>
      )}

      <GlassSectionCard
        title="Vendor accounts"
        subtitle={`${summary.categories} categor${summary.categories === 1 ? "y" : "ies"} across the platform`}
      >
        <div className="space-y-5">
          <VendorDirectoryToolbar
            statusTab={statusTab}
            onStatusTabChange={setStatusTab}
            statusCounts={statusCounts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultCount={pagination.totalCount}
            totalInTab={statusCounts[statusTab]}
          />

          {vendors.length === 0 ? (
            <EmptyState
              title={debouncedSearch ? "No vendors match your search" : "No vendors in this view"}
              description={
                debouncedSearch
                  ? "Try a different keyword or clear the search."
                  : statusTab === "Pending" && summary.pending === 0
                    ? "No applications waiting — the KYB queue is clear."
                    : statusTab === "Verified"
                      ? "Approved vendors will appear here after KYB review."
                      : statusTab === "Rejected"
                        ? "Rejected vendors are blocked from the marketplace."
                        : "Vendor registrations will appear here once submitted."
              }
              action={
                statusTab === "Pending" && summary.pending > 0 ? (
                  <GlassButton href="/admin/vendors" variant="primary">
                    Open KYB queue
                  </GlassButton>
                ) : undefined
              }
            />
          ) : (
            <>
              <ul className="space-y-3" role="list">
                {vendors.map((vendor) => (
                  <li key={vendor.userId}>
                    <AdminVendorCard vendor={vendor} />
                  </li>
                ))}
              </ul>
              <AdminPagination
                page={currentPage}
                pageCount={Math.max(pagination.totalPages, 1)}
                pageSize={VENDOR_DIRECTORY_PAGE_SIZE}
                totalItems={pagination.totalCount}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </GlassSectionCard>

      {summary.rejected > 0 && statusTab === "All" && !debouncedSearch && (
        <p className={cn("text-sm", vg.subtitle)}>
          {summary.rejected} rejected account{summary.rejected === 1 ? "" : "s"} — filter by{" "}
          <button
            type="button"
            onClick={() => setStatusTab("Rejected")}
            className="font-medium text-primary hover:underline"
          >
            Rejected
          </button>{" "}
          to review.
        </p>
      )}
    </div>
  );
}
