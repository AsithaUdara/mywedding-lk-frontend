"use client";

import Link from "next/link";
import { PlatformAnalyticsDashboard } from "@/modules/admin/PlatformAnalyticsDashboard";
import { VendorApprovalQueue } from "@/modules/admin/VendorApprovalQueue";

export default function AdminHomePage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2 border border-neutral-300 bg-white px-3 py-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Platform ops</p>
          <h1 className="text-base font-bold text-neutral-900">Admin dashboard</h1>
          <p className="text-[11px] text-neutral-600">
            Financial health, planner growth, and vendor KYB verification.
          </p>
        </div>
        <Link
          href="/admin/vendors"
          className="border border-neutral-400 bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-800 hover:bg-neutral-200"
        >
          Full KYB queue →
        </Link>
      </div>

      <PlatformAnalyticsDashboard />

      <VendorApprovalQueue compact />
    </div>
  );
}
