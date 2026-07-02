"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getEvents, getOrganizers } from "@/shared/lib/api/events";

export function useEventPermission(eventId: string) {
  const { user } = useAuth();
  const [permissionLevel, setPermissionLevel] = useState("");
  const [canBook, setCanBook] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || !eventId) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const [organizers, events] = await Promise.all([
        getOrganizers(token, eventId),
        getEvents(token),
      ]);
      const self = organizers.find((o) => o.userId === user.uid);
      setPermissionLevel(self?.permissionLevel ?? "");
      const event = events.find((e) => e.id === eventId);
      setCanBook(Boolean(event?.canBook));
    } catch {
      setPermissionLevel("");
      setCanBook(false);
    } finally {
      setLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isViewer = permissionLevel === "Viewer";

  return {
    permissionLevel,
    isViewer,
    canEdit: !isViewer && permissionLevel !== "",
    canBook,
    loading,
    refresh,
  };
}
