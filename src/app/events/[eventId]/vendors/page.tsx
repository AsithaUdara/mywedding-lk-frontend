"use client";

import React, { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Store } from "lucide-react";
import { VendorShortlistPanel } from "@/modules/procurement/VendorShortlistPanel";
import { cp } from "@/modules/client/client-theme";
import { cn } from "@/shared/lib/cn";

function EventVendorsContent({ eventId }: { eventId: string }) {
  const searchParams = useSearchParams();
  const pollBookingId = searchParams.get("bookingId");
  const paymentReturn = searchParams.get("payment") === "return";

  return (
    <VendorShortlistPanel
      eventId={eventId}
      mode="client"
      pollBookingId={paymentReturn && pollBookingId ? pollBookingId : null}
    />
  );
}

export default function EventVendorsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={cn(cp.panel)}>
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Store className="text-primary" size={24} strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <h2 className={cp.sectionTitle}>Vendor proposals</h2>
            <p className={cp.muted}>
              Review options from your planner and approve vendors for your wedding.
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        >
          <EventVendorsContent eventId={eventId} />
        </Suspense>
      </div>
    </div>
  );
}
