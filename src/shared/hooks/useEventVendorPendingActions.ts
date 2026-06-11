"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getVendorShortlist,
  type VendorShortlistItem,
} from "@/shared/lib/api/vendorShortlist";
import { VENDOR_PROPOSALS_UPDATED } from "@/shared/lib/vendorProposalEvents";
import {
  clientCanPayDeposit,
  clientNeedsContractSignature,
} from "@/modules/procurement/shortlist-utils";

export type EventVendorPendingActions = {
  loading: boolean;
  items: VendorShortlistItem[];
  pendingReview: number;
  awaitingBookingRequest: number;
  awaitingContractSignature: number;
  awaitingDeposit: number;
  totalPending: number;
  refresh: () => Promise<void>;
};

export function useEventVendorPendingActions(eventId: string): EventVendorPendingActions {
  const { user } = useAuth();
  const [items, setItems] = useState<VendorShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || !eventId) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const data = await getVendorShortlist(token, eventId);
      setItems(data.filter((item) => item.status !== "Draft"));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ eventId?: string }>).detail;
      if (!detail?.eventId || detail.eventId === eventId) {
        void refresh();
      }
    };

    const handleFocus = () => {
      void refresh();
    };

    window.addEventListener(VENDOR_PROPOSALS_UPDATED, handleUpdate);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener(VENDOR_PROPOSALS_UPDATED, handleUpdate);
      window.removeEventListener("focus", handleFocus);
    };
  }, [eventId, refresh]);

  const counts = useMemo(() => {
    const pendingReview = items.filter((item) => item.status === "SentToClient").length;
    const awaitingBookingRequest = items.filter((item) => item.status === "ClientApproved").length;
    const awaitingContractSignature = items.filter((item) => clientNeedsContractSignature(item)).length;
    const awaitingDeposit = items.filter((item) => clientCanPayDeposit(item)).length;

    return {
      pendingReview,
      awaitingBookingRequest,
      awaitingContractSignature,
      awaitingDeposit,
      totalPending: pendingReview + awaitingContractSignature + awaitingDeposit,
    };
  }, [items]);

  return {
    loading,
    items,
    refresh,
    ...counts,
  };
}
