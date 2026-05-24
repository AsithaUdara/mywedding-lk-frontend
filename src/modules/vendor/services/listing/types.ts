import type { ServiceListingDetails } from "@/shared/lib/serviceListingDetails";

export interface PendingGalleryItem {
  id: string;
  file: File;
  previewUrl: string;
}

export type ListingStepId = "photos" | "basics" | "pricing" | "details" | "review";

export const LISTING_STEPS: { id: ListingStepId; label: string; description: string }[] = [
  { id: "photos", label: "Photos", description: "Show couples your best work" },
  { id: "basics", label: "Basics", description: "Name, category & headline" },
  { id: "pricing", label: "Pricing", description: "Rates and what's included" },
  { id: "details", label: "Details", description: "Description & highlights" },
  { id: "review", label: "Review", description: "Preview and publish" },
];

export interface ServiceListingFormState {
  name: string;
  tagline: string;
  description: string;
  basePrice: string;
  pricingType: string;
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  primaryImageUrl: string | null;
  galleryUrls: string[];
  pendingPrimaryFile: File | null;
  pendingGalleryItems: PendingGalleryItem[];
  removePrimary: boolean;
  listingDetails: ServiceListingDetails;
}

export const emptyListingForm = (): ServiceListingFormState => ({
  name: "",
  tagline: "",
  description: "",
  basePrice: "",
  pricingType: "Fixed",
  categoryId: "",
  categoryName: "",
  isActive: false,
  primaryImageUrl: null,
  galleryUrls: [],
  pendingPrimaryFile: null,
  pendingGalleryItems: [],
  removePrimary: false,
  listingDetails: { includedItems: [], highlights: [] },
});
