"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/shared/context/AuthContext";
import { auth } from "@/shared/lib/firebase";
import { signOut } from "firebase/auth";
import { LayoutDashboard, ShieldCheck, LogOut, Menu, X, Loader2, Users } from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "KYB queue", href: "/admin/vendors", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  const activeItem = useMemo(
    () =>
      NAV_ITEMS.find(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
      ) ?? NAV_ITEMS[0],
    [pathname]
  );

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    if (isLoginPage) return;

    const checkAdminRole = async () => {
      if (!user) {
        router.replace("/admin/login");
        return;
      }
      const tokenResult = await user.getIdTokenResult(true);
      if (tokenResult.claims.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.replace("/");
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading, router, isLoginPage]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authLoading || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-roboto">
        <Loader2 className="animate-spin text-slate-500" size={28} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 font-roboto">
        <p className="font-playfair text-lg font-bold tracking-tight text-charcoal">Access denied</p>
        <p className="text-sm text-slate-500">Admin role required.</p>
      </div>
    );
  }

  const renderNav = (mobile?: boolean) =>
    NAV_ITEMS.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => mobile && setMobileNavOpen(false)}
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out ${
            isActive
              ? "bg-charcoal text-white shadow-sm"
              : "text-slate-600 hover:bg-white/80 hover:text-charcoal hover:shadow-sm"
          }`}
        >
          <Icon size={18} strokeWidth={2} />
          {item.label}
        </Link>
      );
    });

  return (
    <div className="flex min-h-screen bg-slate-50 font-roboto text-charcoal">
      <aside className="fixed z-40 hidden h-full w-64 flex-col border-r border-white/20 bg-white/80 p-4 shadow-sm backdrop-blur-md md:flex">
        <Link
          href="/admin/dashboard"
          className="mb-6 flex items-center gap-3 rounded-2xl px-2 py-2 transition-all duration-300 ease-in-out hover:bg-white/60"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal text-white shadow-sm">
            <ShieldCheck size={20} strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">MyWedding</p>
            <p className="font-playfair text-base font-bold tracking-tight text-charcoal">Admin</p>
          </div>
        </Link>

        <nav className="flex-1 space-y-1">{renderNav()}</nav>

        <div className="border-t border-slate-100/80 pt-4">
          {user && (
            <p className="mb-2 truncate px-2 text-xs text-slate-500" title={user.email ?? undefined}>
              {user.email}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-300 ease-in-out hover:bg-rose-50 hover:text-rose-800/90"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-all duration-300"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-md">
            <div className="mb-4 flex h-12 items-center justify-between">
              <span className="font-playfair font-bold tracking-tight text-charcoal">Admin</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl p-2 transition-all duration-300 ease-in-out hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 space-y-1">{renderNav(true)}</nav>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/20 bg-white/80 px-4 shadow-sm backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-xl p-2 text-slate-500 transition-all duration-300 ease-in-out hover:bg-white hover:shadow-sm md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-charcoal">{activeItem?.label ?? "Admin"}</h1>
          </div>
          <span className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            Internal
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
