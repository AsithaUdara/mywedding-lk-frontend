import type { LucideIcon } from "lucide-react";
import { Crown, Star, Zap } from "lucide-react";
import {
  VENDOR_TIER_FEATURES,
  VENDOR_TIER_PRICING,
  type VendorTier,
} from "@/modules/vendor/billing/constants";

export const VENDOR_TIERS: VendorTier[] = ["Free", "Featured", "Sponsored"];

export type PaymentFormState = {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

export function emptyPaymentForm(): PaymentFormState {
  return {
    cardholderName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  };
}

export function normalizeVendorTier(tier: string | undefined): VendorTier {
  if (tier === "Featured" || tier === "Sponsored") return tier;
  return "Free";
}

export function tierIcon(tier: VendorTier): LucideIcon {
  if (tier === "Free") return Zap;
  if (tier === "Featured") return Star;
  return Crown;
}

export function tierTheme(tier: VendorTier): "muted" | "primary" | "accent" {
  if (tier === "Free") return "muted";
  if (tier === "Featured") return "primary";
  return "accent";
}

export function tierBadgeClass(tier: VendorTier): string {
  if (tier === "Sponsored") {
    return "bg-[hsl(42_48%_52%/0.15)] text-[hsl(42_35%_38%)] ring-1 ring-[hsl(42_48%_52%/0.3)]";
  }
  if (tier === "Featured") {
    return "bg-primary/10 text-primary ring-1 ring-primary/20";
  }
  return "bg-white/55 text-muted-foreground ring-1 ring-white/60";
}

export function detectCardBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\s/g, "");
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
  return "Card";
}

export function parseCardExpiry(expiry: string): { month: number; year: number } | null {
  const [mm, yy] = expiry.split("/").map((part) => part.trim());
  if (!mm || !yy) return null;
  const month = Number(mm);
  const year = 2000 + Number(yy.length === 2 ? yy : yy.slice(-2));
  if (!Number.isFinite(month) || !Number.isFinite(year)) return null;
  return { month, year };
}

export function buildPaymentSavePayload(form: PaymentFormState) {
  const digits = form.cardNumber.replace(/\D/g, "");
  const expiry = parseCardExpiry(form.expiry);
  if (digits.length < 4 || !expiry) return null;

  return {
    cardholderName: form.cardholderName.trim(),
    cardBrand: detectCardBrand(digits),
    last4: digits.slice(-4),
    expiryMonth: expiry.month,
    expiryYear: expiry.year,
  };
}

export function hasPaymentFormInput(form: PaymentFormState): boolean {
  return Boolean(
    form.cardholderName.trim() ||
      form.cardNumber.trim() ||
      form.expiry.trim() ||
      form.cvv.trim()
  );
}

export function tierMonthlyLabel(tier: VendorTier): string {
  const fee = VENDOR_TIER_PRICING[tier];
  return fee === 0 ? "No monthly charge" : `${fee.toLocaleString("en-LK")} LKR / month`;
}

export { VENDOR_TIER_FEATURES, VENDOR_TIER_PRICING };
