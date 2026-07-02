"use client";

import { Eye, EyeOff, Package, Plus, RefreshCw } from "lucide-react";
import DeleteConfirmationModal from "@/app/vendor/dashboard/services/DeleteConfirmationModal";
import { useVendorServicesPage } from "@/modules/vendor/dashboard/hooks/useVendorServicesPage";
import { VendorServiceCard } from "@/modules/vendor/dashboard/VendorServiceCard";
import { VendorServicesToolbar } from "@/modules/vendor/dashboard/VendorServicesToolbar";
import {
  EmptyState,
  ErrorBanner,
  PageLoadingSkeleton,
} from "@/modules/vendor/dashboard/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { VendorPublishRestrictionNotice } from "@/modules/vendor/dashboard/VendorVerificationBanner";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export function VendorServicesCatalog() {
  const {
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
  } = useVendorServicesPage();

  if (showInitialSkeleton) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="My services"
        description="Listings couples see in search and on your profile — publish when ready or hide without deleting."
        badge={stats.live > 0 ? `${stats.live} live` : "Storefront"}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <GlassButton
              variant="ghost"
              onClick={() => void reload()}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={cn(isRefreshing && "animate-spin")} aria-hidden />
              Refresh
            </GlassButton>
            <GlassButton href="/vendor/dashboard/services/new" variant="primary" className="gap-1.5">
              <Plus size={18} aria-hidden />
              New listing
            </GlassButton>
          </div>
        }
      />

      {!canPublishListings ? <VendorPublishRestrictionNotice /> : null}

      {needsPublishAttention ? (
        <div
          className={cn(
            "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3",
            vg.body
          )}
          role="status"
        >
          <p className="font-medium text-foreground">No live listings yet</p>
          <p className={cn("mt-0.5", vg.caption)}>
            You have {stats.hidden} hidden listing{stats.hidden === 1 ? "" : "s"} — publish at least one
            to appear in marketplace search.
          </p>
        </div>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}

      {services.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <GlassStatCard
            label="Live on marketplace"
            value={stats.live}
            sub={stats.live > 0 ? "Visible in search" : "Nothing published yet"}
            icon={Eye}
            iconTheme={stats.live > 0 ? "success" : "warning"}
          />
          <GlassStatCard
            label="Hidden listings"
            value={stats.hidden}
            sub="Draft or unpublished"
            icon={EyeOff}
            iconTheme="muted"
          />
        </div>
      ) : null}

      <div className={cn(vg.panel, "overflow-hidden")}>
        <div className="border-b border-white/40 px-4 py-4 sm:px-6">
          <VendorServicesToolbar
            search={search}
            onSearchChange={setSearch}
            catalogFilter={catalogFilter}
            onFilterChange={setCatalogFilter}
            resultCount={filteredServices.length}
            totalCount={services.length}
          />
        </div>

        <div className="p-4 sm:p-6">
          {filteredServices.length === 0 ? (
            <EmptyState
              title={services.length === 0 ? "No listings yet" : "No matching listings"}
              description={
                services.length === 0
                  ? "Create your first listing with photos, pricing, and a headline — couples discover you from search."
                  : "Try a different search or filter."
              }
              icon={Package}
              action={
                services.length === 0 ? (
                  <GlassButton href="/vendor/dashboard/services/new" variant="primary" className="gap-1.5">
                    <Plus size={18} aria-hidden />
                    Create listing
                  </GlassButton>
                ) : (
                  <GlassButton
                    variant="ghost"
                    onClick={() => {
                      setSearch("");
                      setCatalogFilter("all");
                    }}
                  >
                    Clear filters
                  </GlassButton>
                )
              }
              className="border-0 bg-transparent shadow-none"
            />
          ) : (
            <ul className="space-y-3" role="list">
              {filteredServices.map((service) => (
                <li key={service.id}>
                  <VendorServiceCard
                    service={service}
                    isUpdating={statusUpdatingId === service.id}
                    canPublishListings={canPublishListings}
                    onToggleActive={() => void toggleActive(service)}
                    onDelete={() => openDeleteModal(service.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => void confirmDelete()}
        title="Delete listing?"
        message={
          deleteError ||
          "This permanently removes the listing. To hide it from couples, use Unpublish instead."
        }
      />
    </div>
  );
}
