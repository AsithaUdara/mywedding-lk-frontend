"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/shared/context/AuthContext";
import { auth } from "@/shared/lib/firebase";
import { signOut } from "firebase/auth";
import {
  LayoutDashboard,
  UserPlus,
  Loader2,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Pending vendors", icon: UserPlus, href: "/admin/vendors" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
    [pathname]
  );

  const userInitials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "A";

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
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f3]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f8f6f3] px-4">
        <Shield size={40} className="text-red-400" />
        <p className="text-lg font-semibold text-charcoal">Access denied</p>
        <p className="text-sm text-slate-500">This account does not have admin privileges.</p>
      </div>
    );
  }

  const renderNav = (mobile?: boolean) =>
    NAV_ITEMS.map((item) => {
      const isActive = pathname === item.href;
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => mobile && setMobileNavOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive
              ? "bg-primary/10 text-primary"
              : "text-slate-600 hover:bg-slate-50 hover:text-charcoal"
          }`}
        >
          <Icon size={18} strokeWidth={2} />
          {item.label}
        </Link>
      );
    });

  return (
    <div className="flex min-h-screen bg-[#f8f6f3] font-roboto">
      <aside className="fixed z-40 hidden h-full w-64 flex-col border-r border-slate-200/80 bg-white shadow-sm md:flex">
        <div className="border-b border-slate-100 px-5 py-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-playfair text-base font-bold text-charcoal">Admin</p>
              <p className="truncate text-xs text-slate-500">MyWedding.lk</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">{renderNav()}</nav>

        <div className="border-t border-slate-100 p-3">
          {user && (
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-charcoal">Administrator</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
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
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
              <span className="font-playfair font-bold text-charcoal">Admin</span>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-slate-100"
                onClick={() => setMobileNavOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-3">{renderNav(true)}</nav>
            <div className="border-t border-slate-100 p-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 py-3 text-sm font-semibold text-red-600"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm font-semibold text-charcoal">
                {activeItem?.label ?? "Admin"}
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">Platform operations</p>
            </div>
          </div>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Internal
          </span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
