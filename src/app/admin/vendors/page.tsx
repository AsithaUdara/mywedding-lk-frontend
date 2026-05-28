"use client";

import { VendorApprovalQueue } from "@/modules/admin/VendorApprovalQueue";

export default function AdminVendorsPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="border border-neutral-300 bg-white px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Trust & safety</p>
        <h1 className="text-base font-bold text-neutral-900">Vendor KYB queue</h1>
        <p className="text-[11px] text-neutral-600">
          Approve vendors after reviewing business credentials. Rejected applications stay off the marketplace.
        </p>
      </div>

      <VendorApprovalQueue />
    </div>
  );
}
