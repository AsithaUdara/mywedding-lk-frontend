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
import type { LucideIcon } from "lucide-react";
import {
  ErrorBanner,
  formatLKR,
  PageLoadingSkeleton,
  StatIcon,
  SuccessBanner,
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

function detectBrand(cardNumber: string): string {
  const n = cardNumber.replace(/\s/g, "");
  if (n.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  return "Card";
}

const TIERS: VendorTier[] = ["Free", "Featured", "Sponsored"];

function tierIcon(item: VendorTier): LucideIcon {
  if (item === "Free") return Zap;
  if (item === "Featured") return Star;
  return Crown;
}

function tierTheme(item: VendorTier): "muted" | "primary" | "accent" {
  if (item === "Free") return "muted";
  if (item === "Featured") return "primary";
  return "accent";
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={cn("mb-1.5 block", vg.label)}>{children}</label>;
}

export default function VendorSettingsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [tier, setTier] = useState<VendorTier>("Free");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      setError(null);
      const token = await user.getIdToken();
      const [sub, profile] = await Promise.all([
        getVendorSubscription(token),
        getVendorBillingProfile(token),
      ]);
      if (sub.tier === "Featured" || sub.tier === "Sponsored" || sub.tier === "Free") {
        setTier(sub.tier);
      }
      setHasPaymentMethod(profile.hasPaymentMethod);
      setSavedLast4(profile.last4 ?? null);
      setSavedBrand(profile.cardBrand ?? null);
      if (profile.cardholderName) setCardholderName(profile.cardholderName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing.");
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    if (paymentReturn === "success") {
      setMessage("Payment received. Your plan will activate shortly after confirmation.");
      void load();
    } else if (paymentReturn === "cancelled") {
      setError("Payment was cancelled. Your plan was not changed.");
    }
  }, [paymentReturn, load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

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
      setCardNumber("");
      setCvv("");
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
    <section className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Plan & billing"
        description="Compare visibility tiers, add a card for monthly billing, and pay securely via PayHere."
        badge="Account"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                tier === "Sponsored"
                  ? "bg-[hsl(42_48%_52%/0.15)] text-[hsl(42_35%_38%)] ring-1 ring-[hsl(42_48%_52%/0.3)]"
                  : tier === "Featured"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                    : "bg-white/55 text-muted-foreground ring-1 ring-white/60"
              )}
            >
              {tier} plan
            </span>
            <GlassButton
              variant="ghost"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
              Refresh
            </GlassButton>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((item) => (
          <GlassStatCard
            key={item}
            label={`${item} plan`}
            value={formatLKR(VENDOR_TIER_PRICING[item])}
            sub={item === tier ? "Current plan" : "per month"}
            icon={tierIcon(item)}
            iconTheme={tierTheme(item)}
          />
        ))}
      </div>

      <GlassSectionCard title="Visibility tiers" subtitle="Choose how prominently you appear in search">
        <div className="grid gap-3 lg:grid-cols-3">
          {TIERS.map((item) => {
            const selected = tier === item;
            const Icon = tierIcon(item);

            return (
              <label
                key={item}
                className={cn(
                  "flex cursor-pointer flex-col rounded-xl border p-5 backdrop-blur-sm transition-all duration-200",
                  selected
                    ? "border-primary/35 bg-primary/5 shadow-[0_4px_20px_hsl(345_100%_25%/0.1)] ring-1 ring-primary/25"
                    : "border-white/55 bg-white/40 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <StatIcon icon={Icon} theme={tierTheme(item)} size={18} className="!h-10 !w-10" />
                    <div>
                      <p className={cn("font-medium", vg.body)}>{item}</p>
                      {selected && (
                        <p className={cn("text-primary", vg.caption)}>Selected</p>
                      )}
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="tier"
                    checked={selected}
                    onChange={() => setTier(item)}
                    className="h-4 w-4 accent-primary"
                  />
                </div>
                <p className="font-semibold tabular-nums tracking-tight text-foreground">
                  {formatLKR(VENDOR_TIER_PRICING[item])}
                  <span className={cn("font-normal", vg.caption)}>/mo</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {VENDOR_TIER_FEATURES[item].map((feature) => (
                    <li key={feature} className={cn("flex items-start gap-2", vg.subtitle)}>
                      <Check size={14} className="mt-0.5 flex-shrink-0 text-success" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </label>
            );
          })}
        </div>

        <GlassButton
          variant="primary"
          className="mt-6 gap-1.5"
          onClick={() => void savePlan()}
          disabled={saving}
        >
          {saving ? "Processing…" : tier === "Free" ? "Save plan" : "Save plan & pay via PayHere"}
        </GlassButton>
      </GlassSectionCard>

      <GlassSectionCard
        title="Payment method"
        subtitle="Visa, Mastercard, and other cards via PayHere — we never store full card numbers"
      >
        {hasPaymentMethod && savedLast4 && (
          <div className={cn("mb-5 flex items-center gap-3", vd.metaBox)}>
            <StatIcon icon={CreditCard} theme="success" size={18} className="!h-10 !w-10" />
            <span className={vg.body}>
              {savedBrand ?? "Card"} ending in <strong>{savedLast4}</strong> on file
            </span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>Cardholder name</FieldLabel>
            <input
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className={vd.input}
              placeholder="Name on card"
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Card number</FieldLabel>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, "").slice(0, 19))}
              className={vd.input}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              autoComplete="cc-number"
            />
            <p className={cn("mt-1", vg.caption)}>
              Used only in your browser to detect brand; only the last 4 digits are sent to our servers.
            </p>
          </div>
          <div>
            <FieldLabel>Expiry</FieldLabel>
            <input
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className={vd.input}
              placeholder="MM/YY"
            />
          </div>
          <div>
            <FieldLabel>CVV</FieldLabel>
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className={vd.input}
              placeholder="123"
              type="password"
              autoComplete="cc-csc"
            />
            <p className={cn("mt-1", vg.caption)}>CVV is never stored.</p>
          </div>
        </div>

        <div className={cn("mt-4 flex items-start gap-3", vd.metaBox)}>
          <StatIcon icon={Shield} theme="primary" size={16} className="!h-9 !w-9 flex-shrink-0" />
          <p className={cn("leading-relaxed", vg.caption)}>
            Monthly charges for Featured and Sponsored plans are collected through PayHere. Card details are
            tokenized by the gateway; MyWedding.lk stores masked metadata only.
          </p>
        </div>

        <GlassButton
          variant="ghost"
          className="mt-5"
          onClick={() => void savePaymentMethod()}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save payment method"}
        </GlassButton>
      </GlassSectionCard>
    </section>
  );
}
