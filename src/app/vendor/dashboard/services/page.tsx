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
  IconButton,
  InlineSpinner,
  RowActionsMenu,
  SearchField,
  StatusBadge,
  ToggleSwitch,
} from "@/modules/vendor/dashboard/components";
import {
  EmptyState,
  ErrorBanner,
  formatLKR,
  PageLoadingSkeleton,
  StatIcon,
} from "@/modules/vendor/dashboard/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { useVendorVerification } from "@/modules/vendor/dashboard/VendorVerificationContext";
import { VendorPublishRestrictionNotice } from "@/modules/vendor/dashboard/VendorVerificationBanner";

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

const CATALOG_ROW =
  "lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.95fr)_minmax(0,1.05fr)_auto] lg:items-center lg:gap-x-5";

function ServiceCatalogList({
  services,
  statusUpdatingId,
  canPublishListings,
  onToggleActive,
  onDelete,
}: {
  services: VendorService[];
  statusUpdatingId: string | null;
  canPublishListings: boolean;
  onToggleActive: (service: VendorService) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div
        className={cn(
          CATALOG_ROW,
          "hidden px-4 pb-1 lg:grid",
          vg.label
        )}
        aria-hidden
      >
        <span>Service</span>
        <span>Category</span>
        <span>Pricing</span>
        <span>Visibility</span>
        <span className="text-right">Actions</span>
      </div>

      <ul className="space-y-2.5" role="list">
        {services.map((service) => (
          <ServiceCatalogRow
            key={service.id}
            service={service}
            isUpdating={statusUpdatingId === service.id}
            canPublishListings={canPublishListings}
            onToggleActive={() => onToggleActive(service)}
            onDelete={() => onDelete(service.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function ServiceCatalogRow({
  service,
  isUpdating,
  canPublishListings,
  onToggleActive,
  onDelete,
}: {
  service: VendorService;
  isUpdating: boolean;
  canPublishListings: boolean;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const publishBlocked = !canPublishListings && !service.isActive;
  const publishDisabled = isUpdating || publishBlocked;
  return (
    <li>
      <article
        className={cn(
          CATALOG_ROW,
          "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm",
          "transition-all duration-200",
          "hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/60 hover:shadow-[0_4px_20px_hsl(345_100%_25%/0.07)]"
        )}
      >
        {/* Service */}
        <div className="flex min-w-0 items-center gap-3 lg:py-0.5">
          {service.primaryImageUrl ? (
            <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-white/60 bg-white/50 shadow-sm ring-1 ring-white/40">
              <Image
                src={service.primaryImageUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <StatIcon icon={Package} theme="primary" className="!h-11 !w-11 !rounded-xl" />
          )}
          <div className="min-w-0 flex-1">
            <p className={cn("truncate font-medium text-foreground", vg.body)}>{service.serviceName}</p>
            <p className={cn("truncate", vg.caption)}>
              {service.tagline?.trim() || "No headline yet"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 rounded-xl bg-white/45 p-0.5 ring-1 ring-white/55 lg:hidden">
            <IconButton
              icon={Pencil}
              label="Edit listing"
              href={`/vendor/dashboard/services/${service.id}/edit`}
              glass
            />
            <RowActionsMenu
              glass
              actions={[
                {
                  key: "toggle",
                  label: service.isActive ? "Unpublish listing" : "Publish listing",
                  onClick: onToggleActive,
                  disabled: publishDisabled,
                },
                {
                  key: "delete",
                  label: "Delete listing",
                  onClick: onDelete,
                  destructive: true,
                },
              ]}
            />
          </div>
        </div>

        {/* Category */}
        <div className="mt-3 flex items-center lg:mt-0">
          <span className="mr-2 w-20 shrink-0 lg:hidden">
            <span className={vg.label}>Category</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-white/60">
            <Tag size={12} className="text-muted-foreground" aria-hidden />
            {service.categoryName}
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-2 flex items-baseline lg:mt-0">
          <span className="mr-2 w-20 shrink-0 lg:hidden">
            <span className={vg.label}>Pricing</span>
          </span>
          <div>
            <p className="font-semibold tabular-nums tracking-tight text-foreground">
              {formatLKR(service.basePrice)}
            </p>
            <p className={cn("capitalize", vg.caption)}>{service.pricingType.toLowerCase()}</p>
          </div>
        </div>

        {/* Visibility */}
        <div className="mt-2 flex items-center lg:mt-0">
          <span className="mr-2 w-20 shrink-0 lg:hidden">
            <span className={vg.label}>Status</span>
          </span>
          <div className="flex items-center gap-2.5">
            {isUpdating ? (
              <InlineSpinner />
            ) : (
              <ToggleSwitch
                checked={service.isActive}
                onChange={onToggleActive}
                disabled={publishDisabled}
                aria-label={
                  publishBlocked
                    ? `Publishing unavailable until account verification for ${service.serviceName}`
                    : service.isActive
                      ? `Unpublish ${service.serviceName}`
                      : `Publish ${service.serviceName}`
                }
              />
            )}
            <StatusBadge active={service.isActive} />
          </div>
        </div>

        {/* Actions — desktop */}
        <div className="mt-3 hidden items-center justify-end lg:mt-0 lg:flex">
          <div className="flex items-center gap-0.5 rounded-xl bg-white/45 p-0.5 ring-1 ring-white/55">
            <IconButton
              icon={Pencil}
              label="Edit listing"
              href={`/vendor/dashboard/services/${service.id}/edit`}
              glass
            />
            <RowActionsMenu
              glass
              actions={[
                {
                  key: "toggle",
                  label: service.isActive ? "Unpublish listing" : "Publish listing",
                  onClick: onToggleActive,
                  disabled: publishDisabled,
                },
                {
                  key: "delete",
                  label: "Delete listing",
                  onClick: onDelete,
                  destructive: true,
                },
              ]}
            />
          </div>
        </div>
      </article>
    </li>
  );
}

export default function VendorServicesPage() {
  const { user } = useAuth();
  const { canPublishListings } = useVendorVerification();
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
    if (nextActive && !canPublishListings) {
      setError("Your account must be verified before publishing listings to the marketplace.");
      return;
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
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="My services"
        description="Manage listings couples see on search and your vendor profile. Publish when ready, or hide listings without deleting them."
        badge="Storefront"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <GlassButton
              variant="ghost"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
              Refresh
            </GlassButton>
            <GlassButton href="/vendor/dashboard/services/new" variant="primary" className="gap-1.5">
              <Plus size={18} aria-hidden />
              New listing
            </GlassButton>
          </div>
        }
      />

      {!canPublishListings && <VendorPublishRestrictionNotice />}

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStatCard
          label="Total listings"
          value={services.length}
          icon={LayoutGrid}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Published"
          value={activeCount}
          sub="Visible on marketplace"
          icon={Eye}
          iconTheme="success"
        />
        <GlassStatCard
          label="Draft / hidden"
          value={draftCount}
          sub="Not shown in search"
          icon={EyeOff}
          iconTheme="muted"
        />
      </div>

      <GlassSectionCard
        title="Service catalog"
        subtitle="Toggle visibility to show or hide listings on the marketplace"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by name or category…"
            className="w-full sm:max-w-md"
            glass
          />
          <p className={vg.caption}>
            {filteredServices.length} listing{filteredServices.length === 1 ? "" : "s"}
          </p>
        </div>

        {refreshing ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Refreshing catalog…</p>
        ) : filteredServices.length === 0 ? (
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
                <GlassButton href="/vendor/dashboard/services/new" variant="primary" className="gap-1.5">
                  <LayoutGrid size={18} aria-hidden />
                  Create listing
                </GlassButton>
              ) : (
                <GlassButton variant="ghost" onClick={() => setSearch("")}>
                  Clear search
                </GlassButton>
              )
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : (
          <ServiceCatalogList
            services={filteredServices}
            statusUpdatingId={statusUpdatingId}
            canPublishListings={canPublishListings}
            onToggleActive={(service) => void handleToggleActive(service)}
            onDelete={handleDelete}
          />
        )}
      </GlassSectionCard>

      <GlassSectionCard title="Listing tips" subtitle="Improve discovery on MyWedding.lk">
        <ul className="grid gap-3 sm:grid-cols-3">
          <li className={cn(vd.metaBox, vg.subtitle)}>
            <span className="font-semibold text-primary">Photos</span> — use a clear cover image; couples
            browse visually first.
          </li>
          <li className={cn(vd.metaBox, vg.subtitle)}>
            <span className="font-semibold text-primary">Headline</span> — a short tagline helps you stand out
            in search results.
          </li>
          <li className={cn(vd.metaBox, vg.subtitle)}>
            <span className="font-semibold text-primary">Publish</span> — only published listings appear in
            marketplace search.
          </li>
        </ul>
      </GlassSectionCard>

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
