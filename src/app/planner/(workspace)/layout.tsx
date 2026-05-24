"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  Briefcase,
  Mail,
  Wallet,
  Sparkles,
  CreditCard,
  Settings,
  Menu,
  X,
  LogOut,
  HeartHandshake,
  Bell,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";

type PlannerNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: PlannerNavItem[] = [
  { href: "/planner/overview", label: "Overview", icon: <LayoutDashboard size={20} /> },
  { href: "/planner/clients", label: "Clients", icon: <Users size={20} /> },
  { href: "/planner/events", label: "Events", icon: <CalendarDays size={20} /> },
  { href: "/planner/tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
  { href: "/planner/bookings", label: "Bookings", icon: <Briefcase size={20} /> },
  { href: "/planner/invitations", label: "Invitations", icon: <Mail size={20} /> },
  { href: "/planner/budget", label: "Budget", icon: <Wallet size={20} /> },
  { href: "/planner/ai", label: "AI", icon: <Sparkles size={20} /> },
  { href: "/planner/billing", label: "Billing", icon: <CreditCard size={20} /> },
  { href: "/planner/settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function PlannerWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
    [pathname]
  );

  const navLink = (item: PlannerNavItem, onNavigate?: () => void) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
          isActive
            ? "bg-primary text-white shadow-lg shadow-primary/30"
            : "text-slate-500 hover:bg-slate-50 hover:text-charcoal"
        }`}
      >
        <div className="flex-shrink-0">{item.icon}</div>
        {(sidebarOpen || onNavigate) && <span className="text-sm font-medium">{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-cream font-roboto text-charcoal">
      {/* Desktop sidebar */}
      <aside
        className={`fixed z-40 hidden h-full flex-col border-r border-slate-200 bg-white transition-all duration-300 md:flex ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-20 items-center border-b border-slate-100 px-6">
          <Link href="/planner/overview" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <HeartHandshake size={20} />
            </div>
            {sidebarOpen && (
              <span className="whitespace-nowrap font-playfair text-lg font-bold text-charcoal">
                Planner Pro
              </span>
            )}
          </Link>
        </div>
        <nav className="flex-grow space-y-1 overflow-y-auto px-4 py-6">
          {NAV_ITEMS.map((item) => navLink(item))}
        </nav>
        <div className="mt-auto border-t border-slate-100 p-4">
          <button
            onClick={logOut}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-red-500 transition-all hover:bg-red-50"
          >
            <LogOut size={20} className="flex-shrink-0 transition-transform group-hover:rotate-12" />
            {sidebarOpen && <span className="text-sm font-semibold">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-2 text-white">
                  <HeartHandshake size={18} />
                </div>
                <p className="font-playfair font-bold">Planner Pro</p>
              </div>
              <button className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setMobileNavOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {NAV_ITEMS.map((item) => navLink(item, () => setMobileNavOpen(false)))}
            </nav>
            <div className="border-t border-slate-100 p-4">
              <button
                onClick={logOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div
        className={`flex min-w-0 flex-grow flex-col transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md md:h-20 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.innerWidth >= 768 ? setSidebarOpen(!sidebarOpen) : setMobileNavOpen(true))}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              <Menu size={20} className="md:hidden" />
              <span className="hidden md:inline">{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</span>
            </button>
            <p className="font-semibold text-charcoal md:hidden">{activeItem?.label ?? "Planner"}</p>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="relative p-2 text-slate-400 transition-colors hover:text-primary">
              <Bell size={22} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-charcoal">{user?.displayName || "Wedding Planner"}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Planner Account</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-accent shadow-inner shadow-black/10" />
            </div>
            <button
              onClick={logOut}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 md:hidden"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
