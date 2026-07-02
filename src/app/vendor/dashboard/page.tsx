"use client";

import { useMemo } from "react";
import { CalendarCheck, Eye, MessageSquare, RefreshCw, Store, Trophy } from "lucide-react";
import { useVendorDashboard } from "@/modules/vendor/dashboard/hooks/useVendorDashboard";
import {
  buildVendorAttentionItems,
  vendorStorefrontSummary,
  vendorThisWeekViews,
  vendorWinRatePct,
} from "@/modules/vendor/dashboard/vendorDashboardHelpers";
import { VendorAttentionPanel } from "@/modules/vendor/dashboard/VendorAttentionPanel";
import { VendorInquiryPreviewRow } from "@/modules/vendor/dashboard/VendorInquiryPreviewRow";
import { VendorVerificationStatusChip } from "@/modules/vendor/dashboard/VendorVerificationBanner";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { ErrorBanner, PageLoadingSkeleton, formatLKR } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { VendorVerificationContextValue } from "@/modules/vendor/dashboard/VendorVerificationContext";

function StorefrontStatusPill({ verification }: { verification: VendorVerificationContextValue }) {
  const { loading, isVerified } = verification;

  if (loading) {
    return (
      <div className={vg.storefrontPill}>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", vg.iconAccent)}>
          <Store size={16} aria-hidden />
        </div>
        <div>
          <p className={vg.label}>Storefront</p>
          <p className="text-sm font-medium text-muted-foreground">…</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return <VendorVerificationStatusChip />;
  }

  return (
    <div className={vg.storefrontPill}>
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", vg.iconPrimary)}>
        <Store size={16} aria-hidden />
      </div>
      <div>
        <p className={vg.label}>Storefront</p>
        <p className="text-sm font-medium text-foreground">Live</p>
      </div>
    </div>
  );
}

export default function VendorDashboardOverview() {
  const {
    profile,
    analytics,
    previewInquiries,
    profileViews,
    winRate,
    requestedCount,
    verification,
    loading,
    refreshing,
    error,
    reload,
  } = useVendorDashboard();

  const storefront = vendorStorefrontSummary(analytics);
  const thisWeekViews = vendorThisWeekViews(profileViews);
  const winPct = vendorWinRatePct(winRate);

  const attentionItems = useMemo(
    () =>
      buildVendorAttentionItems({
        requestedBookings: requestedCount,
        unreadInquiries: storefront.unreadInquiries,
        isVerified: verification.isVerified,
        isPending: verification.isPending,
        isRejected: verification.isRejected,
        activeServices: storefront.activeServices,
      }),
    [
      requestedCount,
      storefront.unreadInquiries,
      storefront.activeServices,
      verification.isVerified,
      verification.isPending,
      verification.isRejected,
    ]
  );

  const primaryAction = attentionItems[0];
  const businessName = profile?.businessName?.trim() || "Storefront";

  if (loading && !analytics) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title={businessName}
        description={
          verification.isVerified
            ? `${storefront.activeServices} live service${storefront.activeServices === 1 ? "" : "s"} · ${formatLKR(storefront.totalRevenue)} confirmed · ${storefront.totalReviews > 0 ? `${storefront.averageRating.toFixed(1)}★ (${storefront.totalReviews} reviews)` : "No reviews yet"}`
            : verification.isPending
              ? "Complete your profile while verification is in progress"
              : "Respond to inquiries and prepare your marketplace listing"
        }
        badge="Overview"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StorefrontStatusPill verification={verification} />
            <GlassButton
              type="button"
              variant="ghost"
              disabled={refreshing}
              onClick={() => void reload()}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} aria-hidden />
              Refresh
            </GlassButton>
            {primaryAction ? (
              <GlassButton href={primaryAction.href} variant="primary">
                {primaryAction.title}
              </GlassButton>
            ) : null}
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStatCard
          label="Booking requests"
          value={requestedCount}
          sub={requestedCount > 0 ? "Awaiting response" : "No pending requests"}
          icon={CalendarCheck}
          iconTheme={requestedCount > 0 ? "warning" : "success"}
        />
        <GlassStatCard
          label="Unread inquiries"
          value={storefront.unreadInquiries}
          sub={storefront.unreadInquiries > 0 ? "Awaiting reply" : "Inbox clear"}
          icon={MessageSquare}
          iconTheme={storefront.unreadInquiries > 0 ? "warning" : "success"}
        />
        <GlassStatCard
          label="Profile views"
          value={thisWeekViews}
          sub="This week"
          icon={Eye}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Win rate"
          value={`${winPct}%`}
          sub="Inquiries → confirmed"
          icon={Trophy}
          iconTheme="accent"
        />
      </div>

      <VendorAttentionPanel items={attentionItems} />

      {previewInquiries.length > 0 && (
        <GlassSectionCard
          title="Recent inquiries"
          subtitle="Latest planner and client messages"
          action={
            <GlassButton href="/vendor/dashboard/inquiries" variant="ghost" className="gap-1">
              Open inbox
            </GlassButton>
          }
        >
          <ul className="space-y-3" role="list">
            {previewInquiries.map((inquiry) => (
              <VendorInquiryPreviewRow key={inquiry.id} inquiry={inquiry} />
            ))}
          </ul>
        </GlassSectionCard>
      )}
    </div>
  );
}
