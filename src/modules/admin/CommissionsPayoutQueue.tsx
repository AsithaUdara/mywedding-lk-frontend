"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPayoutDue,
  markPayoutSettled,
  type PayoutDueItem,
} from "@/shared/lib/api/admin";
import {
  Button,
  DataTable,
  type DataTableColumn,
  EmptyState,
  ErrorBanner,
  formatLKR,
  PageLoadingSkeleton,
  SectionCard,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

function shortId(value: string): string {
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}…`;
}

export function CommissionsPayoutQueue() {
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

  const columns: DataTableColumn<PayoutDueItem>[] = [
    {
      key: "bookingId",
      header: "Booking ID",
      render: (row) => (
        <span className="font-mono text-xs text-foreground" title={row.bookingId}>
          {shortId(row.bookingId)}
        </span>
      ),
    },
    {
      key: "grossAmount",
      header: "Gross amount",
      className: "text-right",
      render: (row) => (
        <span className="tabular-nums font-semibold text-foreground">{formatLKR(row.grossAmount)}</span>
      ),
    },
    {
      key: "vendorNetAmount",
      header: "Vendor net",
      className: "text-right",
      render: (row) => (
        <span className="tabular-nums text-foreground">{formatLKR(row.vendorNetAmount)}</span>
      ),
    },
    {
      key: "commissionAmount",
      header: "Commission",
      className: "text-right",
      render: (row) => (
        <span className="tabular-nums font-semibold text-primary">{formatLKR(row.commissionAmount)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={settlingId === row.id}
          onClick={() => void handleMarkSettled(row)}
          className="gap-1.5"
        >
          {settlingId === row.id ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : (
            <CheckCircle2 size={14} aria-hidden />
          )}
          {settlingId === row.id ? "Saving…" : "Mark settled"}
        </Button>
      ),
    },
  ];

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="relative space-y-4">
      {toast && (
        <div
          role="status"
          className={cn(
            "fixed right-4 top-20 z-[100] flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md",
            "border-emerald-200 bg-emerald-50/95 text-emerald-900"
          )}
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />
          <p className="text-sm font-medium">{toast}</p>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      <SectionCard
        title="Unsettled vendor payouts"
        subtitle="Commission splits awaiting manual payout to vendors after client deposits"
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No payouts due"
            description="All commission settlements have been marked as paid to vendors."
          />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            emptyTitle="No payouts due"
            className="border-0 shadow-none"
          />
        )}
      </SectionCard>
    </div>
  );
}
