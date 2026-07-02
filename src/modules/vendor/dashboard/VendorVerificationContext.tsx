"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useVendorBusinessProfileQuery } from "@/shared/hooks/query/useVendorQueries";
import type { VendorBusinessProfile } from "@/shared/lib/api/vendors";

export type VendorVerificationStatus = "Pending" | "Verified" | "Rejected";

export type VendorVerificationContextValue = {
  profile: VendorBusinessProfile | null;
  verificationStatus: VendorVerificationStatus;
  isVerified: boolean;
  isPending: boolean;
  isRejected: boolean;
  canPublishListings: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const VendorVerificationContext = createContext<VendorVerificationContextValue | null>(
  null
);

function normalizeStatus(status: string | undefined): VendorVerificationStatus {
  if (status === "Verified" || status === "Rejected") return status;
  return "Pending";
}

export function VendorVerificationProvider({ children }: { children: React.ReactNode }) {
  const { data: profile = null, isLoading: loading, refetch } = useVendorBusinessProfileQuery();

  const refreshProfile = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const verificationStatus = normalizeStatus(profile?.verificationStatus);
  const isVerified = verificationStatus === "Verified";
  const isPending = verificationStatus === "Pending";
  const isRejected = verificationStatus === "Rejected";

  const value = useMemo(
    () => ({
      profile,
      verificationStatus,
      isVerified,
      isPending,
      isRejected,
      canPublishListings: isVerified,
      loading,
      refreshProfile,
    }),
    [
      profile,
      verificationStatus,
      isVerified,
      isPending,
      isRejected,
      loading,
      refreshProfile,
    ]
  );

  return (
    <VendorVerificationContext.Provider value={value}>
      {children}
    </VendorVerificationContext.Provider>
  );
}

export function useVendorVerification() {
  const context = useContext(VendorVerificationContext);
  if (!context) {
    throw new Error("useVendorVerification must be used within VendorVerificationProvider");
  }
  return context;
}
