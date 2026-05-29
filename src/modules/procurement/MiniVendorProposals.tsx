"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getVendorShortlist,
  type VendorShortlistItem,
} from "@/shared/lib/api/vendorShortlist";
import { cp } from "@/modules/client/client-theme";
import { cn } from "@/shared/lib/cn";
import {
  shortlistStatusBadgeKey,
  shortlistStatusLabel,
} from "@/modules/procurement/shortlist-utils";
import { Badge } from "@/shared/components/ui";

export function MiniVendorProposals({ eventId }: { eventId: string }) {
  const { user } = useAuth();
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
    <div className={cn(cp.cardPad, "flex h-full flex-col")}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Store className="text-primary" size={20} aria-hidden />
          </div>
          <div>
            <h3 className="font-playfair text-lg font-bold text-foreground">Vendor proposals</h3>
            <p className="text-xs text-muted-foreground">From your planner</p>
          </div>
        </div>
        <Link
          href={`/events/${eventId}/vendors`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading proposals…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Your planner has not shared vendor proposals yet.
        </p>
      ) : (
        <ul className="space-y-3 flex-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border bg-muted/20 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {item.vendorBusinessName ?? "Vendor"}
                </p>
                <Badge variant="status" status={shortlistStatusBadgeKey(item.status)}>
                  {shortlistStatusLabel(item.status)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {item.serviceName}
              </p>
            </li>
          ))}
        </ul>
      )}

      {(pendingReview > 0 || awaitingPayment > 0) && (
        <Link
          href={`/events/${eventId}/vendors`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          {pendingReview > 0
            ? `${pendingReview} awaiting your review`
            : `${awaitingPayment} ready for deposit`}
          <ArrowRight size={14} aria-hidden />
        </Link>
      )}
    </div>
  );
}
