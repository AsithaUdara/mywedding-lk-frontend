// src/app/vendor/dashboard/layout.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Package,
    Settings,
    User,
    MessageSquare,
    LogOut,
    Menu,
    X,
    Briefcase,
    Bell
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function VendorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const pathname = usePathname();
    const { logOut, user } = useAuth();

    const navItems = [
        { label: 'Overview', icon: <BarChart3 size={20} />, href: '/vendor/dashboard' },
        { label: 'My Services', icon: <Package size={20} />, href: '/vendor/dashboard/services' },
        { label: 'Inquiries', icon: <MessageSquare size={20} />, href: '/vendor/dashboard/inquiries' },
        { label: 'Profile', icon: <User size={20} />, href: '/vendor/dashboard/profile' },
        { label: 'Settings', icon: <Settings size={20} />, href: '/vendor/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-40`}>
                <div className="h-20 flex items-center px-6 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 bg-primary text-white rounded-lg flex-shrink-0 flex items-center justify-center">
                            <Briefcase size={20} />
                        </div>
                        {isSidebarOpen && (
                            <span className="font-playfair font-bold text-lg text-charcoal whitespace-nowrap">Vendor Pro</span>
                        )}
                    </Link>
                </div>

                <nav className="flex-grow py-6 px-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:bg-slate-50 hover:text-charcoal'}`}
                            >
                                <div className="flex-shrink-0">{item.icon}</div>
                                {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logOut}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-medium text-sm">Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-charcoal">{user?.displayName || 'Business Owner'}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Verified Partner</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-accent rounded-xl" />
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
