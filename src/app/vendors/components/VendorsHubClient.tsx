"use client";

import React, { createContext, useContext } from "react";
import { Vendor } from "@/shared/lib/api/vendors";
import { usePublicVendors } from "./usePublicVendors";

interface VendorsHubContextValue {
  vendors: Vendor[];
  loading: boolean;
}

const VendorsHubContext = createContext<VendorsHubContextValue>({
  vendors: [],
  loading: true,
});

export function VendorsHubProvider({ children }: { children: React.ReactNode }) {
  const { vendors, loading } = usePublicVendors();
  return (
    <VendorsHubContext.Provider value={{ vendors, loading }}>
      {children}
    </VendorsHubContext.Provider>
  );
}

export function useVendorsHub() {
  return useContext(VendorsHubContext);
}
