"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, RefreshCw, TrendingUp, Wallet } from "lucide-react";
import {
  usePayoutQueue,
  PAYOUT_QUEUE_PAGE_SIZE,
} from "@/modules/admin/hooks/usePayoutQueue";
import { PayoutDueCard } from "@/modules/admin/components/PayoutDueCard";
import { PayoutQueueToolbar } from "@/modules/admin/components/PayoutQueueToolbar";
import { AdminPagination } from "@/modules/admin/components/AdminPagination";
import { EmptyState, ErrorBanner, PageLoadingSkeleton } from "@/shared/components/ui";
import { formatLKR } from "@/shared/lib/format";
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

export default function AdminCommissionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const {
    payouts,
    pagination,
    summary,
    loading,
    refreshing,
    error,
    settlingId,
    toast,
    reload,
    markSettled,
    syncPage,
  } = usePayoutQueue({ page, search: debouncedSearch });

  const currentPage = clampPage(page, Math.max(pagination.totalPages, 1));

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [page, currentPage]);

  if (loading && payouts.length === 0 && summary.count === 0) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <GlassPageHeader
        title="Payouts"
        description="Unsettled vendor transfers from confirmed bookings. Sync payment status, then mark settled after the bank transfer completes."
        badge={
          <span className={cn(rf.badge, "inline-flex items-center gap-1.5 text-accent")}>
            <Wallet size={12} aria-hidden />
            Financials
          </span>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(rf.badge, "tabular-nums")}>
              {summary.count} unsettled
            </span>
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

      {toast && (
        <div
          role="status"
          className={cn(
            rf.panel,
            "flex max-w-xl items-start gap-3 border-success/30 bg-success/10 px-4 py-3 text-success"
          )}
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />
          <p className="text-sm font-medium">{toast}</p>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStatCard
          label="Unsettled"
          value={summary.count}
          sub={summary.count > 0 ? "Awaiting transfer" : "Queue clear"}
          icon={Wallet}
          iconTheme={summary.count > 0 ? "warning" : "success"}
        />
        <GlassStatCard
          label="Gross volume"
          value={formatLKR(summary.totalGross)}
          sub="Unsettled booking value"
          icon={TrendingUp}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Vendor net due"
          value={formatLKR(summary.totalVendorNet)}
          sub="Owed to vendors"
          icon={ClipboardList}
          iconTheme="accent"
        />
        <GlassStatCard
          label="Platform commission"
          value={formatLKR(summary.totalCommission)}
          sub="Retained from gross"
          icon={Wallet}
          iconTheme="warning"
        />
      </div>

      {summary.count === 0 ? (
        <GlassSectionCard title="Queue status" subtitle="Nothing waiting for payout">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border border-white/55 bg-white/35 px-4 py-4",
              vg.subtitle
            )}
          >
            <CheckCircle2 size={20} className="shrink-0 text-success" aria-hidden />
            <div>
              <p className="font-medium text-foreground">All payouts settled</p>
              <p className="mt-0.5 text-sm">
                New commission splits will appear here after client deposits are confirmed.
              </p>
            </div>
          </div>
        </GlassSectionCard>
      ) : (
        <GlassSectionCard
          title="Unsettled payouts"
          subtitle="Mark settled only after vendor bank transfer is complete"
        >
          <div className="space-y-5">
            <PayoutQueueToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalCount={pagination.totalCount}
            />

            {payouts.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No payouts match your search"
                description="Try a different booking or event reference."
              />
            ) : (
              <>
                <ul className="space-y-3" role="list">
                  {payouts.map((item) => {
                    const isSettling = settlingId === item.id;
                    return (
                      <li key={item.id}>
                        <PayoutDueCard
                          item={item}
                          isSettling={isSettling}
                          isDisabled={settlingId !== null && !isSettling}
                          onMarkSettled={() => void markSettled(item)}
                          onPaymentSynced={() => void syncPage()}
                        />
                      </li>
                    );
                  })}
                </ul>
                <AdminPagination
                  page={currentPage}
                  pageCount={Math.max(pagination.totalPages, 1)}
                  pageSize={PAYOUT_QUEUE_PAGE_SIZE}
                  totalItems={pagination.totalCount}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </GlassSectionCard>
      )}
    </div>
  );
}
