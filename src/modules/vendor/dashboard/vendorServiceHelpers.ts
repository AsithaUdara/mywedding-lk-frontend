import type { VendorDashboardService } from "@/shared/lib/api/vendors";

export type VendorService = VendorDashboardService;

export type ServiceCatalogFilter = "all" | "live" | "hidden";

export const SERVICE_CATALOG_FILTERS: { value: ServiceCatalogFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "hidden", label: "Hidden" },
];

export type ServiceCatalogStats = {
  total: number;
  live: number;
  hidden: number;
};

export function computeServiceCatalogStats(services: VendorService[]): ServiceCatalogStats {
  const live = services.filter((service) => service.isActive).length;
  return {
    total: services.length,
    live,
    hidden: services.length - live,
  };
}

export function filterServiceCatalog(
  services: VendorService[],
  filter: ServiceCatalogFilter,
  searchQuery: string
): VendorService[] {
  let list = [...services];
  const needle = searchQuery.trim().toLowerCase();

  if (filter === "live") list = list.filter((service) => service.isActive);
  else if (filter === "hidden") list = list.filter((service) => !service.isActive);

  if (needle) {
    list = list.filter(
      (service) =>
        service.serviceName.toLowerCase().includes(needle) ||
        service.categoryName.toLowerCase().includes(needle) ||
        (service.tagline?.toLowerCase().includes(needle) ?? false)
    );
  }

  return list.sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.serviceName.localeCompare(b.serviceName);
  });
}

export function buildServiceUpdatePayload(service: VendorService, isActive: boolean) {
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
