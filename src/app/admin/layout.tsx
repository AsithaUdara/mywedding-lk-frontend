"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/shared/context/AuthContext";
import { auth } from "@/shared/lib/firebase";
import { signOut } from "firebase/auth";
import { LayoutDashboard, ShieldCheck, LogOut, Menu, X, Loader2 } from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin" },
  { label: "KYB queue", href: "/admin/vendors" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  const activeItem = useMemo(() => {
    if (pathname === "/admin" || pathname === "/admin/dashboard") return NAV_ITEMS[0];
    return NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  }, [pathname]);

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
      <div className="flex min-h-screen items-center justify-center bg-neutral-200 font-sans">
        <Loader2 className="animate-spin text-neutral-600" size={28} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-neutral-200 px-4 font-sans">
        <p className="text-sm font-semibold text-neutral-900">Access denied</p>
        <p className="text-xs text-neutral-600">Admin role required.</p>
      </div>
    );
  }

  const renderNav = (mobile?: boolean) =>
    NAV_ITEMS.map((item) => {
      const isActive =
        item.href === "/admin"
          ? pathname === "/admin" || pathname === "/admin/dashboard"
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => mobile && setMobileNavOpen(false)}
          className={`block border-l-2 px-3 py-2 text-xs font-medium transition-colors ${
            isActive
              ? "border-neutral-900 bg-neutral-100 text-neutral-900"
              : "border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          }`}
        >
          {item.label}
        </Link>
      );
    });

  return (
    <div className="flex min-h-screen bg-neutral-200 font-sans text-neutral-900">
      <aside className="fixed z-40 hidden h-full w-52 flex-col border-r border-neutral-300 bg-white md:flex">
        <div className="border-b border-neutral-300 px-3 py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-neutral-700" strokeWidth={2} />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide">MyWedding Admin</p>
              <p className="text-[10px] text-neutral-500">Operations console</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 py-2">{renderNav()}</nav>
        <div className="border-t border-neutral-300 p-2">
          {user && (
            <p className="truncate px-3 py-1 text-[10px] text-neutral-500" title={user.email ?? undefined}>
              {user.email}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-56 flex-col border-r border-neutral-300 bg-white">
            <div className="flex h-11 items-center justify-between border-b border-neutral-300 px-3">
              <span className="text-xs font-bold uppercase">Admin</span>
              <button type="button" onClick={() => setMobileNavOpen(false)} className="p-1">
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 py-2">{renderNav(true)}</nav>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col md:ml-52">
        <header className="sticky top-0 z-30 flex h-11 items-center justify-between border-b border-neutral-300 bg-white px-3 md:px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="p-1 text-neutral-600 md:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <LayoutDashboard size={16} className="hidden text-neutral-500 sm:block" />
            <h1 className="text-sm font-semibold">{activeItem?.label ?? "Admin"}</h1>
          </div>
          <span className="border border-neutral-400 bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-700">
            Internal
          </span>
        </header>

        <main className="flex-1 p-3 md:p-4">{children}</main>
      </div>
    </div>
  );
}
