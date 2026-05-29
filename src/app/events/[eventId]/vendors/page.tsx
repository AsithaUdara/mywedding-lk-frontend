"use client";

import React, { use } from "react";
import { Store } from "lucide-react";
import { VendorShortlistPanel } from "@/modules/procurement/VendorShortlistPanel";
import { cp } from "@/modules/client/client-theme";
import { cn } from "@/shared/lib/cn";

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

        <VendorShortlistPanel eventId={eventId} mode="client" />
      </div>
    </div>
  );
}
