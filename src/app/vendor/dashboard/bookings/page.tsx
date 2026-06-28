"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { VendorBookingItem } from "@/shared/lib/api/vendors";
import { useVendorBookingsQuery } from "@/shared/hooks/query/useVendorQueries";
import { updateBookingStatus } from "@/shared/lib/api/bookings";
import { acceptVendorBooking, declineVendorBooking } from "@/shared/lib/api/vendorShortlist";
import { dispatchVendorBookingsUpdated, VENDOR_BOOKINGS_UPDATED } from "@/shared/lib/vendorBookingEvents";
import { VendorBookingContractUpload } from "@/modules/vendor/dashboard/VendorBookingContractUpload";
import { SearchField } from "@/modules/vendor/dashboard/components";
import {
  Badge,
  EmptyState,
  ErrorBanner,
  formatLKR,
  PageLoadingSkeleton,
} from "@/modules/vendor/dashboard/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";

type BookingFilter = "all" | "Requested" | "AwaitingPayment" | "Confirmed" | "Completed";

const BOOKING_FILTERS: { value: BookingFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Requested", label: "Requested" },
  { value: "AwaitingPayment", label: "Awaiting payment" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Completed", label: "Completed" },
];

function statusLabel(status: string): string {
  switch (status) {
    case "AwaitingPayment":
      return "Awaiting payment";
    case "ContractSigned":
      return "Contract signed";
    default:
      return status;
  }
}

function BookingQueueList({
  bookings,
  actionLoading,
  onAccept,
  onDecline,
  onMarkCompleted,
  onContractUpdated,
}: {
  bookings: VendorBookingItem[];
  actionLoading: string | null;
  onAccept: (bookingId: string) => void;
  onDecline: (bookingId: string) => void;
  onMarkCompleted: (bookingId: string) => void;
  onContractUpdated: () => void;
}) {
  return (
    <ul className="space-y-3" role="list">
      {bookings.map((booking) => {
        const isLoading = actionLoading === booking.bookingId;
        const serviceDate = new Date(booking.serviceDate);

        return (
          <li key={booking.bookingId}>
            <article
              className={cn(
                "rounded-xl border border-white/55 bg-white/40 p-5 backdrop-blur-sm sm:p-6",
                "transition-all duration-200",
                "hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/60 hover:shadow-[0_4px_20px_hsl(345_100%_25%/0.07)]"
              )}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
                <div className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className={cn("font-medium text-foreground", vg.body, "text-base sm:text-lg")}>
                        {booking.serviceName}
                      </h3>
                      <Badge variant="status" status={booking.status} className="lg:hidden">
                        {statusLabel(booking.status)}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2.5">
                      <p className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <User size={15} aria-hidden />
                        </span>
                        <span className={cn("font-medium", vg.body)}>{booking.coupleName}</span>
                      </p>
                      <p className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/55 text-muted-foreground ring-1 ring-white/60">
                          <Sparkles size={15} aria-hidden />
                        </span>
                        <span className={vg.subtitle}>{booking.eventName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                    <div className={vd.metaBox}>
                      <p className={vg.label}>Service date</p>
                      <p className={cn("mt-1 flex items-start gap-2 font-medium", vg.body)}>
                        <Calendar size={16} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
                        {serviceDate.toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className={vd.metaBox}>
                      <p className={vg.label}>Agreed amount</p>
                      <p className="mt-1 font-semibold tabular-nums tracking-tight text-foreground">
                        {formatLKR(booking.finalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex min-w-[200px] flex-col justify-between border-t border-white/40 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <div className="mb-4 hidden lg:block">
                    <Badge variant="status" status={booking.status}>
                      {statusLabel(booking.status)}
                    </Badge>
                  </div>

                  {booking.status === "Requested" && (
                    <div className="mt-auto flex w-full gap-2 lg:flex-col">
                      <GlassButton
                        variant="primary"
                        className="flex-1 justify-center"
                        onClick={() => onAccept(booking.bookingId)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Accepting…" : "Accept booking"}
                      </GlassButton>
                      <GlassButton
                        variant="ghost"
                        className="flex-1 justify-center text-destructive hover:text-destructive"
                        onClick={() => onDecline(booking.bookingId)}
                        disabled={isLoading}
                      >
                        <XCircle size={16} aria-hidden />
                        Decline
                      </GlassButton>
                    </div>
                  )}

                  {booking.status === "AwaitingPayment" && (
                    <div className="mt-auto space-y-3">
                      <VendorBookingContractUpload
                        bookingId={booking.bookingId}
                        contractUploaded={booking.contractUploaded}
                        contractSentAt={booking.contractSentAt}
                        contractSignedAt={booking.contractSignedAt}
                        onUpdated={onContractUpdated}
                      />
                      {!booking.contractUploaded && (
                        <p className={cn(vg.caption)}>
                          Upload the contract before the client can sign and pay the deposit.
                        </p>
                      )}
                    </div>
                  )}

                  {booking.status === "ContractSigned" && (
                    <div className="mt-auto space-y-2">
                      <p className={cn(vg.caption)}>Contract signed — waiting for client deposit.</p>
                      {booking.contractFileUrl ? (
                        <a
                          href={booking.contractFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold underline"
                        >
                          View contract PDF
                        </a>
                      ) : null}
                    </div>
                  )}

                  {booking.status === "Confirmed" && (
                    <GlassButton
                      variant="primary"
                      className="mt-auto w-full justify-center lg:w-auto"
                      onClick={() => onMarkCompleted(booking.bookingId)}
                      disabled={isLoading}
                    >
                      <CheckCircle size={16} aria-hidden />
                      {isLoading ? "Updating…" : "Mark completed"}
                    </GlassButton>
                  )}

                  {booking.status === "Completed" && (
                    <p className={cn("mt-auto", vg.caption)}>Service delivered.</p>
                  )}

                  {booking.status === "Cancelled" && (
                    <p className={cn("mt-auto", vg.caption)}>This booking was cancelled.</p>
                  )}
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

export default function VendorBookingsPage() {
  const { user } = useAuth();
  const {
    data: rawBookings = [],
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useVendorBookingsQuery();
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [search, setSearch] = useState("");

  const bookings = useMemo(() => {
    const data = [...rawBookings];
    data.sort((a, b) => {
      if (a.status === "Requested" && b.status !== "Requested") return -1;
      if (a.status !== "Requested" && b.status === "Requested") return 1;
      return new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime();
    });
    return data;
  }, [rawBookings]);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  const fetchBookings = useCallback(
    async (notifyOthers = false) => {
      await refetch();
      if (notifyOthers) {
        dispatchVendorBookingsUpdated();
      }
    },
    [refetch]
  );

  const refreshing = isFetching && !loading;

  useEffect(() => {
    const handleUpdate = () => {
      void fetchBookings();
    };

    window.addEventListener(VENDOR_BOOKINGS_UPDATED, handleUpdate);
    return () => window.removeEventListener(VENDOR_BOOKINGS_UPDATED, handleUpdate);
  }, [fetchBookings]);

  const handleRefresh = async () => {
    await fetchBookings();
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!user) return;
    try {
      setActionLoading(bookingId);
      const token = await user.getIdToken();
      await acceptVendorBooking(token, bookingId);
      await fetchBookings(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept booking.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    if (!user) return;
    try {
      setActionLoading(bookingId);
      const token = await user.getIdToken();
      await declineVendorBooking(token, bookingId);
      await fetchBookings(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to decline booking.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    if (!user) return;
    try {
      setActionLoading(bookingId);
      const token = await user.getIdToken();
      await updateBookingStatus(token, bookingId, newStatus);
      await fetchBookings(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const counts = useMemo(
    () =>
      bookings.reduce(
        (acc, item) => {
          if (item.status === "Requested") acc.requested += 1;
          if (item.status === "AwaitingPayment") acc.awaitingPayment += 1;
          if (item.status === "Confirmed") acc.confirmed += 1;
          if (item.status === "Completed") acc.completed += 1;
          return acc;
        },
        { requested: 0, awaitingPayment: 0, confirmed: 0, completed: 0 }
      ),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    let list = [...bookings];
    if (filter !== "all") list = list.filter((b) => b.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.serviceName.toLowerCase().includes(q) ||
          b.coupleName.toLowerCase().includes(q) ||
          b.eventName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, filter, search]);

  if (loading && !refreshing) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Bookings"
        description="Manage requests, payment states, confirmations, and completed services from couples and planners."
        badge="Operations"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <GlassButton
              variant="ghost"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
              Refresh
            </GlassButton>
            <GlassButton href="/vendor/dashboard/availability" variant="ghost" className="gap-1.5">
              <CalendarDays size={16} aria-hidden />
              Calendar
            </GlassButton>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStatCard
          label="Requested"
          value={counts.requested}
          sub="Needs your response"
          icon={Clock}
          iconTheme="warning"
        />
        <GlassStatCard
          label="Awaiting payment"
          value={counts.awaitingPayment}
          icon={DollarSign}
          iconTheme="accent"
        />
        <GlassStatCard
          label="Confirmed"
          value={counts.confirmed}
          icon={CheckCircle}
          iconTheme="success"
        />
        <GlassStatCard
          label="Completed"
          value={counts.completed}
          icon={Briefcase}
          iconTheme="primary"
        />
      </div>

      <GlassSectionCard
        title="Booking queue"
        subtitle="Sorted by urgency — requested first, then by service date"
        action={
          bookings.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {BOOKING_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                    filter === f.value
                      ? "vgo-nav-active"
                      : "vgo-nav-idle rf-glass-subtle vgo-glass-subtle"
                  )}
                  aria-pressed={filter === f.value}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : undefined
        }
      >
        {bookings.length > 0 && (
          <div className="mb-4">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search service, couple, or event…"
              className="max-w-md"
              glass
            />
          </div>
        )}

        {refreshing ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Refreshing bookings…</p>
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="When couples or planners book your services, they appear here. Keep listings published and availability up to date."
            icon={Briefcase}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <GlassButton href="/vendor/dashboard/services" variant="primary">
                  Manage services
                </GlassButton>
                <GlassButton href="/vendor/dashboard/availability" variant="ghost">
                  Set availability
                </GlassButton>
              </div>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No bookings in this view"
            description="Try another filter or clear your search."
            action={
              <GlassButton
                variant="ghost"
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                }}
              >
                Reset filters
              </GlassButton>
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <BookingQueueList
            bookings={filteredBookings}
            actionLoading={actionLoading}
            onAccept={(id) => void handleAcceptBooking(id)}
            onDecline={(id) => void handleDeclineBooking(id)}
            onMarkCompleted={(id) => void handleUpdateStatus(id, "Completed")}
            onContractUpdated={() => void fetchBookings()}
          />
        )}
      </GlassSectionCard>
    </div>
  );
}
