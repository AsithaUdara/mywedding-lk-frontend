"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
    Eye,
    CalendarCheck,
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    Clock,
    Star,
    Users
} from 'lucide-react';

interface StatCard {
    label: string;
    value: string;
    icon: React.ReactElement<{ size?: number }>;
    color: string;
    trend: string;
}

export default function VendorDashboardOverview() {
    const { user } = useAuth();
    const [serviceCount, setServiceCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setServiceCount(data.length);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, [user]);

    const STAT_CARDS: StatCard[] = [
        { label: 'Profile Views', value: '1,284', icon: <Eye />, color: 'bg-blue-500', trend: '+12%' },
        { label: 'Active Services', value: serviceCount.toString(), icon: <CalendarCheck />, color: 'bg-green-500', trend: 'Live' },
        { label: 'Recent Revenue', value: 'LKR 0', icon: <DollarSign />, color: 'bg-orange-500', trend: '0%' },
        { label: 'Avg. Rating', value: 'New', icon: <Star />, color: 'bg-yellow-500', trend: 'Latest' },
    ];
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-playfair text-charcoal">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back! Heres whats happening with your business today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STAT_CARDS.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl text-white ${stat.color} shadow-lg shadow-opacity-20`}>
                                {React.cloneElement(stat.icon, { size: 24 })}
                            </div>
                            <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                                {stat.trend} <ArrowUpRight size={12} />
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-charcoal mt-1">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Inquiries */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-charcoal text-lg">Recent Inquiries</h3>
                        <button className="text-primary text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal">Amal & Priyantha</h4>
                                        <p className="text-xs text-slate-400">Wedding Date: 12 June 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">New Lead</span>
                                    <p className="text-[10px] text-slate-400 mt-1">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Performance */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-2xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Grow Your Business</h3>
                            <p className="text-sm opacity-90 mb-6">Complete your profile to increase visibility by up to 40%.</p>
                            <button className="w-full py-3 bg-white text-primary font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02]">
                                Update My Profile
                            </button>
                        </div>
                        <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-charcoal text-lg mb-6 flex items-center gap-2">
                            <Clock size={20} className="text-primary" /> Upcoming Tasks
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                <p className="text-sm text-slate-600">Meeting with Kandy Wedding Expo organizers</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5" />
                                <p className="text-sm text-slate-400">Update pricing for peak season 2026</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
