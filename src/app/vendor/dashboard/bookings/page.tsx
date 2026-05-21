"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { getVendorBookings, updateBookingStatus } from '@/shared/lib/api/vendors';
import { Briefcase, Calendar, User, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import LoadingSkeleton from '@/shared/components/ui/LoadingSkeleton';

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

  const fetchBookings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const data = await getVendorBookings(token);
      
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
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    if (!user) return;
    try {
      setActionLoading(bookingId);
      const token = await user.getIdToken();
      await updateBookingStatus(token, bookingId, newStatus);
      await fetchBookings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Requested':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-wider rounded-full"><Clock size={12} /> Pending</span>;
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-charcoal flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="text-primary" size={24} />
            </div>
            My Bookings
          </h1>
          <p className="text-gray-500 mt-2 text-sm max-w-2xl">
            Manage your service requests. Confirm pending bookings to secure the date, or cancel if you are unavailable.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
               <LoadingSkeleton className="h-24 w-full md:w-2/3" />
               <LoadingSkeleton className="h-24 w-full md:w-1/3" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-gray-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-charcoal mb-2">No Bookings Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You don&apos;t have any booking requests at the moment. Make sure your services are active and your profile is complete.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.bookingId} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Info Section */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary">E</span>
                        <span>{booking.eventName}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Service Date</p>
                        <p className="text-sm text-charcoal font-medium flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          {new Date(booking.serviceDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Agreed Amount</p>
                        <p className="text-lg text-primary font-bold flex items-center gap-1">
                          LKR {booking.finalAmount.toLocaleString()}
                        </p>
                     </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-col items-start lg:items-end justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[200px]">
                  <div className="hidden md:block mb-4">
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  {booking.status === 'Requested' && (
                    <div className="flex w-full lg:flex-col gap-2 mt-auto">
                      <button
                        onClick={() => handleUpdateStatus(booking.bookingId, 'Confirmed')}
                        disabled={actionLoading === booking.bookingId}
                        className="flex-1 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === booking.bookingId ? 'Updating...' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.bookingId, 'Cancelled')}
                        disabled={actionLoading === booking.bookingId}
                        className="flex-1 px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {booking.status === 'Confirmed' && (
                    <div className="flex w-full lg:flex-col gap-2 mt-auto">
                      <button
                        onClick={() => handleUpdateStatus(booking.bookingId, 'Completed')}
                        disabled={actionLoading === booking.bookingId}
                        className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
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
    </div>
  );
}
