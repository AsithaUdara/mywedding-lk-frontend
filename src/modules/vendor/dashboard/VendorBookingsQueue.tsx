"use client";

import { Briefcase, Clock, RefreshCw, Wallet } from "lucide-react";
import { useVendorBookingsPage } from "@/modules/vendor/dashboard/hooks/useVendorBookingsPage";
import { VendorBookingCard } from "@/modules/vendor/dashboard/VendorBookingCard";
import { VendorBookingsToolbar } from "@/modules/vendor/dashboard/VendorBookingsToolbar";
import {
  EmptyState,
  ErrorBanner,
  formatLKR,
  PageLoadingSkeleton,
} from "@/modules/vendor/dashboard/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export function VendorBookingsQueue() {
  const {
    bookings,
    filteredBookings,
    stats,
    filter,
    setFilter,
    search,
    setSearch,
    actionLoading,
    showInitialSkeleton,
    isRefreshing,
    error,
    reload,
    handleAcceptBooking,
    handleDeclineBooking,
    handleMarkCompleted,
    focusRequests,
  } = useVendorBookingsPage();

  if (showInitialSkeleton) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Bookings"
        description="Accept requests, manage contracts and payment, then mark jobs complete."
        badge={stats.requested > 0 ? `${stats.requested} requests` : "Operations"}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {stats.requested > 0 ? (
              <GlassButton variant="primary" onClick={focusRequests}>
                Review requests
              </GlassButton>
            ) : null}
            <GlassButton
              variant="ghost"
              onClick={() => void reload()}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={cn(isRefreshing && "animate-spin")} aria-hidden />
              Refresh
            </GlassButton>
          </div>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      {stats.requested > 0 ? (
        <div
          className={cn(
            "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3",
            vg.body
          )}
          role="status"
        >
          <p className="font-medium text-foreground">
            {stats.requested} booking request{stats.requested === 1 ? "" : "s"} waiting
          </p>
          <p className={cn("mt-0.5", vg.caption)}>
            Accept or decline each request — couples and planners are waiting on you.
          </p>
        </div>
      ) : null}

      {bookings.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassStatCard
            label="Booking requests"
            value={stats.requested}
            sub={stats.requested > 0 ? "Needs accept or decline" : "No pending requests"}
            icon={Clock}
            iconTheme={stats.requested > 0 ? "warning" : "success"}
          />
          <GlassStatCard
            label="Pipeline value"
            value={formatLKR(stats.pipelineValue)}
            sub={`${stats.inProgress + stats.confirmed} in progress`}
            icon={Wallet}
            iconTheme="accent"
          />
        </div>
      ) : null}

      <div className={cn(vg.panel, "overflow-hidden")}>
        {bookings.length > 0 ? (
          <div className="border-b border-white/40 px-4 py-4 sm:px-6">
            <VendorBookingsToolbar
              search={search}
              onSearchChange={setSearch}
              filter={filter}
              onFilterChange={setFilter}
              resultCount={filteredBookings.length}
              totalCount={bookings.length}
            />
          </div>
        ) : null}

        <div className="p-4 sm:p-6">
          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="When couples or planners book your services, they appear here. Keep listings live and availability updated."
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
                  Clear filters
                </GlassButton>
              }
              className="border-0 bg-transparent shadow-none"
            />
          ) : (
            <ul className="space-y-3" role="list">
              {filteredBookings.map((booking) => (
                <li key={booking.bookingId}>
                  <VendorBookingCard
                    booking={booking}
                    actionLoading={actionLoading}
                    onAccept={(id) => void handleAcceptBooking(id)}
                    onDecline={(id) => void handleDeclineBooking(id)}
                    onMarkCompleted={(id) => void handleMarkCompleted(id)}
                    onContractUpdated={() => void reload()}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
