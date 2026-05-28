"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Inbox, LineChart, Sparkles, Store } from "lucide-react";
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
    tone: "bg-violet-100/80 text-violet-800/90",
  },
  {
    href: "/vendor/dashboard/inquiries",
    label: "Inquiry inbox",
    description: "CRM · Generate official quotes",
    icon: Inbox,
    tone: "bg-rose-100/80 text-rose-800/90",
  },
  {
    href: "/vendor/dashboard/availability",
    label: "Availability",
    description: "Block dates · show booked days",
    icon: CalendarDays,
    tone: "bg-amber-100/80 text-amber-900/80",
  },
];

export default function VendorDashboardOverview() {
  return (
    <div className={`relative ${bento.page}`}>
      <div
        className="pointer-events-none absolute -right-12 top-0 h-72 w-72 rounded-full bg-rose-200/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-64 h-64 w-64 rounded-full bg-violet-100/40 blur-3xl"
        aria-hidden
      />

      <header className={`relative ${bento.card}`}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out">
              <Sparkles size={14} className="text-rose-400/90" />
              Vendor command center
            </p>
            <h1 className="font-playfair text-4xl font-bold tracking-tight text-charcoal md:text-5xl">
              Dashboard
            </h1>
            <p className={bento.subtitle}>
              Your digital storefront and CRM — track reach, respond to planner inquiries, and
              manage availability. Metrics below are mocked for Phase 6.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/50 px-4 py-3 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-md sm:px-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-charcoal text-white shadow-sm">
              <Store size={20} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Storefront
              </p>
              <p className="text-sm font-semibold text-charcoal">Live on MyWedding.lk</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 rounded-3xl border border-white/20 bg-white/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-white/40 hover:bg-white/90 hover:shadow-xl hover:shadow-primary/10 sm:p-6"
            >
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ease-in-out group-hover:scale-105 ${item.tone}`}
              >
                <item.icon size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold tracking-tight text-charcoal">{item.label}</p>
                <p className="mt-0.5 truncate text-sm text-slate-500">{item.description}</p>
              </div>
              <ArrowRight
                size={16}
                className="flex-shrink-0 text-slate-300 transition-all duration-300 ease-in-out group-hover:translate-x-0.5 group-hover:text-charcoal"
              />
            </Link>
          ))}
        </div>
      </header>

      <section className="relative">
        <AnalyticsDashboard compact />
      </section>

      <section className="grid gap-8 xl:grid-cols-2 xl:gap-10">
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4 px-1">
            <div>
              <p className={bento.label}>CRM preview</p>
              <h2 className={bento.sectionTitle}>Inquiry inbox</h2>
              <p className="mt-1 text-sm text-slate-500">Planner messages & quote generation</p>
            </div>
            <Link href="/vendor/dashboard/inquiries" className={bento.pillBtnOutline}>
              Open full inbox
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className={`${bento.glassPanel} overflow-hidden`}>
            <InquiryManagementInbox embedded />
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4 px-1">
            <div>
              <p className={bento.label}>Scheduling preview</p>
              <h2 className={bento.sectionTitle}>Availability</h2>
              <p className="mt-1 text-sm text-slate-500">Booked and blocked dates at a glance</p>
            </div>
            <Link href="/vendor/dashboard/availability" className={bento.pillBtnOutline}>
              Open calendar
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className={`${bento.glassPanel} overflow-hidden`}>
            <AvailabilityCalendar embedded />
          </div>
        </div>
      </section>
    </div>
  );
}
