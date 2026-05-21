"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/shared/context/AuthContext';
import { LayoutDashboard, Users, Loader2, ShieldAlert } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin/dashboard' },
  { label: 'Pending Vendors', icon: <Users size={20} />, href: '/admin/vendors' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        router.replace('/');
        return;
      }
      const tokenResult = await user.getIdTokenResult(true);
      if (tokenResult.claims.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.replace('/');
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading, router]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary" size={36} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <ShieldAlert size={48} className="text-red-400" />
        <p className="text-lg font-bold text-slatecoal">Access Denied</p>
        <p className="text-slate-500">You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 shadow-sm flex flex-col py-8 px-4 gap-2">
        <div className="px-2 mb-6">
          <div className="flex items-center gap-2">
            <ShieldAlert size={22} className="text-primary" />
            <span className="font-bold text-lg text-charcoal font-playfair">Admin Panel</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">MyWeddingLK Platform</p>
        </div>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-charcoal'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-10">
        {children}
      </main>
    </div>
  );
}
