"use client";

import { CreditCard, Crown, Loader2, RefreshCw, Save } from "lucide-react";
import { useVendorSettingsPage } from "@/modules/vendor/dashboard/hooks/useVendorSettingsPage";
import { VendorPaymentMethodForm } from "@/modules/vendor/dashboard/VendorPaymentMethodForm";
import { VendorTierSelector } from "@/modules/vendor/dashboard/VendorTierSelector";
import { tierBadgeClass } from "@/modules/vendor/dashboard/vendorSettingsHelpers";
import {
  ErrorBanner,
  formatLKR,
  PageLoadingSkeleton,
  SuccessBanner,
} from "@/modules/vendor/dashboard/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { VENDOR_TIER_PRICING } from "@/modules/vendor/billing/constants";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export function VendorSettingsEditor() {
  const {
    currentTier,
    selectedTier,
    setSelectedTier,
    subscriptionStatus,
    hasPaymentMethod,
    savedLast4,
    savedBrand,
    paymentForm,
    updatePaymentField,
    planDirty,
    needsPaymentForUpgrade,
    savingPlan,
    savingPayment,
    message,
    error,
    showInitialSkeleton,
    isRefreshing,
    reload,
    savePlan,
    savePaymentMethod,
  } = useVendorSettingsPage();

  if (showInitialSkeleton) {
    return <PageLoadingSkeleton />;
  }

  const planSaveLabel =
    selectedTier === "Free"
      ? "Save plan"
      : planDirty
        ? "Save plan & pay via PayHere"
        : "Current plan";

  return (
    <section className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Plan & billing"
        description="Choose search visibility, manage your monthly plan, and pay securely via PayHere."
        badge="Account"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                tierBadgeClass(currentTier)
              )}
            >
              {currentTier} plan
            </span>
            <GlassButton
              variant="ghost"
              onClick={() => void reload()}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={cn(isRefreshing && "animate-spin")} aria-hidden />
              Refresh
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => void savePlan()}
              disabled={savingPlan || !planDirty || needsPaymentForUpgrade}
              className="gap-1.5"
            >
              {savingPlan ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <Save size={16} aria-hidden />
              )}
              {savingPlan ? "Processing…" : planSaveLabel}
            </GlassButton>
          </div>
        }
      />

      {needsPaymentForUpgrade && planDirty ? (
        <div
          className={cn(
            "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3",
            vg.body
          )}
          role="status"
        >
          <p className="font-medium text-foreground">Payment method required</p>
          <p className={cn("mt-0.5", vg.caption)}>
            Add a card below before upgrading to {selectedTier}.
          </p>
        </div>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}
      {message ? <SuccessBanner message={message} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassStatCard
          label="Current plan"
          value={currentTier}
          sub={`${formatLKR(VENDOR_TIER_PRICING[currentTier])}/mo · ${subscriptionStatus}`}
          icon={Crown}
          iconTheme={currentTier === "Sponsored" ? "accent" : currentTier === "Featured" ? "primary" : "muted"}
        />
        <GlassStatCard
          label="Payment method"
          value={hasPaymentMethod ? "On file" : "Not set"}
          sub={
            hasPaymentMethod && savedLast4
              ? `${savedBrand ?? "Card"} ···· ${savedLast4}`
              : "Required for paid plans"
          }
          icon={CreditCard}
          iconTheme={hasPaymentMethod ? "success" : "warning"}
        />
      </div>

      <div className={cn(vg.panel, "overflow-hidden")}>
        <div className="border-b border-white/40 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={vg.label}>Visibility tiers</p>
              <p className={cn("mt-0.5", vg.caption)}>
                Choose how prominently you appear in search results
              </p>
            </div>
            {planDirty ? (
              <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
                Plan changed
              </span>
            ) : null}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <VendorTierSelector
            selectedTier={selectedTier}
            currentTier={currentTier}
            onSelect={setSelectedTier}
            disabled={savingPlan}
          />

          <div className="mt-6 flex justify-end">
            <GlassButton
              variant="primary"
              onClick={() => void savePlan()}
              disabled={savingPlan || !planDirty || needsPaymentForUpgrade}
              className="gap-1.5"
            >
              {savingPlan ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <Save size={16} aria-hidden />
              )}
              {savingPlan ? "Processing…" : planSaveLabel}
            </GlassButton>
          </div>
        </div>

        <div className="border-t border-white/40 px-4 py-4 sm:px-6">
          <p className={vg.label}>Payment method</p>
          <p className={cn("mt-0.5", vg.caption)}>
            Visa, Mastercard, and other cards via PayHere — we never store full card numbers
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <VendorPaymentMethodForm
            form={paymentForm}
            hasPaymentMethod={hasPaymentMethod}
            savedBrand={savedBrand}
            savedLast4={savedLast4}
            saving={savingPayment}
            onChange={updatePaymentField}
            onSave={() => void savePaymentMethod()}
          />
        </div>
      </div>
    </section>
  );
}
