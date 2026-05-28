"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VendorApprovalQueue } from "@/modules/admin/VendorApprovalQueue";

export default function AdminVendorsPage() {
  return (
    <div className="relative mx-auto max-w-[1400px] space-y-8">
      <header className="space-y-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-300 ease-in-out hover:text-charcoal"
        >
          <ArrowLeft size={16} />
          Back to overview
        </Link>
        <div className="rounded-[2rem] border border-white/20 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Trust & safety</p>
          <h1 className="mt-2 font-playfair text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            Vendor KYB queue
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Approve vendors after reviewing business credentials. Rejected applications stay off the
            marketplace.
          </p>
        </div>
      </header>

      <VendorApprovalQueue />
    </div>
  );
}
