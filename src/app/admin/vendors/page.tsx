"use client";

import { ShieldAlert } from "lucide-react";
import { VendorApprovalQueue } from "@/modules/admin/VendorApprovalQueue";
import { PageHeader, Badge } from "@/shared/components/ui";

export default function AdminVendorsPage() {
  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <PageHeader
        title="Vendor KYB queue"
        description="Approve vendors after reviewing business credentials, portfolio, and contact details. Rejected applications stay off the marketplace."
        badge={
          <Badge variant="accent" className="inline-flex items-center gap-1.5">
            <ShieldAlert size={12} aria-hidden />
            Trust & safety
          </Badge>
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "KYB queue" },
        ]}
      />

      <VendorApprovalQueue />
    </div>
  );
}
