"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getVendorBookings } from "@/shared/lib/api/vendors";
import { acceptVendorBooking, updateBookingStatus } from "@/shared/lib/api/bookings";
import { SearchField } from "@/modules/vendor/dashboard/components";
import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  formatLKR,
  PageHeader,
  PageLoadingSkeleton,
  SectionCard,
  StatCard,
} from "@/modules/vendor/dashboard/ui";
import { cn } from "@/shared/lib/cn";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";

interface VendorBooking {
  bookingId: string;
  serviceName: string;
  eventName: string;
  coupleName: string;
  finalAmount: number;
  status: string;
  serviceDate: string;
}

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
    default:
      return status;
  }
}

function BookingPlaceholderPreview() {
  const samples = [
    {
      service: "Full-day photography",
      couple: "Couple name",
      event: "Colombo wedding",
      date: "Sat, 15 Jun 2026",
      amount: "LKR 150,000",
      status: "Requested" as const,
    },
    {
      service: "Reception décor",
      couple: "Another couple",
      event: "Kandy celebration",
      date: "Sun, 22 Jun 2026",
      amount: "LKR 95,000",
      status: "Confirmed" as const,
    },
  ];

  return (
    <div className="mt-6 space-y-3 opacity-90" aria-hidden>
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Preview — bookings appear here when couples confirm your services
      </p>
      {samples.map((row) => (
        <div
          key={row.service}
          className="rounded-2xl border border-dashed border-border bg-muted/20 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold text-muted-foreground">{row.service}</p>
            <Badge variant="status" status={row.status}>
              {statusLabel(row.status)}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground/80">
            {row.couple} · {row.event}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            {row.date} · {row.amount}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function VendorBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [search, setSearch] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const token = await user.getIdToken();
      const data: VendorBooking[] = await getVendorBookings(token);

      data.sort((a, b) => {
        if (a.status === "Requested" && b.status !== "Requested") return -1;
        if (a.status !== "Requested" && b.status === "Requested") return 1;
        return new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime();
      });

      setBookings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      try {
        setLoading(true);
        await fetchBookings();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchBookings, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!user) return;
    try {
      setActionLoading(bookingId);
      const token = await user.getIdToken();
      await acceptVendorBooking(token, bookingId);
      await fetchBookings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept booking.");
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
      await fetchBookings();
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
    <div className="space-y-8 pb-4">
      <PageHeader
        title="Bookings"
        description="Manage requests, payment states, confirmations, and completed services from couples and planners."
        badge="Operations"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
              Refresh
            </Button>
            <Button href="/vendor/dashboard/availability" variant="ghost" size="sm">
              <Calendar size={16} aria-hidden />
              Calendar
            </Button>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Requested"
          value={counts.requested}
          sub="Needs your response"
          icon={Clock}
          iconTheme="warning"
        />
        <StatCard
          index={1}
          label="Awaiting payment"
          value={counts.awaitingPayment}
          icon={DollarSign}
          iconTheme="accent"
        />
        <StatCard
          index={2}
          label="Confirmed"
          value={counts.confirmed}
          icon={CheckCircle}
          iconTheme="success"
        />
        <StatCard
          index={3}
          label="Completed"
          value={counts.completed}
          icon={Briefcase}
          iconTheme="primary"
        />
      </div>

      <SectionCard
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
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                    filter === f.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
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
            />
          </div>
        )}

        {refreshing ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Refreshing bookings…</p>
        ) : bookings.length === 0 ? (
          <div>
            <EmptyState
              title="No bookings yet"
              description="When couples or planners book your services, they appear here. Keep listings published and availability up to date."
              icon={Briefcase}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button href="/vendor/dashboard/services" variant="primary" size="sm">
                    Manage services
                  </Button>
                  <Button href="/vendor/dashboard/availability" variant="secondary" size="sm">
                    Set availability
                  </Button>
                </div>
              }
            />
            <BookingPlaceholderPreview />
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No bookings in this view"
            description="Try another filter or clear your search."
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <article
                key={booking.bookingId}
                className="rounded-3xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col justify-between gap-6 lg:flex-row">
                  <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-foreground">{booking.serviceName}</h3>
                        <div className="lg:hidden">
                          <Badge variant="status" status={booking.status}>
                            {statusLabel(booking.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User size={16} className="text-primary" aria-hidden />
                          <span className="font-semibold text-foreground">{booking.coupleName}</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            E
                          </span>
                          <span>{booking.eventName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className={vd.metaBox}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Service date
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Calendar size={16} className="text-muted-foreground" aria-hidden />
                          {new Date(booking.serviceDate).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className={vd.metaBox}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Agreed amount
                        </p>
                        <p className="mt-1 text-lg font-bold text-primary">
                          {formatLKR(booking.finalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-[200px] flex-col items-start justify-between border-t border-border pt-4 lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <div className="mb-4 hidden lg:block">
                      <Badge variant="status" status={booking.status}>
                        {statusLabel(booking.status)}
                      </Badge>
                    </div>

                    {booking.status === "Requested" && (
                      <div className="mt-auto flex w-full gap-2 lg:flex-col">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => void handleAcceptBooking(booking.bookingId)}
                          disabled={actionLoading === booking.bookingId}
                        >
                          {actionLoading === booking.bookingId ? "Accepting…" : "Accept booking"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="flex-1 !text-destructive hover:!bg-destructive/10"
                          onClick={() => void handleUpdateStatus(booking.bookingId, "Cancelled")}
                          disabled={actionLoading === booking.bookingId}
                        >
                          <XCircle size={16} aria-hidden />
                          Decline
                        </Button>
                      </div>
                    )}

                    {booking.status === "AwaitingPayment" && (
                      <p className="mt-auto text-xs text-muted-foreground">
                        Waiting for deposit checkout from the couple or planner.
                      </p>
                    )}

                    {booking.status === "Confirmed" && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="mt-auto w-full lg:w-auto"
                        onClick={() => void handleUpdateStatus(booking.bookingId, "Completed")}
                        disabled={actionLoading === booking.bookingId}
                      >
                        <CheckCircle size={16} aria-hidden />
                        {actionLoading === booking.bookingId ? "Updating…" : "Mark completed"}
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
