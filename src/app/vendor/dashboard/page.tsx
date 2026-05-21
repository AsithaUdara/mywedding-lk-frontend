"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/shared/context/AuthContext';
import {
    CalendarCheck,
    Clock,
    DollarSign,
    Star,
    TrendingUp,
    Package,
    MessageSquare,
    ArrowUpRight,
    Loader2,
} from 'lucide-react';

interface MonthlyEarning {
    month: string;
    amount: number;
}

interface VendorAnalytics {
    totalServices: number;
    activeServices: number;
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    totalRevenue: number;
    pendingRevenue: number;
    averageRating: number;
    totalReviews: number;
    totalInquiries: number;
    unreadInquiries: number;
    monthlyEarnings: MonthlyEarning[];
}

function formatLKR(amount: number) {
    if (amount >= 1_000_000) return `LKR ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `LKR ${(amount / 1_000).toFixed(0)}K`;
    return `LKR ${amount.toLocaleString()}`;
}

function BookingBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">{label}</span>
                <span className="font-bold text-charcoal">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}

function MiniBarChart({ data }: { data: MonthlyEarning[] }) {
    const max = Math.max(...data.map(d => d.amount), 1);
    return (
        <div className="flex items-end gap-2 h-20 mt-4">
            {data.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                        className="w-full rounded-t-md bg-primary/70"
                        style={{ height: `${Math.round((d.amount / max) * 72)}px` }}
                        initial={{ scaleY: 0, originY: 1 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                    <span className="text-[9px] text-slate-400 truncate w-full text-center">{d.month.split(' ')[0]}</span>
                </div>
            ))}
        </div>
    );
}

export default function VendorDashboardOverview() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/analytics`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.ok) setAnalytics(await res.json());
            } catch (err) {
                console.error('Failed to load analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [user]);

    const a = analytics;

    const statCards = [
        {
            label: 'Total Bookings',
            value: a ? String(a.totalBookings) : '—',
            sub: a ? `${a.pendingBookings} pending` : '',
            icon: <CalendarCheck />,
            color: 'bg-blue-500',
            trend: a && a.totalBookings > 0 ? `+${a.confirmedBookings} confirmed` : 'No bookings yet',
        },
        {
            label: 'Pending Bookings',
            value: a ? String(a.pendingBookings) : '—',
            sub: a ? `${a.completedBookings} completed` : '',
            icon: <Clock />,
            color: 'bg-amber-500',
            trend: a && a.pendingBookings > 0 ? 'Awaiting action' : 'All clear',
        },
        {
            label: 'Total Revenue',
            value: a ? formatLKR(a.totalRevenue) : '—',
            sub: a ? `${formatLKR(a.pendingRevenue)} pending` : '',
            icon: <DollarSign />,
            color: 'bg-emerald-500',
            trend: a && a.totalRevenue > 0 ? 'From completed' : 'No revenue yet',
        },
        {
            label: 'Average Rating',
            value: a ? (a.averageRating > 0 ? a.averageRating.toFixed(1) : 'New') : '—',
            sub: a ? `${a.totalReviews} review${a.totalReviews !== 1 ? 's' : ''}` : '',
            icon: <Star />,
            color: 'bg-yellow-500',
            trend: a && a.averageRating >= 4 ? 'Excellent!' : a && a.averageRating > 0 ? 'Keep improving' : 'No reviews yet',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-playfair text-charcoal">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back! Here&apos;s what&apos;s happening with your business.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 text-slate-400">
                    <Loader2 className="animate-spin mr-3" size={24} />
                    <span>Loading analytics…</span>
                </div>
            ) : (
                <>
                    {/* 4 Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl text-white ${stat.color}`}>
                                        {React.cloneElement(stat.icon, { size: 22 } as React.HTMLAttributes<SVGElement>)}
                                    </div>
                                    <span className="flex items-center gap-1 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        {stat.trend} <ArrowUpRight size={10} />
                                    </span>
                                </div>
                                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
                                {stat.sub && <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>}
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left column: bookings breakdown + monthly chart */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Bookings breakdown */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="font-bold text-charcoal text-lg mb-5">Bookings Breakdown</h3>
                                {a && a.totalBookings > 0 ? (
                                    <div className="space-y-4">
                                        <BookingBar label="Pending"   count={a.pendingBookings}   total={a.totalBookings} color="bg-amber-400" />
                                        <BookingBar label="Confirmed" count={a.confirmedBookings} total={a.totalBookings} color="bg-blue-400" />
                                        <BookingBar label="Completed" count={a.completedBookings} total={a.totalBookings} color="bg-emerald-400" />
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm">No bookings yet. Once couples book your services they will appear here.</p>
                                )}
                            </div>

                            {/* Monthly earnings chart */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="font-bold text-charcoal text-lg mb-1">Monthly Earnings (Last 6 Months)</h3>
                                <p className="text-xs text-slate-400 mb-2">Includes confirmed + completed bookings</p>
                                {a && a.monthlyEarnings.some(m => m.amount > 0) ? (
                                    <MiniBarChart data={a.monthlyEarnings} />
                                ) : (
                                    <p className="text-slate-400 text-sm mt-4">No earnings data yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="space-y-6">

                            {/* Services counter */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Package size={20} className="text-primary" />
                                    <h3 className="font-bold text-charcoal text-lg">Services</h3>
                                </div>
                                <div className="flex justify-around text-center">
                                    <div>
                                        <p className="text-3xl font-bold text-primary">{a?.activeServices ?? 0}</p>
                                        <p className="text-xs text-slate-500 mt-1">Active</p>
                                    </div>
                                    <div className="border-l border-slate-100" />
                                    <div>
                                        <p className="text-3xl font-bold text-charcoal">{a?.totalServices ?? 0}</p>
                                        <p className="text-xs text-slate-500 mt-1">Total</p>
                                    </div>
                                </div>
                            </div>

                            {/* Inquiries counter */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageSquare size={20} className="text-primary" />
                                    <h3 className="font-bold text-charcoal text-lg">Inquiries</h3>
                                </div>
                                <div className="flex justify-around text-center">
                                    <div>
                                        <p className="text-3xl font-bold text-rose-500">{a?.unreadInquiries ?? 0}</p>
                                        <p className="text-xs text-slate-500 mt-1">Unread</p>
                                    </div>
                                    <div className="border-l border-slate-100" />
                                    <div>
                                        <p className="text-3xl font-bold text-charcoal">{a?.totalInquiries ?? 0}</p>
                                        <p className="text-xs text-slate-500 mt-1">Total</p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-2xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-2">Grow Your Business</h3>
                                    <p className="text-sm opacity-90 mb-6">Complete your profile to increase visibility by up to 40%.</p>
                                    <a
                                        href="/vendor/dashboard/profile"
                                        className="block w-full py-3 bg-white text-primary font-bold rounded-xl shadow-lg text-center transition-transform hover:scale-[1.02]"
                                    >
                                        Update My Profile
                                    </a>
                                </div>
                                <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
