"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import {
  createVendorSubscriptionCheckout,
  getVendorBillingProfile,
  getVendorSubscription,
  openPayHereCheckout,
  saveVendorBillingProfile,
  setVendorSubscription,
} from "@/shared/lib/api/vendors";
import {
  VENDOR_TIER_FEATURES,
  VENDOR_TIER_PRICING,
  VendorTier,
} from "@/modules/vendor/billing/constants";
import { Check, CreditCard, Crown, RefreshCw, Shield, Star, Zap } from "lucide-react";
import {
  Badge,
  Button,
  ErrorBanner,
  formatLKR,
  PageHeader,
  PageLoadingSkeleton,
  SectionCard,
  StatCard,
  StatIcon,
  SuccessBanner,
  inputClass,
} from "@/modules/vendor/dashboard/ui";
import { cn } from "@/shared/lib/cn";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";

function detectBrand(cardNumber: string): string {
  const n = cardNumber.replace(/\s/g, "");
  if (n.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  return "Card";
}

const TIERS: VendorTier[] = ["Free", "Featured", "Sponsored"];

function tierIcon(item: VendorTier) {
  if (item === "Free") return Zap;
  if (item === "Featured") return Star;
  return Crown;
}

function tierTheme(item: VendorTier): "muted" | "primary" | "accent" {
  if (item === "Free") return "muted";
  if (item === "Featured") return "primary";
  return "accent";
}

export default function VendorSettingsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [tier, setTier] = useState<VendorTier>("Free");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [savedLast4, setSavedLast4] = useState<string | null>(null);
  const [savedBrand, setSavedBrand] = useState<string | null>(null);

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const paymentReturn = searchParams.get("payment");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const [sub, profile] = await Promise.all([
        getVendorSubscription(token),
        getVendorBillingProfile(token),
      ]);
      if (sub?.tier === "Featured" || sub?.tier === "Sponsored" || sub?.tier === "Free") {
        setTier(sub.tier);
      }
      setHasPaymentMethod(profile.hasPaymentMethod);
      setSavedLast4(profile.last4 ?? null);
      setSavedBrand(profile.cardBrand ?? null);
      if (profile.cardholderName) setCardholderName(profile.cardholderName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (paymentReturn === "success") {
      setMessage("Payment received. Your plan will activate shortly after confirmation.");
      void load();
    } else if (paymentReturn === "cancelled") {
      setError("Payment was cancelled. Your plan was not changed.");
    }
  }, [paymentReturn, load]);

  const savePaymentMethod = async () => {
    if (!user) return;
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 4) {
      setError("Enter a valid card number to detect brand and last 4 digits.");
      return;
    }
    const [mm, yy] = expiry.split("/").map((p) => p.trim());
    if (!cardholderName.trim() || !mm || !yy) {
      setError("Cardholder name and expiry (MM/YY) are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();
      const last4 = digits.slice(-4);
      await saveVendorBillingProfile(token, {
        cardholderName: cardholderName.trim(),
        cardBrand: detectBrand(digits),
        last4,
        expiryMonth: Number(mm),
        expiryYear: 2000 + Number(yy.length === 2 ? yy : yy.slice(-2)),
      });
      setMessage("Payment method saved securely (only masked details are stored).");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment method.");
    } finally {
      setSaving(false);
    }
  };

  const savePlan = async () => {
    if (!user) return;
    const monthlyFee = VENDOR_TIER_PRICING[tier];

    if (tier !== "Free" && !hasPaymentMethod) {
      setError("Add a payment method before selecting a paid plan.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();

      if (tier === "Free") {
        await setVendorSubscription(token, { tier, monthlyFee: 0 });
        setMessage("Plan updated to Free.");
        await load();
        return;
      }

      const checkout = await createVendorSubscriptionCheckout(token, { tier, monthlyFee });
      if (checkout?.checkout?.checkoutUrl) {
        openPayHereCheckout(checkout.checkout);
        setMessage("Redirecting to secure PayHere checkout…");
        return;
      }

      await setVendorSubscription(token, { tier, monthlyFee });
      setMessage("Subscription updated successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subscription.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <section className="space-y-8 pb-4">
      <PageHeader
        title="Plan & billing"
        description="Compare visibility tiers, add a card for monthly billing, and pay securely via PayHere."
        badge="Account"
        action={
          <div className="flex items-center gap-2">
            <Badge variant="accent">{tier}</Badge>
            <Button type="button" variant="secondary" size="sm" onClick={() => void load()}>
              <RefreshCw size={16} aria-hidden />
              Refresh
            </Button>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((item, index) => (
          <StatCard
            key={item}
            label={`${item} plan`}
            value={formatLKR(VENDOR_TIER_PRICING[item])}
            sub={item === tier ? "Current plan" : "per month"}
            icon={tierIcon(item)}
            iconTheme={tierTheme(item)}
            index={index}
          />
        ))}
      </div>

      <SectionCard title="Visibility tiers" subtitle="Choose how prominently you appear in search">
        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map((item) => (
            <label
              key={item}
              className={cn(
                "flex cursor-pointer flex-col rounded-3xl border p-5 transition-shadow",
                tier === item
                  ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatIcon icon={tierIcon(item)} theme={tierTheme(item)} size={18} />
                  <p className="font-bold text-foreground">{item}</p>
                </div>
                <input
                  type="radio"
                  name="tier"
                  checked={tier === item}
                  onChange={() => setTier(item)}
                  className="h-4 w-4 accent-primary"
                />
              </div>
              <p className="text-2xl font-bold text-primary">
                {formatLKR(VENDOR_TIER_PRICING[item])}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {VENDOR_TIER_FEATURES[item].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check size={14} className="mt-0.5 flex-shrink-0 text-success" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </label>
          ))}
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          className="mt-6"
          onClick={() => void savePlan()}
          disabled={saving}
        >
          {saving ? "Processing…" : tier === "Free" ? "Save plan" : "Save plan & pay via PayHere"}
        </Button>
      </SectionCard>

      <SectionCard
        title="Payment method"
        subtitle="Visa, Mastercard, and other cards via PayHere — we never store full card numbers"
      >
        {hasPaymentMethod && savedLast4 && (
          <div className={cn("mb-5 flex items-center gap-3", vd.metaBox)}>
            <StatIcon icon={CreditCard} theme="success" size={18} className="!h-10 !w-10" />
            <span className="text-sm text-foreground">
              {savedBrand ?? "Card"} ending in <strong>{savedLast4}</strong> on file
            </span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cardholder name
            </label>
            <input
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className={inputClass}
              placeholder="Name on card"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Card number
            </label>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, "").slice(0, 19))}
              className={inputClass}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              autoComplete="cc-number"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Used only in your browser to detect brand; only the last 4 digits are sent to our servers.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Expiry
            </label>
            <input
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className={inputClass}
              placeholder="MM/YY"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              CVV
            </label>
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className={inputClass}
              placeholder="123"
              type="password"
              autoComplete="cc-csc"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">CVV is never stored.</p>
          </div>
        </div>

        <div className={cn("mt-4 flex items-start gap-3", vd.metaBox)}>
          <StatIcon icon={Shield} theme="primary" size={16} className="!h-9 !w-9 flex-shrink-0" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Monthly charges for Featured and Sponsored plans are collected through PayHere. Card details are
            tokenized by the gateway; MyWedding.lk stores masked metadata only.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="md"
          className="mt-5"
          onClick={() => void savePaymentMethod()}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save payment method"}
        </Button>
      </SectionCard>
    </section>
  );
}
