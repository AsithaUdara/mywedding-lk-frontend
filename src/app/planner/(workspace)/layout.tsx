"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarRange,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Plus,
  Settings,
  Sparkles,
  Users,
  Bell,
} from "lucide-react";
import {
  PlannerNavGroup,
  PlannerWorkspaceShell,
} from "@/shared/components/layout/PlannerWorkspaceShell";
import { Button } from "@/shared/components/ui";

const NAV_GROUPS: PlannerNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/planner/dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
      { href: "/planner/clients", label: "Clients", icon: <FolderKanban size={18} /> },
      { href: "/planner/tasks", label: "Timeline", icon: <CalendarRange size={18} /> },
      { href: "/planner/events", label: "Events", icon: <Users size={18} /> },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/planner/bookings", label: "Bookings", icon: <ClipboardCheck size={18} /> },
      { href: "/planner/procurement", label: "Procurement", icon: <ClipboardList size={18} /> },
      { href: "/planner/invitations", label: "Inbox", icon: <Inbox size={18} /> },
      { href: "/planner/budget", label: "Revenue", icon: <CircleDollarSign size={18} /> },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/planner/ai", label: "Copilot", icon: <Sparkles size={18} /> },
      { href: "/planner/billing", label: "Plan & billing", icon: <BadgeCheck size={18} /> },
      { href: "/planner/settings", label: "Settings", icon: <Settings size={18} /> },
    ],
  },
];

export default function PlannerWorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlannerWorkspaceShell
      navGroups={NAV_GROUPS}
      sidebarFooter={
        <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 via-card to-accent/10 p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Automation</p>
          <p className="mt-1 text-sm font-semibold text-foreground">AI Copilot</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Draft inquiry emails and turn meeting notes into tasks.
          </p>
          <Link
            href="/planner/ai"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity duration-200 hover:opacity-90"
          >
            Open copilot
            <ArrowUpRight size={12} aria-hidden />
          </Link>
        </div>
      }
      topBarActions={
        <>
          <Button href="/planner/events" size="sm" className="hidden md:inline-flex">
            <Plus size={14} aria-hidden />
            New event
          </Button>
          <button
            type="button"
            className="relative rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors duration-200 hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-card bg-primary" />
          </button>
        </>
      }
    >
      {children}
    </PlannerWorkspaceShell>
  );
}
