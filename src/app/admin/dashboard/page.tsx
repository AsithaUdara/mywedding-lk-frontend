"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { PlatformAnalyticsDashboard } from "@/modules/admin/PlatformAnalyticsDashboard";
import { VendorApprovalQueue } from "@/modules/admin/VendorApprovalQueue";

export default function AdminDashboardPage() {
  return (
    <div className="relative mx-auto max-w-[1400px] space-y-8 font-roboto lg:space-y-10">
      <div
        className="pointer-events-none absolute -right-8 top-0 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-40 h-56 w-56 rounded-full bg-amber-100/40 blur-3xl"
        aria-hidden
      />

      <header className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out">
            <Sparkles size={14} className="text-violet-500/90" />
            Platform operations
          </p>
          <h1 className="font-playfair text-4xl font-bold tracking-tight text-charcoal sm:text-5xl">
            Admin dashboard
          </h1>
          <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
            Financial health, planner growth, and vendor KYB — curated for internal oversight.
          </p>
        </div>

        <Link
          href="/admin/vendors"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-neutral-900 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30"
        >
          <ShieldCheck size={16} />
          Full KYB queue
          <ArrowRight
            size={16}
            className="transition-transform duration-300 ease-in-out group-hover:translate-x-0.5"
          />
        </Link>
      </header>

      <PlatformAnalyticsDashboard />

      <VendorApprovalQueue compact />
    </div>
  );
}
