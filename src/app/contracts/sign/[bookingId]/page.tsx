"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ContractSignPanel } from "@/modules/contracts/ContractSignPanel";
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

export default function ContractSignPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const backHref = eventId ? `/events/${eventId}/vendors` : "/dashboard";

  return (
    <RegalFrostShell mesh className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-lg space-y-6">
        <Link href={backHref} className={cn(rf.btnGhost, "inline-flex gap-1 text-sm")}>
          <ChevronLeft size={16} aria-hidden />
          Back to vendors
        </Link>
        <ContractSignPanel bookingId={bookingId} eventId={eventId} />
      </div>
    </RegalFrostShell>
  );
}
