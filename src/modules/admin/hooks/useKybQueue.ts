"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPendingVendors,
  rejectVendor,
  verifyVendor,
  type PendingVendor,
} from "@/shared/lib/api/admin";

type ActionState = { id: string; type: "approve" | "reject" } | null;

export function useKybQueue() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setAction] = useState<ActionState>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!user) return;
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const token = await user.getIdToken();
        const data = await getPendingVendors(token);
        setVendors(data);
      } catch {
        setVendors([]);
        setError("Failed to load KYB queue.");
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

  const removeVendor = useCallback((vendorId: string) => {
    setVendors((prev) => prev.filter((v) => v.userId !== vendorId));
  }, []);

  const approve = useCallback(
    async (vendorId: string) => {
      if (!user) return;
      setAction({ id: vendorId, type: "approve" });
      setError(null);
      try {
        const token = await user.getIdToken();
        await verifyVendor(token, vendorId);
        removeVendor(vendorId);
      } catch {
        setError("Failed to approve vendor.");
      } finally {
        setAction(null);
      }
    },
    [user, removeVendor]
  );

  const reject = useCallback(
    async (vendorId: string, businessName: string) => {
      const confirmed = window.confirm(
        `Reject "${businessName}"? Vendor will not appear in the directory.`
      );
      if (!confirmed) return;

      if (!user) return;
      setAction({ id: vendorId, type: "reject" });
      setError(null);
      try {
        const token = await user.getIdToken();
        await rejectVendor(token, vendorId);
        removeVendor(vendorId);
      } catch {
        setError("Failed to reject vendor.");
      } finally {
        setAction(null);
      }
    },
    [user, removeVendor]
  );

  return {
    vendors,
    loading,
    refreshing,
    error,
    actionState,
    reload: () => load(true),
    approve,
    reject,
  };
}
