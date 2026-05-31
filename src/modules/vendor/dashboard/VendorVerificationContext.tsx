"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getVendorBusinessProfile,
  VendorBusinessProfile,
} from "@/shared/lib/api/vendors";

export type VendorVerificationStatus = "Pending" | "Verified" | "Rejected";

type VendorVerificationContextValue = {
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
  const { user } = useAuth();
  const [profile, setProfile] = useState<VendorBusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const data = await getVendorBusinessProfile(token);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    void refreshProfile();
  }, [refreshProfile]);

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
