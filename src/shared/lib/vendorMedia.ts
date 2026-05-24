import type { Vendor } from "@/shared/lib/api/vendors";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateServiceImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Use JPEG, PNG, or WebP images only.";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to frontend/.env.local (see docs/CLOUDINARY_SETUP.md)."
    );
  }

  return { cloudName, uploadPreset };
}

export async function uploadServiceImage(
  file: File,
  vendorId: string,
  serviceId: string,
  slot: "primary" | "gallery" = "primary"
): Promise<string> {
  const validationError = validateServiceImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const { cloudName, uploadPreset } = getCloudinaryConfig();

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);
  body.append("folder", `mywedding/vendors/${vendorId}/services/${serviceId}`);
  body.append("tags", `vendor,service,${slot}`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (payload as { error?: { message?: string } })?.error?.message ||
      "Failed to upload image to Cloudinary.";
    throw new Error(message);
  }

  const secureUrl = (payload as { secure_url?: string }).secure_url;
  if (!secureUrl) {
    throw new Error("Cloudinary did not return an image URL.");
  }

  return secureUrl;
}

export const VENDOR_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80";

export function resolveVendorCardImages(primaryImageUrl?: string | null, imageUrls?: string[]): string[] {
  const urls = [
    ...(primaryImageUrl ? [primaryImageUrl] : []),
    ...(imageUrls ?? []),
  ].filter((url, index, arr) => url && arr.indexOf(url) === index);

  return urls.length > 0 ? urls : [VENDOR_IMAGE_PLACEHOLDER];
}

export function mapVendorToCardProps(vendor: Vendor) {
  return {
    id: vendor.userId,
    name: vendor.businessName,
    category: vendor.categoryName,
    location: vendor.city,
    images: resolveVendorCardImages(vendor.primaryImageUrl, vendor.imageUrls),
    rating: vendor.averageRating,
    price: vendor.minPrice,
    totalReviews: vendor.totalReviews,
    verificationStatus: vendor.verificationStatus,
    premiumTier: vendor.premiumTier,
  };
}

export function pricingTypeLabel(pricingType: string): string {
  switch (pricingType) {
    case "Hourly":
      return "/ hour";
    case "PerPerson":
      return "/ guest";
    case "Package":
      return "/ package";
    case "Fixed":
    default:
      return "/ event";
  }
}
