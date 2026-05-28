"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Inbox, LineChart } from "lucide-react";
import { AnalyticsDashboard } from "@/modules/vendor/dashboard/AnalyticsDashboard";
import { InquiryManagementInbox } from "@/modules/vendor/dashboard/InquiryManagementInbox";
import { AvailabilityCalendar } from "@/modules/vendor/dashboard/AvailabilityCalendar";
import { bento } from "@/modules/vendor/dashboard/bento";

const QUICK_LINKS = [
  {
    href: "/vendor/dashboard/analytics",
    label: "Analytics",
    description: "Profile views, inquiries, win rate",
    icon: LineChart,
    tone: "bg-indigo-50 text-indigo-600",
  },
  {
    href: "/vendor/dashboard/inquiries",
    label: "Inquiry inbox",
    description: "CRM · Generate official quotes",
    icon: Inbox,
    tone: "bg-fuchsia-50 text-fuchsia-600",
  },
  {
    href: "/vendor/dashboard/availability",
    label: "Availability",
    description: "Block dates · show booked days",
    icon: CalendarDays,
    tone: "bg-emerald-50 text-emerald-600",
  },
];

export default function VendorDashboardOverview() {
  return (
    <div className={`${bento.page} bg-slate-50/50`}>
      <header className={bento.card}>
        <p className={bento.label}>Vendor command center</p>
        <h1 className={`mt-2 font-playfair text-3xl font-bold tracking-tight text-slate-900 md:text-4xl`}>
          Dashboard
        </h1>
        <p className={`mt-2 max-w-2xl ${bento.subtitle}`}>
          Your digital storefront and CRM — track reach, respond to planner inquiries, and manage availability.
          Metrics below are mocked for Phase 6.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm"
            >
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
                <item.icon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">{item.label}</p>
                <p className="truncate text-xs text-slate-500">{item.description}</p>
              </div>
              <ArrowRight
                size={16}
                className="flex-shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
              />
            </Link>
          ))}
        </div>
      </header>

      <AnalyticsDashboard compact />

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className={bento.label}>CRM preview</p>
              <h2 className="text-lg font-bold text-slate-900">Inquiry inbox</h2>
            </div>
            <Link href="/vendor/dashboard/inquiries" className={bento.pillBtnOutline}>
              Open full inbox
              <ArrowRight size={14} />
            </Link>
          </div>
          <InquiryManagementInbox embedded />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className={bento.label}>Scheduling preview</p>
              <h2 className="text-lg font-bold text-slate-900">Availability</h2>
            </div>
            <Link href="/vendor/dashboard/availability" className={bento.pillBtnOutline}>
              Open calendar
              <ArrowRight size={14} />
            </Link>
          </div>
          <AvailabilityCalendar embedded />
        </div>
      </section>
    </div>
  );
}
