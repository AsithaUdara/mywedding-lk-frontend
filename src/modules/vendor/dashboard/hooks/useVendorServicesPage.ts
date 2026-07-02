"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  deleteVendorDashboardService,
  updateVendorDashboardService,
  type VendorDashboardService,
} from "@/shared/lib/api/vendors";
import { useVendorServicesQuery } from "@/shared/hooks/query/useVendorQueries";
import { useVendorVerification } from "@/modules/vendor/dashboard/VendorVerificationContext";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import {
  buildServiceUpdatePayload,
  computeServiceCatalogStats,
  filterServiceCatalog,
  type ServiceCatalogFilter,
  type VendorService,
} from "@/modules/vendor/dashboard/vendorServiceHelpers";

export function useVendorServicesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { canPublishListings, isVerified } = useVendorVerification();

  const {
    data: services = [],
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useVendorServicesQuery();

  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catalogFilter, setCatalogFilter] = useState<ServiceCatalogFilter>("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceIdToDelete, setServiceIdToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (queryError) setError(queryError.message);
  }, [queryError]);

  const stats = useMemo(() => computeServiceCatalogStats(services), [services]);
  const filteredServices = useMemo(
    () => filterServiceCatalog(services, catalogFilter, search),
    [services, catalogFilter, search]
  );

  const showInitialSkeleton = loading;
  const isRefreshing = isFetching && !loading;

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const openDeleteModal = useCallback((id: string) => {
    setServiceIdToDelete(id);
    setDeleteError(null);
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setDeleteError(null);
  }, []);

  const toggleActive = useCallback(
    async (service: VendorService) => {
      if (!user || statusUpdatingId) return;

      const nextActive = !service.isActive;
      if (nextActive && !canPublishListings) {
        setError("Your account must be verified before publishing listings to the marketplace.");
        return;
      }

      const queryKey = queryKeys.vendor.services();
      const previous = queryClient.getQueryData<VendorDashboardService[]>(queryKey);

      if (previous) {
        queryClient.setQueryData(
          queryKey,
          previous.map((item) =>
            item.id === service.id ? { ...item, isActive: nextActive } : item
          )
        );
      }

      try {
        setStatusUpdatingId(service.id);
        setError(null);
        const token = await user.getIdToken();
        await updateVendorDashboardService(
          token,
          service.id,
          buildServiceUpdatePayload(service, nextActive)
        );
        void queryClient.invalidateQueries({ queryKey });
      } catch (err) {
        if (previous) queryClient.setQueryData(queryKey, previous);
        setError(err instanceof Error ? err.message : "Failed to update listing visibility.");
      } finally {
        setStatusUpdatingId(null);
      }
    },
    [user, statusUpdatingId, canPublishListings, queryClient]
  );

  const confirmDelete = useCallback(async () => {
    if (!user || !serviceIdToDelete) return;

    const queryKey = queryKeys.vendor.services();
    const previous = queryClient.getQueryData<VendorDashboardService[]>(queryKey);

    if (previous) {
      queryClient.setQueryData(
        queryKey,
        previous.filter((item) => item.id !== serviceIdToDelete)
      );
    }

    try {
      const token = await user.getIdToken();
      await deleteVendorDashboardService(token, serviceIdToDelete);
      setDeleteModalOpen(false);
      setServiceIdToDelete(null);
      setDeleteError(null);
      void queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      if (previous) queryClient.setQueryData(queryKey, previous);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete service.");
    }
  }, [user, serviceIdToDelete, queryClient]);

  const needsPublishAttention = isVerified && stats.total > 0 && stats.live === 0;

  return {
    services,
    filteredServices,
    stats,
    canPublishListings,
    needsPublishAttention,
    search,
    setSearch,
    catalogFilter,
    setCatalogFilter,
    deleteModalOpen,
    deleteError,
    statusUpdatingId,
    showInitialSkeleton,
    isRefreshing,
    error,
    reload,
    openDeleteModal,
    closeDeleteModal,
    toggleActive,
    confirmDelete,
  };
}
