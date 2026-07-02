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
import {
  BILLING_JIRA_INPUT,
  formatBillingDateLong,
  formatCardExpiry,
  PRO_MONTHLY_LKR,
} from "@/modules/planner/billing/plannerBillingHelpers";
import { ErrorBanner, SuccessBanner } from "@/modules/planner/components/ui";
import { plannerSurface } from "@/modules/planner/theme/plannerWorkspaceTheme";
import { formatLKR } from "@/shared/lib/format";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#97A0AF]">
      {children}
    </label>
  );
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
    const [mm, yy] = expiry.split("/").map((part) => part.trim());
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
  const expiryLabel = formatCardExpiry(profile?.expiryMonth, profile?.expiryYear);

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3", plannerSurface.infoPanel)}>
        <Shield size={18} className={cn("mt-0.5 shrink-0", plannerSurface.infoIcon)} aria-hidden />
        <p className="text-sm leading-relaxed text-[#42526E]">
          Card details are entered on PayHere&apos;s secure checkout. MyWedding.lk only keeps masked
          metadata (brand and last 4 digits) for display on this page.
        </p>
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-[#5E6C84]">Loading payment method…</p>
      ) : (
        <>
          {hasCard ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-lg border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_1px_rgba(9,30,66,0.08)]">
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", plannerSurface.iconWellPrimary)}>
                    <CreditCard size={18} aria-hidden />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">
                      Card on file
                    </p>
                    <p className="mt-1 font-medium text-[#172B4D]">
                      {profile?.cardBrand ?? "Card"} •••• {profile?.last4}
                    </p>
                    {expiryLabel && (
                      <p className="mt-1 text-xs text-[#5E6C84]">Expires {expiryLabel}</p>
                    )}
                    {profile?.cardholderName && (
                      <p className="mt-1 text-xs text-[#5E6C84]">{profile.cardholderName}</p>
                    )}
                  </div>
                </div>
              </article>

              <article className="rounded-lg border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_1px_rgba(9,30,66,0.08)]">
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", plannerSurface.iconWellAccent)}>
                    <CalendarClock size={18} aria-hidden />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#97A0AF]">
                      Next charge
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-[#172B4D]">
                      {formatBillingDateLong(subscriptionEndsAt)}
                    </p>
                    <p className="mt-1 text-xs text-[#5E6C84]">
                      {formatLKR(PRO_MONTHLY_LKR)} · Planner Pro renewal via PayHere
                    </p>
                  </div>
                </div>
              </article>
            </div>
          ) : (
            <div className={cn("rounded-lg border px-4 py-3", plannerSurface.noticePanel)}>
              <p className="font-medium text-[#172B4D]">No payment method on file</p>
              <p className="mt-1 text-sm text-[#5E6C84]">
                Add a card through PayHere to keep Planner Pro active after your current period.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
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
            <div className="rounded-lg border border-[#EBECF0] bg-[#FAFBFC] p-4">
              {hasCard ? (
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#172B4D]">Manual card entry</p>
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
                <p className="mb-4 text-sm font-semibold text-[#172B4D]">Or enter test card details</p>
              )}

              <p className="mb-4 text-xs text-[#5E6C84]">
                For sandbox testing only. Only the last 4 digits are sent to our servers; CVV is never
                stored.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FieldLabel>Cardholder name</FieldLabel>
                  <input
                    value={cardholderName}
                    onChange={(event) => setCardholderName(event.target.value)}
                    className={BILLING_JIRA_INPUT}
                    placeholder="Name on card"
                    autoComplete="cc-name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel>Card number</FieldLabel>
                  <input
                    value={cardNumber}
                    onChange={(event) => setCardNumber(formatCardNumberInput(event.target.value))}
                    className={BILLING_JIRA_INPUT}
                    placeholder="•••• •••• •••• ••••"
                    inputMode="numeric"
                    autoComplete="cc-number"
                  />
                </div>
                <div>
                  <FieldLabel>Expiry</FieldLabel>
                  <input
                    value={expiry}
                    onChange={(event) => setExpiry(formatExpiryInput(event.target.value))}
                    className={BILLING_JIRA_INPUT}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                  />
                </div>
                <div>
                  <FieldLabel>CVV</FieldLabel>
                  <input
                    value={cvv}
                    onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    className={BILLING_JIRA_INPUT}
                    placeholder="•••"
                    type="password"
                    autoComplete="cc-csc"
                  />
                  <p className="mt-1 text-xs text-[#97A0AF]">Never stored.</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
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
    </div>
  );
}
