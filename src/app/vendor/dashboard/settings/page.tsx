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
import { Check, CreditCard, Crown, Shield, Star, Zap } from "lucide-react";
import {
  ErrorBanner,
  IconCircle,
  LoadingState,
  PageHeader,
  SectionCard,
  SuccessBanner,
} from "@/modules/vendor/dashboard/ui";

function detectBrand(cardNumber: string): string {
  const n = cardNumber.replace(/\s/g, "");
  if (n.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  return "Card";
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
    load();
  }, [load]);

  useEffect(() => {
    if (paymentReturn === "success") {
      setMessage("Payment received. Your plan will activate shortly after confirmation.");
      load();
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

  const tierIconTheme = (item: VendorTier): "slate" | "primary" | "gold" => {
    if (item === "Free") return "slate";
    if (item === "Featured") return "primary";
    return "gold";
  };

  const tierIcon = (item: VendorTier) => {
    if (item === "Free") return Zap;
    if (item === "Featured") return Star;
    return Crown;
  };

  return (
    <section className="space-y-8">
      <PageHeader
        title="Plan & Billing"
        description="Compare visibility tiers, add a card for monthly billing, and pay securely via PayHere."
        badge={tier}
      />

      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <SectionCard title="Visibility tiers" subtitle="What you get with each plan">
        {loading ? (
          <LoadingState label="Loading your current plan..." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {(["Free", "Featured", "Sponsored"] as VendorTier[]).map((item) => (
              <label
                key={item}
                className={`flex cursor-pointer flex-col rounded-2xl border p-5 transition ${
                  tier === item
                    ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconCircle icon={tierIcon(item)} theme={tierIconTheme(item)} size={18} />
                    <p className="font-bold text-charcoal">{item}</p>
                  </div>
                  <input
                    type="radio"
                    name="tier"
                    checked={tier === item}
                    onChange={() => setTier(item)}
                  />
                </div>
                <p className="text-2xl font-bold text-primary">
                  LKR {VENDOR_TIER_PRICING[item].toLocaleString()}
                  <span className="text-sm font-normal text-slate-500">/mo</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {VENDOR_TIER_FEATURES[item].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check size={14} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </label>
            ))}
          </div>
        )}

        <button
          onClick={savePlan}
          disabled={saving || loading}
          className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Processing..." : tier === "Free" ? "Save plan" : "Save plan & pay via PayHere"}
        </button>
      </SectionCard>

      <SectionCard
        title="Payment method"
        subtitle="Visa, Mastercard, and other cards via PayHere — we never store full card numbers"
      >
        {hasPaymentMethod && savedLast4 && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-charcoal shadow-sm">
            <IconCircle icon={CreditCard} theme="green" size={18} className="h-10 w-10" />
            <span>
              {savedBrand ?? "Card"} ending in <strong>{savedLast4}</strong> on file
            </span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Cardholder name</label>
            <input
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Name on card"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Card number</label>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, "").slice(0, 19))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              autoComplete="cc-number"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Used only in your browser to detect brand; only the last 4 digits are sent to our servers.
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">Expiry</label>
            <input
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="MM/YY"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">CVV</label>
            <input
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="123"
              type="password"
              autoComplete="cc-csc"
            />
            <p className="mt-1 text-[11px] text-slate-400">CVV is never stored.</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
          <IconCircle icon={Shield} theme="primary" size={16} className="h-9 w-9" />
          Monthly charges for Featured/Sponsored plans are collected through PayHere. Card details are tokenized
          by the gateway; MyWeddingLK stores masked metadata only.
        </div>

        <button
          onClick={savePaymentMethod}
          disabled={saving}
          className="mt-5 rounded-xl border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save payment method"}
        </button>
      </SectionCard>
    </section>
  );
}
