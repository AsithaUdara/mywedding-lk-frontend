"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Home } from 'lucide-react';

export default function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith('/vendor/dashboard');

    return (
        <div className="min-h-screen bg-cream flex flex-col font-roboto">
            {/* Vendor Portal Specialized Header - Hidden on Dashboard */}
            {!isDashboard && (
                <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <Briefcase size={22} className="text-primary" />
                                </div>
                                <div>
                                    <span className="text-xl font-bold font-playfair text-charcoal block leading-none">MyWedding Vendor</span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Business Portal</span>
                                </div>
                            </Link>
                        </div>

                        <nav className="flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-primary flex items-center gap-2 transition-colors">
                                <Home size={16} /> Back to Consumer Site
                            </Link>
                            <div className="h-6 w-px bg-slate-200" />
                            <Link href="/vendor/login" className="text-sm font-semibold text-charcoal hover:text-primary transition-colors">
                                Sign In
                            </Link>
                            <Link href="/vendor/signup" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-md shadow-primary/20">
                                Join as Vendor
                            </Link>
                        </nav>
                    </div>
                </header>
            )}

            <main className="flex-grow">
                {children}
            </main>

            {/* Vendor Portal Specialized Footer - Hidden on Dashboard */}
            {!isDashboard && (
                <footer className="bg-white border-t border-slate-200 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-2 grayscale brightness-50 opacity-50">
                            <Briefcase size={20} />
                            <span className="font-playfair font-bold text-lg">MyWedding Vendor</span>
                        </div>
                        <p className="text-slate-400 text-sm">© 2026 MyWedding.lk Business Solutions. All rights reserved.</p>
                        <div className="flex gap-8 text-sm font-medium text-slate-500">
                            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                            <Link href="#" className="hover:text-primary transition-colors">Help Center</Link>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
