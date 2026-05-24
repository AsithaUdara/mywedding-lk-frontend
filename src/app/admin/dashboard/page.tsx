"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/shared/context/AuthContext';
import { getPlatformStats, PlatformStats, getPayoutDue, markPayoutSettled, PayoutDueItem } from '@/shared/lib/api/admin';
import { Users, Store, CalendarHeart, CalendarCheck, Loader2 } from 'lucide-react';

const STAT_CONFIG = [
  { key: 'totalUsers',    label: 'Total Users',    icon: <Users />,          color: 'bg-blue-500' },
  { key: 'totalVendors',  label: 'Total Vendors',  icon: <Store />,          color: 'bg-emerald-500' },
  { key: 'totalEvents',   label: 'Total Events',   icon: <CalendarHeart />,  color: 'bg-violet-500' },
  { key: 'totalBookings', label: 'Total Bookings', icon: <CalendarCheck />,  color: 'bg-amber-500' },
] as const;

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]   = useState<PlatformStats | null>(null);
  const [payoutDue, setPayoutDue] = useState<PayoutDueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        setStats(await getPlatformStats(token));
        setPayoutDue(await getPayoutDue(token));
      } catch {
        setError('Failed to load platform stats.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold font-playfair text-charcoal">Platform Overview</h1>
        <p className="text-slate-500 mt-1">Live statistics across the entire MyWeddingLK platform.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 py-12">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading stats…</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-5 text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAT_CONFIG.map(({ key, label, icon, color }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 ${color}`}>
                {React.cloneElement(icon, { size: 24 } as React.HTMLAttributes<SVGElement>)}
              </div>
              <p className="text-slate-500 text-sm font-medium">{label}</p>
              <p className="text-3xl font-bold text-charcoal mt-1">
                {stats ? stats[key].toLocaleString() : '—'}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-charcoal">Vendor Payout Queue</h2>
          <p className="mt-1 text-sm text-slate-500">Manual payout settlement list (commission already deducted).</p>

          {payoutDue.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No pending settlements.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {payoutDue.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-charcoal">Booking {item.bookingId}</p>
                    <p className="text-sm text-slate-600">
                      Gross LKR {item.grossAmount.toLocaleString()} | Commission LKR {item.commissionAmount.toLocaleString()} | Vendor Net LKR {item.vendorNetAmount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!user) return;
                      const token = await user.getIdToken();
                      await markPayoutSettled(token, item.id);
                      setPayoutDue((prev) => prev.filter((x) => x.id !== item.id));
                    }}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
                  >
                    Mark Settled
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
