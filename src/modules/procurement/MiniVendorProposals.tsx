"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, FileSignature, HandCoins, Inbox } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getVendorShortlist,
  type VendorShortlistItem,
} from "@/shared/lib/api/vendorShortlist";
import {
  shortlistStatusBadgeKey,
  shortlistStatusLabel,
  clientCanPayDeposit,
  clientNeedsContractSignature,
} from "@/modules/procurement/shortlist-utils";
import { getStatusBadgeClass } from "@/shared/components/ui";
import { GlassButton, GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import { useEventBranding } from "@/modules/events/EventBrandingProvider";
import { EventPlannerBrand } from "@/modules/events/EventPlannerBrand";
import { VENDOR_PROPOSALS_UPDATED } from "@/shared/lib/vendorProposalEvents";
import { VendorInsightLinks } from "@/modules/procurement/VendorInsightLinks";

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

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ eventId?: string }>).detail;
      if (!detail?.eventId || detail.eventId === eventId) {
        void load();
      }
    };

    window.addEventListener(VENDOR_PROPOSALS_UPDATED, handleUpdate);
    return () => window.removeEventListener(VENDOR_PROPOSALS_UPDATED, handleUpdate);
  }, [eventId, load]);

  const pendingReview = items.filter((i) => i.status === "SentToClient").length;
  const awaitingSignature = items.filter((i) => clientNeedsContractSignature(i)).length;
  const awaitingPayment = items.filter((i) => clientCanPayDeposit(i)).length;
  const actionRequiredCount = pendingReview + awaitingSignature + awaitingPayment;

  const ctaLabel =
    pendingReview > 0
      ? `${pendingReview} awaiting your review`
      : awaitingSignature > 0
      ? `${awaitingSignature} contract${awaitingSignature === 1 ? "" : "s"} to sign`
      : `${awaitingPayment} ready for deposit`;

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
        <div className="flex flex-1 flex-col gap-3">
          <div className="h-20 animate-pulse rounded-xl border border-white/55 bg-white/35" />
          <div className="h-16 animate-pulse rounded-xl border border-white/55 bg-white/30" />
          <div className="h-16 animate-pulse rounded-xl border border-white/55 bg-white/30" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/60 bg-white/25 p-5 text-center">
          <p className={vg.subtitle}>Your planner has not shared vendor proposals yet.</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <div className="rounded-xl border border-white/60 bg-white/35 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <p className={cn("text-sm font-semibold", vg.body)}>Action needed</p>
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {actionRequiredCount}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/55 bg-white/35 p-2.5">
                <p className={cn("mb-1 inline-flex items-center gap-1", vg.label)}>
                  <Inbox size={12} aria-hidden />
                  Review
                </p>
                <p className="text-base font-semibold tabular-nums text-foreground">{pendingReview}</p>
              </div>
              <div className="rounded-lg border border-white/55 bg-white/35 p-2.5">
                <p className={cn("mb-1 inline-flex items-center gap-1", vg.label)}>
                  <FileSignature size={12} aria-hidden />
                  Sign
                </p>
                <p className="text-base font-semibold tabular-nums text-foreground">{awaitingSignature}</p>
              </div>
              <div className="rounded-lg border border-white/55 bg-white/35 p-2.5">
                <p className={cn("mb-1 inline-flex items-center gap-1", vg.label)}>
                  <HandCoins size={12} aria-hidden />
                  Pay
                </p>
                <p className="text-base font-semibold tabular-nums text-foreground">{awaitingPayment}</p>
              </div>
            </div>
          </div>

          <ul className="flex flex-1 flex-col space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-white/60 bg-white/40 px-3.5 py-3 backdrop-blur-sm transition-colors hover:bg-white/55"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={cn("line-clamp-1 font-semibold", vg.body)}>
                      {item.vendorBusinessName ?? "Vendor"}
                    </p>
                    <p className={cn("line-clamp-1 mt-0.5", vg.caption)}>{item.serviceName}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      getStatusBadgeClass(shortlistStatusBadgeKey(item.status, item))
                    )}
                  >
                    {shortlistStatusLabel(item.status, item)}
                  </span>
                </div>
                <VendorInsightLinks
                  vendorUserId={item.vendorUserId}
                  vendorServiceId={item.vendorServiceId}
                  className="mt-2.5"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {actionRequiredCount > 0 ? (
        <GlassButton href={`/events/${eventId}/vendors`} variant="primary" className="mt-4 gap-1.5">
          <AlertTriangle size={14} aria-hidden />
          {ctaLabel}
          <ArrowRight size={14} aria-hidden />
        </GlassButton>
      ) : null}
    </GlassSectionCard>
  );
}
