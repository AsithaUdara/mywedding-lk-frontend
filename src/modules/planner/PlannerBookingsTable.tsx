"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerBookings, type PlannerBookingListItem } from "@/shared/lib/api/planner";
import { SyncPaymentStatusButton } from "@/modules/payments/SyncPaymentStatusButton";
import { ErrorBanner, StatusBadge, formatLKR } from "@/modules/planner/components/ui";
import { EmptyState, PageLoadingSkeleton } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export function PlannerBookingsTable() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PlannerBookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerBookings(token);
      setRows(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message === "Planner subscription expired.") return;
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && rows.length === 0) {
    return <PageLoadingSkeleton />;
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No vendor bookings yet"
        description="Bookings from your managed weddings will appear here with payment sync controls."
        className="border-0 bg-transparent shadow-none"
      />
    );
  }

  return (
    <ul className="space-y-3" role="list">
      {rows.map((row) => (
        <li key={row.bookingId}>
          <article
            className={cn(
              "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm sm:p-5",
              "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={cn("font-medium", vg.body)}>{row.eventName}</p>
                    <p className={cn("mt-0.5", vg.subtitle)}>{row.vendorName}</p>
                  </div>
                  <StatusBadge status={row.bookingStatus} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className={vg.caption}>
                    Service: <span className="text-foreground">{row.serviceName}</span>
                  </span>
                  <span className={vg.caption}>
                    Payment: <span className="text-foreground">{row.paymentStatus}</span>
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatLKR(row.finalAmount)}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <SyncPaymentStatusButton
                  bookingId={row.bookingId}
                  onSynced={load}
                  className="border-white/55 bg-white/40 backdrop-blur-sm hover:border-primary/30"
                />
                <GlassButton href={`/events/${row.eventId}`} variant="ghost" className="gap-1">
                  Open
                </GlassButton>
              </div>
            </div>
            {row.createdAt && (
              <p className={cn("mt-3 border-t border-white/40 pt-3", vg.caption)}>
                Requested{" "}
                {new Date(row.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
