"use client";

import { useEffect, useState } from "react";
import { getVendors, Vendor } from "@/shared/lib/api/vendors";

export function usePublicVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getVendors();
        setVendors(data);
      } catch (error) {
        console.error("Failed to load vendors:", error);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { vendors, loading };
}
