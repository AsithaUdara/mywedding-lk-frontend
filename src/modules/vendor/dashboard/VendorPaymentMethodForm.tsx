"use client";

import { CreditCard, Shield } from "lucide-react";
import type { PaymentFormState } from "@/modules/vendor/dashboard/vendorSettingsHelpers";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { StatIcon } from "@/modules/vendor/dashboard/ui";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={cn("mb-1.5 block", vg.label)}>{children}</label>;
}

export function VendorPaymentMethodForm({
  form,
  hasPaymentMethod,
  savedBrand,
  savedLast4,
  saving,
  onChange,
  onSave,
}: {
  form: PaymentFormState;
  hasPaymentMethod: boolean;
  savedBrand: string | null;
  savedLast4: string | null;
  saving: boolean;
  onChange: <K extends keyof PaymentFormState>(key: K, value: PaymentFormState[K]) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-5">
      {hasPaymentMethod && savedLast4 ? (
        <div className={cn("flex items-center gap-3", vd.metaBox)}>
          <StatIcon icon={CreditCard} theme="success" size={18} className="!h-10 !w-10" />
          <span className={vg.body}>
            {savedBrand ?? "Card"} ending in <strong>{savedLast4}</strong> on file
          </span>
        </div>
      ) : (
        <div
          className={cn(
            "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3",
            vg.body
          )}
          role="status"
        >
          <p className="font-medium text-foreground">No payment method on file</p>
          <p className={cn("mt-0.5", vg.caption)}>
            Add a card before upgrading to Featured or Sponsored.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel>Cardholder name</FieldLabel>
          <input
            value={form.cardholderName}
            onChange={(e) => onChange("cardholderName", e.target.value)}
            className={vd.input}
            placeholder="Name on card"
            autoComplete="cc-name"
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Card number</FieldLabel>
          <input
            value={form.cardNumber}
            onChange={(e) =>
              onChange("cardNumber", e.target.value.replace(/[^\d\s]/g, "").slice(0, 19))
            }
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
            value={form.expiry}
            onChange={(e) => onChange("expiry", e.target.value)}
            className={vd.input}
            placeholder="MM/YY"
            autoComplete="cc-exp"
          />
        </div>
        <div>
          <FieldLabel>CVV</FieldLabel>
          <input
            value={form.cvv}
            onChange={(e) => onChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
            className={vd.input}
            placeholder="123"
            type="password"
            autoComplete="cc-csc"
          />
          <p className={cn("mt-1", vg.caption)}>CVV is never stored.</p>
        </div>
      </div>

      <div className={cn("flex items-start gap-3", vd.metaBox)}>
        <StatIcon icon={Shield} theme="primary" size={16} className="!h-9 !w-9 flex-shrink-0" />
        <p className={cn("leading-relaxed", vg.caption)}>
          Monthly charges for Featured and Sponsored plans are collected through PayHere. Card details are
          tokenized by the gateway; MyWedding.lk stores masked metadata only.
        </p>
      </div>

      <div className="flex justify-end">
        <GlassButton variant="ghost" onClick={onSave} disabled={saving} className="gap-1.5">
          {saving ? "Saving…" : "Save payment method"}
        </GlassButton>
      </div>
    </div>
  );
}
