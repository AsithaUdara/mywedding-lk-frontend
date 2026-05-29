"use client";

import { Wallet } from "lucide-react";
import { CommissionsPayoutQueue } from "@/modules/admin/CommissionsPayoutQueue";
import { Badge, PageHeader } from "@/shared/components/ui";

export default function AdminCommissionsPage() {
  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <PageHeader
        title="Commission payouts"
        description="Review unsettled vendor payouts from confirmed bookings and mark them settled after bank transfer."
        badge={
          <Badge variant="accent" className="inline-flex items-center gap-1.5">
            <Wallet size={12} aria-hidden />
            Financials
          </Badge>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Commissions" },
        ]}
      />

      <CommissionsPayoutQueue />
    </div>
  );
}
