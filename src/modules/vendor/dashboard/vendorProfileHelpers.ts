import type { VendorBusinessProfile } from "@/shared/lib/api/vendors";

export type VendorProfileFormState = {
  businessName: string;
  businessDescription: string;
  websiteUrl: string;
  contactPhone: string;
  city: string;
  province: string;
};

export type ProfileCompleteness = {
  percent: number;
  missing: string[];
  filled: number;
  total: number;
};

const COMPLETENESS_CHECKS: { key: keyof VendorProfileFormState; label: string }[] = [
  { key: "businessName", label: "Business name" },
  { key: "city", label: "City / town" },
  { key: "contactPhone", label: "Contact phone" },
  { key: "businessDescription", label: "About section" },
];

export function profileFormFromApi(profile: VendorBusinessProfile): VendorProfileFormState {
  return {
    businessName: profile.businessName ?? "",
    businessDescription: profile.businessDescription ?? "",
    websiteUrl: profile.websiteUrl ?? "",
    contactPhone: profile.contactPhone ?? "",
    city: profile.city ?? "",
    province: profile.province ?? "",
  };
}

export function emptyProfileForm(): VendorProfileFormState {
  return {
    businessName: "",
    businessDescription: "",
    websiteUrl: "",
    contactPhone: "",
    city: "",
    province: "",
  };
}

export function computeProfileCompleteness(form: VendorProfileFormState): ProfileCompleteness {
  const missing: string[] = [];

  for (const check of COMPLETENESS_CHECKS) {
    if (!form[check.key].trim()) {
      missing.push(check.label);
    }
  }

  const filled = COMPLETENESS_CHECKS.length - missing.length;
  const total = COMPLETENESS_CHECKS.length;
  const percent = Math.round((filled / total) * 100);

  return { percent, missing, filled, total };
}

export function hasProfileFormChanges(
  form: VendorProfileFormState,
  baseline: VendorProfileFormState
): boolean {
  return (Object.keys(form) as (keyof VendorProfileFormState)[]).some(
    (key) => form[key].trim() !== baseline[key].trim()
  );
}

export function formatWebsiteDisplay(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.replace(/^https?:\/\//i, "");
}

export function buildProfileSavePayload(form: VendorProfileFormState) {
  return {
    businessName: form.businessName.trim(),
    businessDescription: form.businessDescription.trim(),
    websiteUrl: form.websiteUrl.trim() || undefined,
    contactPhone: form.contactPhone.trim() || undefined,
    city: form.city.trim(),
    province: form.province.trim() || undefined,
  };
}
