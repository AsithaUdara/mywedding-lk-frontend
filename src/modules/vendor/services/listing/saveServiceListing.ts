import {
  createVendorDashboardService,
  updateVendorDashboardService,
} from "@/shared/lib/api/vendors";
import { uploadServiceImage } from "@/shared/lib/vendorMedia";
import { serializeListingDetails } from "@/shared/lib/serviceListingDetails";
import type { ServiceListingFormState } from "./types";

export async function saveServiceListing(
  token: string,
  vendorId: string,
  form: ServiceListingFormState,
  existingServiceId?: string
): Promise<string> {
  let primaryImageUrl = form.removePrimary ? null : form.primaryImageUrl ?? null;
  const galleryUrls = [...form.galleryUrls];

  const listingDetailsJson = serializeListingDetails(form.listingDetails);

  const basePayload = {
    serviceName: form.name.trim(),
    description: form.description.trim(),
    basePrice: parseFloat(form.basePrice),
    pricingType: form.pricingType,
    categoryId: form.categoryId || "66666666-6666-6666-6666-666666666666",
    isActive: form.isActive,
    primaryImageUrl,
    galleryUrls,
    tagline: form.tagline.trim() || undefined,
    listingDetailsJson,
  };

  let serviceId = existingServiceId;

  if (serviceId) {
    await updateVendorDashboardService(token, serviceId, basePayload);
  } else {
    const created = await createVendorDashboardService(token, basePayload);
    serviceId = created.id;
  }

  if (!serviceId) {
    throw new Error("Service ID missing after save.");
  }

  if (form.pendingPrimaryFile) {
    primaryImageUrl = await uploadServiceImage(
      form.pendingPrimaryFile,
      vendorId,
      serviceId,
      "primary"
    );
  }

  for (const item of form.pendingGalleryItems) {
    const url = await uploadServiceImage(item.file, vendorId, serviceId, "gallery");
    galleryUrls.push(url);
  }

  if (
    form.pendingPrimaryFile ||
    form.pendingGalleryItems.length > 0 ||
    form.removePrimary
  ) {
    await updateVendorDashboardService(token, serviceId, {
      ...basePayload,
      primaryImageUrl,
      galleryUrls,
    });
  }

  return serviceId;
}
