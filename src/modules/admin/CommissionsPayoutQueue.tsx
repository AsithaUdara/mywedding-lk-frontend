"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPayoutDue,
  markPayoutSettled,
  type PayoutDueItem,
} from "@/shared/lib/api/admin";
import { SyncPaymentStatusButton } from "@/modules/payments/SyncPaymentStatusButton";
import { PrimaryButton } from "@/modules/admin/dashboard/components";
import { EmptyState, ErrorBanner, formatLKR } from "@/shared/components/ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

function shortId(value: string): string {
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}…`;
}

function formatPayoutDate(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export type CommissionsQueueStats = {
  count: number;
  totalCommission: number;
  totalVendorNet: number;
};

type CommissionsPayoutQueueProps = {
  onQueueStats?: (stats: CommissionsQueueStats) => void;
};

const glassRow =
  "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 sm:p-5";

export function CommissionsPayoutQueue({ onQueueStats }: CommissionsPayoutQueueProps) {
  const { user } = useAuth();
  const [rows, setRows] = useState<PayoutDueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPayoutDue(token);
      setRows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payout queue.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    onQueueStats?.({
      count: rows.length,
      totalCommission: rows.reduce((sum, row) => sum + row.commissionAmount, 0),
      totalVendorNet: rows.reduce((sum, row) => sum + row.vendorNetAmount, 0),
    });
  }, [rows, onQueueStats]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleMarkSettled = async (item: PayoutDueItem) => {
    if (!user) return;
    setSettlingId(item.id);
    try {
      const token = await user.getIdToken();
      await markPayoutSettled(token, item.id);
      setRows((prev) => prev.filter((r) => r.id !== item.id));
      setToast(`Payout marked settled for booking ${shortId(item.bookingId)}.`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark payout as settled.");
    } finally {
      setSettlingId(null);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center gap-2 py-12", vg.subtitle)}>
        <Loader2 size={16} className="animate-spin" aria-hidden />
        Loading payout queue…
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {toast && (
        <div
          role="status"
          className={cn(
            rf.panel,
            "fixed right-4 top-20 z-[100] flex max-w-sm items-start gap-3 border-success/30 bg-success/10 px-4 py-3 text-success shadow-lg"
          )}
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />
          <p className="text-sm font-medium">{toast}</p>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {rows.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payouts due"
          description="All commission settlements have been marked as paid to vendors."
        />
      ) : (
        <ul className="space-y-3" role="list">
          {rows.map((row) => {
            const isSettling = settlingId === row.id;
            const createdLabel = formatPayoutDate(row.createdAt);

            return (
              <li key={row.id}>
                <article className={glassRow}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div>
                          <p className={rf.label}>Booking</p>
                          <p
                            className="mt-0.5 font-mono text-sm font-semibold text-foreground"
                            title={row.bookingId}
                          >
                            {shortId(row.bookingId)}
                          </p>
                        </div>
                        {createdLabel && (
                          <span className={cn("inline-flex items-center gap-1.5 text-sm", vg.subtitle)}>
                            <Calendar size={14} aria-hidden />
                            {createdLabel}
                          </span>
                        )}
                      </div>

                      <dl className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <dt className={rf.label}>Gross amount</dt>
                          <dd className="mt-0.5 tabular-nums font-semibold text-foreground">
                            {formatLKR(row.grossAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className={rf.label}>Vendor net</dt>
                          <dd className="mt-0.5 tabular-nums text-foreground">
                            {formatLKR(row.vendorNetAmount)}
                          </dd>
                        </div>
                        <div>
                          <dt className={rf.label}>Commission</dt>
                          <dd className="mt-0.5 tabular-nums font-semibold text-primary">
                            {formatLKR(row.commissionAmount)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 lg:pt-1">
                      <SyncPaymentStatusButton
                        bookingId={row.bookingId}
                        onSynced={load}
                        variant="glass"
                      />
                      <PrimaryButton
                        onClick={() => void handleMarkSettled(row)}
                        loading={isSettling}
                        disabled={settlingId !== null && !isSettling}
                      >
                        {isSettling ? "Saving…" : "Mark settled"}
                      </PrimaryButton>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
