"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  LayoutGrid,
  Package,
  Plus,
  RefreshCw,
  Tag,
  Pencil,
} from "lucide-react";
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
  RowActionsMenu,
  SearchField,
  StatusBadge,
  TableShell,
  Td,
  Th,
  ToggleSwitch,
} from "@/modules/vendor/dashboard/components";
import {
  Button,
  EmptyState,
  ErrorBanner,
  formatLKR,
  PageHeader,
  PageLoadingSkeleton,
  SectionCard,
  StatCard,
  StatIcon,
} from "@/modules/vendor/dashboard/ui";
import { cn } from "@/shared/lib/cn";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";

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

function ListingPlaceholderPreview() {
  const samples = [
    { name: "Premium wedding package", category: "Photography", price: "LKR 85,000", active: true },
    { name: "Reception décor bundle", category: "Décor", price: "LKR 120,000", active: false },
  ];

  return (
    <div className="mt-6 space-y-3 opacity-90" aria-hidden>
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Preview — your catalog will look like this
      </p>
      {samples.map((row) => (
        <div
          key={row.name}
          className="flex items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package size={20} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-muted-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground/80">{row.category}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-muted-foreground">{row.price}</p>
            <p className="text-[10px] font-semibold uppercase text-muted-foreground/70">
              {row.active ? "Published" : "Draft"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VendorServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceIdToDelete, setServiceIdToDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const token = await user.getIdToken();
      const data = await getVendorDashboardServices(token);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services.");
      setServices([]);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      try {
        setLoading(true);
        await fetchServices();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchServices, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  const filteredServices = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return services;
    return services.filter(
      (service) =>
        service.serviceName.toLowerCase().includes(needle) ||
        service.categoryName.toLowerCase().includes(needle) ||
        (service.tagline?.toLowerCase().includes(needle) ?? false)
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
      setDeleteError(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete service.");
    }
  };

  const activeCount = services.filter((service) => service.isActive).length;
  const draftCount = services.length - activeCount;

  if (loading && !refreshing) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4">
      <PageHeader
        title="My services"
        description="Manage listings couples see on search and your vendor profile. Publish when ready, or hide listings without deleting them."
        badge="Storefront"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
              Refresh
            </Button>
            <Button href="/vendor/dashboard/services/new" variant="primary" size="sm">
              <Plus size={18} aria-hidden />
              New listing
            </Button>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total listings"
          value={services.length}
          icon={LayoutGrid}
          iconTheme="primary"
          index={0}
        />
        <StatCard
          label="Published"
          value={activeCount}
          sub="Visible on marketplace"
          icon={Eye}
          iconTheme="success"
          index={1}
        />
        <StatCard
          label="Draft / hidden"
          value={draftCount}
          sub="Not shown in search"
          icon={EyeOff}
          iconTheme="muted"
          index={2}
        />
      </div>

      <SectionCard
        title="Service catalog"
        subtitle="Toggle visibility to show or hide listings on the marketplace"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by name or category…"
            className="w-full sm:max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            {filteredServices.length} listing{filteredServices.length === 1 ? "" : "s"}
          </p>
        </div>

        {refreshing ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Refreshing catalog…</p>
        ) : filteredServices.length === 0 ? (
          <div className="space-y-2">
            <EmptyState
              title={services.length === 0 ? "No listings yet" : "No matching listings"}
              description={
                services.length === 0
                  ? "Create your first listing with photos, pricing, and highlights — couples discover you from search and your profile."
                  : "Try a different search term or clear the filter."
              }
              icon={Package}
              action={
                services.length === 0 ? (
                  <Button href="/vendor/dashboard/services/new" variant="primary" size="sm">
                    <LayoutGrid size={18} aria-hidden />
                    Create listing
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" size="sm" onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                )
              }
            />
            {services.length === 0 && <ListingPlaceholderPreview />}
          </div>
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
                    <tr key={service.id} className="group transition-colors hover:bg-muted/40">
                      <Td>
                        <div className="flex items-center gap-3">
                          {service.primaryImageUrl ? (
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                              <Image
                                src={service.primaryImageUrl}
                                alt=""
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <StatIcon icon={Package} theme="primary" className="!h-12 !w-12" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{service.serviceName}</p>
                            {service.tagline ? (
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">{service.tagline}</p>
                            ) : (
                              <p className="mt-0.5 text-xs text-muted-foreground/70">No headline</p>
                            )}
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 text-foreground">
                          <Tag size={14} className="text-muted-foreground" aria-hidden />
                          {service.categoryName}
                        </span>
                      </Td>
                      <Td>
                        <p className="font-semibold text-primary">{formatLKR(service.basePrice)}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {service.pricingType.toLowerCase()}
                        </p>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          {isUpdating ? (
                            <InlineSpinner />
                          ) : (
                            <ToggleSwitch
                              checked={service.isActive}
                              onChange={() => void handleToggleActive(service)}
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
                            <p className="mt-1 text-xs text-muted-foreground">
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
                                onClick: () => void handleToggleActive(service),
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

      <SectionCard title="Listing tips" subtitle="Improve discovery on MyWedding.lk">
        <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <li className={cn(vd.metaBox)}>
            <span className="font-bold text-primary">Photos</span> — use a clear cover image; couples
            browse visually first.
          </li>
          <li className={cn(vd.metaBox)}>
            <span className="font-bold text-primary">Headline</span> — a short tagline helps you stand out
            in search results.
          </li>
          <li className={cn(vd.metaBox)}>
            <span className="font-bold text-primary">Publish</span> — only published listings appear in
            marketplace search.
          </li>
        </ul>
      </SectionCard>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteError(null);
        }}
        onConfirm={() => void confirmDelete()}
        title="Delete listing?"
        message={
          deleteError ||
          "This permanently removes the listing. If you only want to hide it from couples, use Unpublish instead."
        }
      />
    </div>
  );
}
