"use client";

import {
  BadgeCheck,
  ExternalLink,
  ListChecks,
  Loader2,
  RefreshCw,
  Save,
  Store,
} from "lucide-react";
import { useVendorProfilePage } from "@/modules/vendor/dashboard/hooks/useVendorProfilePage";
import { VendorProfileForm } from "@/modules/vendor/dashboard/VendorProfileForm";
import { VendorProfilePreview } from "@/modules/vendor/dashboard/VendorProfilePreview";
import { VendorPublishRestrictionNotice } from "@/modules/vendor/dashboard/VendorVerificationBanner";
import {
  EmptyState,
  ErrorBanner,
  PageLoadingSkeleton,
  SuccessBanner,
} from "@/modules/vendor/dashboard/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

function VerificationBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        verified
          ? "bg-success/10 text-success ring-1 ring-success/20"
          : "bg-white/55 text-muted-foreground ring-1 ring-white/60"
      )}
    >
      {verified ? (
        <>
          <BadgeCheck size={14} aria-hidden />
          Verified
        </>
      ) : (
        "Pending verification"
      )}
    </span>
  );
}

export function VendorProfileEditor() {
  const {
    profile,
    form,
    updateField,
    completeness,
    isDirty,
    needsProfileAttention,
    saving,
    error,
    success,
    showInitialSkeleton,
    isRefreshing,
    verification,
    reload,
    save,
  } = useVendorProfilePage();

  if (showInitialSkeleton) {
    return <PageLoadingSkeleton />;
  }

  if (!profile) {
    return (
      <div className="space-y-6 pb-4 md:space-y-8">
        <GlassPageHeader
          title="Business profile"
          description="Manage your public listing details on MyWedding.lk."
          badge="Storefront"
        />
        {error ? <ErrorBanner message={error} /> : null}
        <EmptyState
          title="Profile not available"
          description="We could not load your vendor profile. Try refreshing or complete vendor registration."
          icon={Store}
          action={
            <GlassButton variant="ghost" onClick={() => void reload()} className="gap-1.5">
              <RefreshCw size={16} aria-hidden />
              Retry
            </GlassButton>
          }
          className="border-0 bg-transparent shadow-none"
        />
      </div>
    );
  }

  const isVerified = verification.isVerified;
  const headerTitle = form.businessName.trim() || profile.businessName.trim() || "Business profile";

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title={headerTitle}
        description="Location, contact, and about text — couples see this on your public listing and map."
        badge="Storefront"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge verified={isVerified} />
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
              href={`/vendor/${profile.userId}`}
              variant="ghost"
              className="gap-1.5"
            >
              <ExternalLink size={16} aria-hidden />
              Public listing
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={() => void save()}
              disabled={saving || !isDirty}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <Save size={16} aria-hidden />
              )}
              Save changes
            </GlassButton>
          </div>
        }
      />

      {!verification.canPublishListings ? <VendorPublishRestrictionNotice /> : null}

      {needsProfileAttention ? (
        <div
          className={cn(
            "rounded-xl border border-primary/20 bg-primary/5 px-4 py-3",
            vg.body
          )}
          role="status"
        >
          <p className="font-medium text-foreground">
            {completeness.missing.length === 1
              ? "1 field still needed for a complete storefront"
              : `${completeness.missing.length} fields still needed for a complete storefront`}
          </p>
          <p className={cn("mt-0.5", vg.caption)}>
            Missing: {completeness.missing.join(", ")}. These help you appear in local search and build
            trust before the first inquiry.
          </p>
        </div>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}
      {success ? <SuccessBanner message={success} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassStatCard
          label="Profile complete"
          value={`${completeness.percent}%`}
          sub={
            completeness.percent === 100
              ? "Ready for discovery"
              : `${completeness.filled} of ${completeness.total} essentials`
          }
          icon={ListChecks}
          iconTheme={completeness.percent === 100 ? "success" : "warning"}
        />
        <GlassStatCard
          label="Verification"
          value={isVerified ? "Approved" : verification.isRejected ? "Not approved" : "In review"}
          sub={
            isVerified
              ? "Marketplace publishing enabled"
              : verification.isPending
                ? "Usually 1–2 business days"
                : "Update details and contact support"
          }
          icon={BadgeCheck}
          iconTheme={isVerified ? "success" : verification.isRejected ? "warning" : "muted"}
        />
      </div>

      <div className={cn(vg.panel, "overflow-hidden")}>
        <div className="grid gap-0 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <div className="border-b border-white/40 p-4 sm:p-6 lg:border-b-0 lg:border-r">
            <p className={vg.label}>Live preview</p>
            <p className={cn("mt-0.5", vg.caption)}>How couples see you in search</p>
            <div className="mt-4">
              <VendorProfilePreview form={form} isVerified={isVerified} />
            </div>
          </div>

          <form
            className="p-4 sm:p-6"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
          >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={vg.label}>Listing details</p>
                <p className={cn("mt-0.5", vg.caption)}>
                  Used on your vendor page, search filters, and map embed
                </p>
              </div>
              {isDirty ? (
                <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warning">
                  Unsaved changes
                </span>
              ) : null}
            </div>

            <VendorProfileForm form={form} onChange={updateField} />

            <div className="mt-6 flex justify-end">
              <GlassButton
                variant="primary"
                type="submit"
                disabled={saving || !isDirty}
                className="gap-1.5"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                ) : (
                  <Save size={16} aria-hidden />
                )}
                Save changes
              </GlassButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
