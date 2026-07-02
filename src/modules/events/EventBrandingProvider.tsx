"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getEventById,
  mapEventDetail,
  type EventDetail,
  type EventPlannerBranding,
} from "@/shared/lib/api/events";

type EventBrandingContextValue = {
  event: EventDetail | null;
  branding: EventPlannerBranding | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const EventBrandingContext = createContext<EventBrandingContextValue | null>(null);

export function EventBrandingProvider({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setEvent(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const raw = await getEventById(token, eventId);
      setEvent(raw ? mapEventDetail(raw as Record<string, unknown>) : null);
    } catch {
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const branding = event?.plannerBranding ?? null;

  const value = useMemo(
    () => ({ event, branding, loading, refresh }),
    [event, branding, loading, refresh]
  );

  return <EventBrandingContext.Provider value={value}>{children}</EventBrandingContext.Provider>;
}

export function useEventBranding() {
  const ctx = useContext(EventBrandingContext);
  if (!ctx) {
    throw new Error("useEventBranding must be used within EventBrandingProvider");
  }
  return ctx;
}
