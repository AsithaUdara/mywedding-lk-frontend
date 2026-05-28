"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarRange,
  ChevronsLeftRightEllipsis,
  CircleDollarSign,
  ClipboardCheck,
  Command,
  FolderKanban,
  Inbox,
  Users,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  Settings,
  BadgeCheck,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";

type PlannerNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: PlannerNavItem[] = [
  { href: "/planner/dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
  { href: "/planner/clients", label: "Clients", icon: <FolderKanban size={18} /> },
  { href: "/planner/tasks", label: "Timeline", icon: <CalendarRange size={18} /> },
  { href: "/planner/events", label: "Events", icon: <Users size={18} /> },
  { href: "/planner/bookings", label: "Bookings", icon: <ClipboardCheck size={18} /> },
  { href: "/planner/invitations", label: "Inbox", icon: <Inbox size={18} /> },
  { href: "/planner/budget", label: "Revenue", icon: <CircleDollarSign size={18} /> },
  { href: "/planner/ai", label: "Copilot", icon: <Sparkles size={18} /> },
  { href: "/planner/billing", label: "Plan", icon: <BadgeCheck size={18} /> },
  { href: "/planner/settings", label: "Settings", icon: <Settings size={18} /> },
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
        className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all ${
          isActive
            ? "bg-[#111111] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
            : "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-[0_8px_20px_rgb(0,0,0,0.04)]"
        }`}
      >
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition ${
            isActive ? "bg-white/10" : "bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
          }`}
        >
          {item.icon}
        </div>
        {(sidebarOpen || onNavigate) && <span className="text-sm font-semibold tracking-tight">{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-roboto text-slate-900">
      {/* Desktop sidebar */}
      <aside
        className={`fixed z-40 hidden h-full flex-col border-r border-slate-200/70 bg-[#F9F9F8] transition-all duration-300 md:flex ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-20 items-center border-b border-slate-200/70 px-6">
          <Link href="/planner/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#111111] text-white shadow-[0_8px_20px_rgb(0,0,0,0.15)]">
              <Command size={18} />
            </div>
            {sidebarOpen && (
              <span className="whitespace-nowrap font-playfair text-lg font-bold tracking-tight text-slate-900">
                Planner Pro
              </span>
            )}
          </Link>
        </div>
        <div className="px-4 pt-5">
          {sidebarOpen && <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>}
        </div>
        <nav className="flex-grow space-y-1.5 overflow-y-auto px-4 py-4">
          {NAV_ITEMS.map((item) => navLink(item))}
        </nav>
        {sidebarOpen && (
          <div className="mx-4 mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Automation</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">AI Copilot Active</p>
            <p className="mt-1 text-xs text-slate-500">7 drafts generated today</p>
            <Link
              href="/planner/ai"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#111111] px-3 py-1.5 text-xs font-medium text-white"
            >
              Open copilot <ArrowUpRight size={12} />
            </Link>
          </div>
        )}
        <div className="mt-auto border-t border-slate-200/70 p-4">
          <button
            onClick={logOut}
            className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-red-500 transition-all hover:bg-red-50"
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
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-[#F9F9F8] shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#111111] p-2 text-white">
                  <Command size={16} />
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
            <div className="border-t border-slate-200 p-4">
              <button
                onClick={logOut}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3 text-sm font-semibold text-red-600"
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
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-2 md:flex">
              <Search size={14} className="text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Search clients, tasks, vendors...</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="hidden items-center gap-1 rounded-full bg-[#111111] px-4 py-2 text-xs font-medium text-white md:inline-flex">
              <Plus size={14} />
              New Client
            </button>
            <button className="relative rounded-full bg-slate-100 p-2 text-slate-400 transition-colors hover:text-slate-900">
              <Bell size={22} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
            </button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-charcoal">{user?.displayName || "Wedding Planner"}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Planner Account</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
                <ChevronsLeftRightEllipsis size={16} />
              </div>
            </div>
            <button
              onClick={logOut}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 md:hidden"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
