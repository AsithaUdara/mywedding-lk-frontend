"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getVendorShortlist,
  type VendorShortlistItem,
} from "@/shared/lib/api/vendorShortlist";
import {
  shortlistStatusBadgeKey,
  shortlistStatusLabel,
} from "@/modules/procurement/shortlist-utils";
import { getStatusBadgeClass } from "@/shared/components/ui";
import { GlassButton, GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import { useEventBranding } from "@/modules/events/EventBrandingProvider";
import { EventPlannerBrand } from "@/modules/events/EventPlannerBrand";

export function MiniVendorProposals({ eventId, className }: { eventId: string; className?: string }) {
  const { user } = useAuth();
  const { branding } = useEventBranding();
  const [items, setItems] = useState<VendorShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await getVendorShortlist(token, eventId);
      setItems(data.filter((i) => i.status !== "Draft").slice(0, 3));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  const pendingReview = items.filter((i) => i.status === "SentToClient").length;
  const awaitingPayment = items.filter((i) => i.status === "BookingAccepted").length;

  return (
    <GlassSectionCard
      className={className}
      title="Vendor proposals"
      subtitle={branding ? undefined : "From your planner"}
      action={
        <GlassButton href={`/events/${eventId}/vendors`} variant="ghost" className="gap-1">
          View all
          <ArrowRight size={14} aria-hidden />
        </GlassButton>
      }
    >
      {branding ? (
        <div className="mb-4">
          <EventPlannerBrand branding={branding} variant="card" />
        </div>
      ) : null}

      {loading ? (
        <p className={cn("flex flex-1 items-center", vg.subtitle)}>Loading proposals…</p>
      ) : items.length === 0 ? (
        <p className={cn("flex flex-1 items-center", vg.subtitle)}>
          Your planner has not shared vendor proposals yet.
        </p>
      ) : (
        <ul className="flex flex-1 flex-col space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-white/55 bg-white/35 px-3 py-2.5 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <p className={cn("line-clamp-1 font-medium", vg.body)}>
                  {item.vendorBusinessName ?? "Vendor"}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    getStatusBadgeClass(shortlistStatusBadgeKey(item.status))
                  )}
                >
                  {shortlistStatusLabel(item.status)}
                </span>
              </div>
              <p className={cn("line-clamp-1", vg.caption)}>{item.serviceName}</p>
            </li>
          ))}
        </ul>
      )}

      {(pendingReview > 0 || awaitingPayment > 0) && (
        <GlassButton href={`/events/${eventId}/vendors`} variant="primary" className="mt-4 gap-1.5">
          {pendingReview > 0
            ? `${pendingReview} awaiting your review`
            : `${awaitingPayment} ready for deposit`}
          <ArrowRight size={14} aria-hidden />
        </GlassButton>
      )}
    </GlassSectionCard>
  );
}
