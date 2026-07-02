"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlatformAnalytics, type PlatformAnalytics } from "@/shared/lib/api/admin";

export function usePlatformAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        const token = await user.getIdToken();
        const analytics = await getPlatformAnalytics(token);
        setData(analytics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load platform analytics.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, refreshing, error, reload: () => load(true) };
}
