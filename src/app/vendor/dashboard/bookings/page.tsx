"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/shared/context/AuthContext";
import { getVendorBookings, updateBookingStatus } from "@/shared/lib/api/vendors";
import {
  Briefcase,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
  PageHeader,
  SectionCard,
  StatCard,
} from "@/modules/vendor/dashboard/ui";

interface VendorBooking {
  bookingId: string;
  serviceName: string;
  eventName: string;
  coupleName: string;
  finalAmount: number;
  status: string;
  serviceDate: string;
}

export default function VendorBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const data: VendorBooking[] = await getVendorBookings(token);
      
      // Sort bookings: pending first, then by date
      data.sort((a: VendorBooking, b: VendorBooking) => {
        if (a.status === 'Requested' && b.status !== 'Requested') return -1;
        if (a.status !== 'Requested' && b.status === 'Requested') return 1;
        return new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime();
      });
      
      setBookings(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookings.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Requested':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wider rounded-full"><Clock size={12} /> Requested</span>;
      case 'AwaitingPayment':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider rounded-full"><DollarSign size={12} /> Awaiting Payment</span>;
      case 'Confirmed':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider rounded-full"><CheckCircle size={12} /> Confirmed</span>;
      case 'Completed':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider rounded-full">Completed</span>;
      case 'Cancelled':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider rounded-full"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bookings"
        description="Manage requests, payment waiting states, confirmations, and completed services."
        badge={`${bookings.length} total`}
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Requested"
          value={counts.requested}
          icon={Clock}
          iconTheme="amber"
        />
        <StatCard
          index={1}
          label="Awaiting payment"
          value={counts.awaitingPayment}
          icon={DollarSign}
          iconTheme="gold"
        />
        <StatCard
          index={2}
          label="Confirmed"
          value={counts.confirmed}
          icon={CheckCircle}
          iconTheme="green"
        />
        <StatCard
          index={3}
          label="Completed"
          value={counts.completed}
          icon={Briefcase}
          iconTheme="blue"
        />
      </div>

      <SectionCard title="Booking queue" subtitle="Ordered by urgency and service date">
        {loading ? (
          <LoadingState label="Loading bookings..." />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="When couples request your services, they will appear here."
            action={
              <Link
                href="/vendor/dashboard/services"
                className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Manage services
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-6 lg:flex-row">
                
                {/* Info Section */}
                <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-lg font-bold text-charcoal">{booking.serviceName}</h3>
                       <div className="md:hidden">{getStatusBadge(booking.status)}</div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <User size={16} className="text-primary/70" />
                        <span className="font-medium text-charcoal">{booking.coupleName}</span>
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">
                          E
                        </span>
                        <span>{booking.eventName}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Service Date</p>
                        <p className="flex items-center gap-2 text-sm font-medium text-charcoal">
                          <Calendar size={16} className="text-gray-400" />
                          {new Date(booking.serviceDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Agreed Amount</p>
                        <p className="flex items-center gap-1 text-lg font-bold text-primary">
                          LKR {booking.finalAmount.toLocaleString()}
                        </p>
                     </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex min-w-[200px] flex-col items-start justify-between border-t border-gray-100 pt-4 lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <div className="hidden md:block mb-4">
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  {booking.status === 'Requested' && (
                    <div className="mt-auto flex w-full gap-2 lg:flex-col">
                      <button
                        onClick={() => handleUpdateStatus(booking.bookingId, 'Confirmed')}
                        disabled={actionLoading === booking.bookingId}
                        className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                      >
                        {actionLoading === booking.bookingId ? 'Updating...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.bookingId, 'Cancelled')}
                        disabled={actionLoading === booking.bookingId}
                        className="flex-1 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {booking.status === 'AwaitingPayment' && (
                    <p className="text-xs text-slate-500 mt-auto">
                      Waiting for couple/planner deposit checkout confirmation.
                    </p>
                  )}

                  {booking.status === 'Confirmed' && (
                    <div className="mt-auto flex w-full gap-2 lg:flex-col">
                      <button
                        onClick={() => handleUpdateStatus(booking.bookingId, 'Completed')}
                        disabled={actionLoading === booking.bookingId}
                        className="flex-1 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-black disabled:opacity-50"
                      >
                        Mark Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
