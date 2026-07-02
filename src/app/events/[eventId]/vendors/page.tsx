"use client";

import React, { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VendorShortlistPanel } from "@/modules/procurement/VendorShortlistPanel";
import { GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { eventWorkspace } from "@/modules/events/event-workspace";

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
    <div className={eventWorkspace.pageEnter}>
      <GlassSectionCard
        title="Vendor proposals"
        subtitle="Review options from your planner and approve vendors for your wedding."
      >
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          }
        >
          <EventVendorsContent eventId={eventId} />
        </Suspense>
      </GlassSectionCard>
    </div>
  );
}
