"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus, Package, Tag, LayoutGrid, Pencil } from "lucide-react";
import Image from "next/image";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { useAuth } from "@/shared/context/AuthContext";
import {
  deleteVendorDashboardService,
  getVendorDashboardServices,
  updateVendorDashboardService,
  VendorDashboardService,
} from "@/shared/lib/api/vendors";
import {
  DataTable,
  IconButton,
  InlineSpinner,
  MetricPill,
  RowActionsMenu,
  SearchField,
  StatusBadge,
  TableShell,
  Td,
  Th,
  ToggleSwitch,
} from "@/modules/vendor/dashboard/components";
import {
  EmptyState,
  ErrorBanner,
  formatLKR,
  IconCircle,
  LoadingState,
  PageHeader,
  SectionCard,
} from "@/modules/vendor/dashboard/ui";

export type VendorService = VendorDashboardService;

function buildServiceUpdatePayload(service: VendorService, isActive: boolean) {
  return {
    serviceName: service.serviceName,
    description: service.serviceDescription ?? "",
    basePrice: service.basePrice,
    pricingType: service.pricingType,
    categoryId: service.categoryId,
    isActive,
    primaryImageUrl: service.primaryImageUrl ?? null,
    galleryUrls: service.galleryUrls ?? [],
    tagline: service.tagline ?? undefined,
    listingDetailsJson: service.listingDetailsJson ?? undefined,
  };
}

export default function VendorServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceIdToDelete, setServiceIdToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const data = await getVendorDashboardServices(token);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const filteredServices = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return services;
    return services.filter(
      (service) =>
        service.serviceName.toLowerCase().includes(needle) ||
        service.categoryName.toLowerCase().includes(needle)
    );
  }, [services, search]);

  const handleDelete = (id: string) => {
    setServiceIdToDelete(id);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const handleToggleActive = async (service: VendorService) => {
    if (!user || statusUpdatingId) return;
    const nextActive = !service.isActive;
    try {
      setStatusUpdatingId(service.id);
      setError(null);
      const token = await user.getIdToken();
      await updateVendorDashboardService(
        token,
        service.id,
        buildServiceUpdatePayload(service, nextActive)
      );
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: nextActive } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing visibility.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!user || !serviceIdToDelete) return;
    try {
      const token = await user.getIdToken();
      await deleteVendorDashboardService(token, serviceIdToDelete);
      setServices((prev) => prev.filter((service) => service.id !== serviceIdToDelete));
      setDeleteModalOpen(false);
      setServiceIdToDelete(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete service.");
    }
  };

  const activeCount = services.filter((service) => service.isActive).length;
  const draftCount = services.length - activeCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Services"
        description="Manage listings couples see on search and your vendor profile. Publish when ready, or hide listings without deleting them."
        badge={`${activeCount} published · ${services.length} total`}
        action={
          <Link
            href="/vendor/dashboard/services/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            <Plus size={18} strokeWidth={2.5} />
            New listing
          </Link>
        }
      />

      {error && <ErrorBanner message={error} />}

      {!loading && services.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricPill label="Total listings" value={services.length} />
          <MetricPill label="Published" value={activeCount} tone="success" />
          <MetricPill label="Draft / hidden" value={draftCount} tone="muted" />
        </div>
      )}

      <SectionCard
        title="Service catalog"
        subtitle="Toggle visibility to show or hide listings on the marketplace"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by name or category..."
            className="w-full sm:max-w-md"
          />
          <p className="text-xs text-slate-500">
            {filteredServices.length} listing{filteredServices.length === 1 ? "" : "s"}
          </p>
        </div>

        {loading ? (
          <LoadingState label="Loading services..." />
        ) : filteredServices.length === 0 ? (
          <EmptyState
            title={services.length === 0 ? "No listings yet" : "No matching listings"}
            description={
              services.length === 0
                ? "Create your first listing with photos, pricing, and highlights — couples discover you from search and your profile."
                : "Try a different search term or clear the filter."
            }
            action={
              services.length === 0 ? (
                <Link
                  href="/vendor/dashboard/services/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <LayoutGrid size={18} />
                  Create listing
                </Link>
              ) : undefined
            }
          />
        ) : (
          <TableShell>
            <DataTable>
              <thead>
                <tr>
                  <Th>Service</Th>
                  <Th>Category</Th>
                  <Th>Pricing</Th>
                  <Th>Visibility</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => {
                  const isUpdating = statusUpdatingId === service.id;
                  return (
                    <tr key={service.id} className="group transition-colors hover:bg-slate-50/80">
                      <Td>
                        <div className="flex items-center gap-3">
                          {service.primaryImageUrl ? (
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                              <Image
                                src={service.primaryImageUrl}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <IconCircle icon={Package} theme="primary" size={18} className="h-12 w-12" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-charcoal">{service.serviceName}</p>
                            {service.tagline ? (
                              <p className="mt-0.5 truncate text-xs text-slate-500">{service.tagline}</p>
                            ) : (
                              <p className="mt-0.5 text-xs text-slate-400">No headline</p>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <Tag size={14} className="text-slate-400" />
                          {service.categoryName}
                        </span>
                      </Td>
                      <Td>
                        <p className="font-semibold text-charcoal">{formatLKR(service.basePrice)}</p>
                        <p className="text-xs capitalize text-slate-500">{service.pricingType.toLowerCase()}</p>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          {isUpdating ? (
                            <InlineSpinner />
                          ) : (
                            <ToggleSwitch
                              checked={service.isActive}
                              onChange={() => handleToggleActive(service)}
                              disabled={isUpdating}
                              aria-label={
                                service.isActive
                                  ? `Unpublish ${service.serviceName}`
                                  : `Publish ${service.serviceName}`
                              }
                            />
                          )}
                          <div className="min-w-0">
                            <StatusBadge active={service.isActive} />
                            <p className="mt-1 text-xs text-slate-500">
                              {service.isActive ? "Visible on marketplace" : "Hidden from search"}
                            </p>
                          </div>
                        </div>
                      </Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            icon={Pencil}
                            label="Edit listing"
                            href={`/vendor/dashboard/services/${service.id}/edit`}
                          />
                          <RowActionsMenu
                            actions={[
                              {
                                key: "toggle",
                                label: service.isActive ? "Unpublish listing" : "Publish listing",
                                onClick: () => handleToggleActive(service),
                                disabled: isUpdating,
                              },
                              {
                                key: "delete",
                                label: "Delete listing",
                                onClick: () => handleDelete(service.id),
                                destructive: true,
                              },
                            ]}
                          />
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
          </TableShell>
        )}
      </SectionCard>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete listing?"
        message={
          deleteError ||
          "This permanently removes the listing. If you only want to hide it from couples, use Unpublish instead."
        }
      />
    </div>
  );
}
