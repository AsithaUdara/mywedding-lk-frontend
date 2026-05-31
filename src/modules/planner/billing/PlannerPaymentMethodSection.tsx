"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarClock,
  CreditCard,
  ExternalLink,
  Shield,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  createPlannerSubscriptionCheckout,
  getPlannerBillingProfile,
  savePlannerBillingProfile,
  type PlannerBillingProfile,
} from "@/shared/lib/api/planner";
import { submitPayHereCheckout } from "@/shared/lib/payhereCheckout";
import { ErrorBanner, SuccessBanner } from "@/modules/planner/components/ui";
import { inputClass, StatIcon } from "@/modules/vendor/dashboard/ui";
import { GlassButton, GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const PRO_MONTHLY_LKR = 6_000;

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={cn("mb-1.5 block", vg.label)}>{children}</label>;
}

function detectBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return "Card";
}

function formatCardNumberInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiryInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatBillingDate(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { dateStyle: "long" });
}

function formatLKR(amount: number) {
  if (amount >= 1000) return `LKR ${Math.round(amount / 1000)}K`;
  return `LKR ${amount.toLocaleString()}`;
}

type Props = {
  isPro: boolean;
  subscriptionEndsAt?: string | null;
  onUpdated?: () => void;
};

export function PlannerPaymentMethodSection({ isPro, subscriptionEndsAt, onUpdated }: Props) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PlannerBillingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingCard, setUpdatingCard] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerBillingProfile(token);
      setProfile(data);
      if (data.cardholderName) setCardholderName(data.cardholderName);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment method.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isPro) void load();
  }, [isPro, load]);

  const resetSensitiveFields = () => {
    setCardNumber("");
    setExpiry("");
    setCvv("");
  };

  const saveMaskedCard = async () => {
    if (!user) return;
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 13) {
      setError("Enter a valid card number.");
      return;
    }
    const [mm, yy] = expiry.split("/").map((p) => p.trim());
    if (!cardholderName.trim() || !mm || !yy || mm.length !== 2 || yy.length !== 2) {
      setError("Cardholder name and expiry (MM/YY) are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();
      await savePlannerBillingProfile(token, {
        cardholderName: cardholderName.trim(),
        cardBrand: detectBrand(digits),
        last4: digits.slice(-4),
        expiryMonth: Number(mm),
        expiryYear: 2000 + Number(yy),
      });
      setMessage("Payment method updated. Only the last 4 digits are stored.");
      resetSensitiveFields();
      setShowManualForm(false);
      await load();
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment method.");
    } finally {
      setSaving(false);
    }
  };

  const updateViaPayHere = async () => {
    if (!user) return;
    try {
      setUpdatingCard(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();
      const checkout = await createPlannerSubscriptionCheckout(token, {
        tier: "PlannerPro",
        monthlyFee: PRO_MONTHLY_LKR,
      });
      if (checkout?.checkout?.checkoutUrl) {
        submitPayHereCheckout(checkout.checkout, { target: "_self" });
        return;
      }
      setError("Could not start PayHere checkout.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "PayHere checkout failed.");
    } finally {
      setUpdatingCard(false);
    }
  };

  if (!isPro) return null;

  const hasCard = Boolean(profile?.hasPaymentMethod && profile.last4);
  const showForm = !hasCard || showManualForm;

  return (
    <GlassSectionCard
      title="Payment method"
      subtitle="Renewals are processed securely through PayHere — we never store full card numbers"
    >
      {error && <ErrorBanner message={error} className="mb-4" />}
      {message && <SuccessBanner message={message} className="mb-4" />}

      <div className={cn("mb-5 flex items-start gap-3 rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm")}>
        <StatIcon icon={Shield} theme="primary" size={16} className="!h-9 !w-9 shrink-0" />
        <p className={cn("leading-relaxed", vg.caption)}>
          Card details are entered on PayHere&apos;s secure checkout. MyWedding.lk only keeps masked
          metadata (brand and last 4 digits) for display on this page.
        </p>
      </div>

      {loading ? (
        <p className={cn("py-6 text-center", vg.subtitle)}>Loading payment method…</p>
      ) : (
        <>
          {hasCard && (
            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm">
                <StatIcon icon={CreditCard} theme="success" size={18} className="!h-10 !w-10" />
                <div>
                  <p className={vg.label}>Card on file</p>
                  <p className="mt-1 font-medium text-foreground">
                    {profile?.cardBrand ?? "Card"} •••• {profile?.last4}
                  </p>
                  {profile?.expiryMonth && profile?.expiryYear && (
                    <p className={cn("mt-1", vg.caption)}>
                      Expires {String(profile.expiryMonth).padStart(2, "0")}/
                      {String(profile.expiryYear).slice(-2)}
                    </p>
                  )}
                  {profile?.cardholderName && (
                    <p className={cn("mt-1", vg.caption)}>{profile.cardholderName}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm">
                <StatIcon icon={CalendarClock} theme="accent" size={18} className="!h-10 !w-10" />
                <div>
                  <p className={vg.label}>Next charge</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                    {formatBillingDate(subscriptionEndsAt)}
                  </p>
                  <p className={cn("mt-1", vg.caption)}>
                    {formatLKR(PRO_MONTHLY_LKR)} · Planner Pro renewal via PayHere
                  </p>
                </div>
              </div>
            </div>
          )}

          {!hasCard && (
            <div className="mb-5 rounded-xl border border-[hsl(42_48%_52%/0.25)] bg-[hsl(42_48%_52%/0.08)] px-4 py-3 text-sm leading-relaxed text-foreground">
              <p className="font-medium">No payment method on file</p>
              <p className={cn("mt-1", vg.subtitle)}>
                Add a card through PayHere to keep Planner Pro active after your current period.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <GlassButton
              type="button"
              variant="primary"
              className="gap-1.5"
              disabled={updatingCard}
              onClick={() => void updateViaPayHere()}
            >
              <ExternalLink size={16} aria-hidden />
              {updatingCard
                ? "Opening PayHere…"
                : hasCard
                  ? "Update card via PayHere"
                  : "Add card via PayHere"}
            </GlassButton>

            {hasCard && !showManualForm && (
              <GlassButton
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowManualForm(true);
                  resetSensitiveFields();
                  setError(null);
                }}
              >
                Replace card manually
              </GlassButton>
            )}
          </div>

          {showForm && (
            <div className="mt-6 border-t border-white/40 pt-6">
              {hasCard ? (
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className={cn("font-medium", vg.body)}>Manual card entry</p>
                  <GlassButton
                    type="button"
                    variant="ghost"
                    className="!px-2 !py-1 text-xs"
                    onClick={() => {
                      setShowManualForm(false);
                      resetSensitiveFields();
                      setError(null);
                    }}
                  >
                    Close
                  </GlassButton>
                </div>
              ) : (
                <p className={cn("mb-4 font-medium", vg.body)}>Or enter test card details</p>
              )}

              <p className={cn("mb-4", vg.caption)}>
                For sandbox testing only. Only the last 4 digits are sent to our servers; CVV is never
                stored.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel>Cardholder name</FieldLabel>
                  <input
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className={glassInput}
                    placeholder="Name on card"
                    autoComplete="cc-name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Card number</FieldLabel>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                    className={glassInput}
                    placeholder="•••• •••• •••• ••••"
                    inputMode="numeric"
                    autoComplete="cc-number"
                  />
                </div>
                <div>
                  <FieldLabel>Expiry</FieldLabel>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiryInput(e.target.value))}
                    className={glassInput}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                  />
                </div>
                <div>
                  <FieldLabel>CVV</FieldLabel>
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className={glassInput}
                    placeholder="•••"
                    type="password"
                    autoComplete="cc-csc"
                  />
                  <p className={cn("mt-1", vg.caption)}>Never stored.</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <GlassButton
                  type="button"
                  variant={hasCard ? "ghost" : "primary"}
                  disabled={saving}
                  onClick={() => void saveMaskedCard()}
                >
                  {saving ? "Saving…" : "Save masked details"}
                </GlassButton>
                {hasCard && (
                  <GlassButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowManualForm(false);
                      resetSensitiveFields();
                      setError(null);
                    }}
                  >
                    Cancel
                  </GlassButton>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </GlassSectionCard>
  );
}
