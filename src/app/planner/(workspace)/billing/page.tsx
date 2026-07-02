"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Crown, Settings, Users, Zap } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  createPlannerSubscriptionCheckout,
} from "@/shared/lib/api/planner";
import { usePlannerOverviewQuery } from "@/shared/hooks/query/usePlannerQueries";
import { usePlannerQueryInvalidation } from "@/shared/hooks/query/useQueryInvalidation";
import { submitPayHereCheckout } from "@/shared/lib/payhereCheckout";
import { BillingCapacityPanel } from "@/modules/planner/billing/BillingCapacityPanel";
import { BillingPlanCard } from "@/modules/planner/billing/BillingPlanCard";
import {
  computeBillingStats,
  PRO_MONTHLY_LKR,
} from "@/modules/planner/billing/plannerBillingHelpers";
import { PlannerPaymentMethodSection } from "@/modules/planner/billing/PlannerPaymentMethodSection";
import {
  ErrorBanner,
  SuccessBanner,
} from "@/modules/planner/components/ui";
import { PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";

export default function PlannerBillingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const { invalidatePlannerAll } = usePlannerQueryInvalidation();
  const {
    data: overview = null,
    isLoading: loading,
    error: queryError,
  } = usePlannerOverviewQuery();
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      setError(
        "Your planner subscription has expired. Renew Planner Pro below to restore CRM access."
      );
    }
  }, [searchParams]);

  useEffect(() => {
    const paymentReturn = searchParams.get("payment");
    if (paymentReturn === "success") {
      setMessage("Payment received. Planner Pro will activate shortly after confirmation.");
      void invalidatePlannerAll();
    } else if (paymentReturn === "cancelled") {
      setError("Payment was cancelled. Your plan was not changed.");
    }
  }, [searchParams, invalidatePlannerAll]);

  const stats = useMemo(() => computeBillingStats(overview), [overview]);

  const upgrade = async () => {
    if (!user) return;
    try {
      setUpgrading(true);
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
      setError("Could not start checkout. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed.");
    } finally {
      setUpgrading(false);
    }
  };

  if (loading && !overview) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Plan & billing"
        description="Manage your planner subscription, concurrent wedding limits, and PayHere payment method."
        badge="Account"
        action={
          <GlassButton href="/planner/settings" variant="ghost" className="gap-1.5">
            <Settings size={16} aria-hidden />
            Settings
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassStatCard
          label="Current plan"
          value={stats.activePlanLabel}
          sub={stats.isPro ? "Planner Pro active" : "Free tier"}
          icon={Crown}
          iconTheme={stats.isPro ? "accent" : "muted"}
        />
        <GlassStatCard
          label="Concurrent limit"
          value={stats.isPro ? "Unlimited" : stats.maxConcurrentEvents}
          sub={`${stats.activeWeddings} in use`}
          icon={Users}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Active weddings"
          value={stats.activeWeddings}
          sub="In your portfolio now"
          icon={Zap}
          iconTheme="success"
        />
        <GlassStatCard
          label="Next billing"
          value={stats.nextBillingLabel}
          sub={stats.nextBillingSub}
          icon={Crown}
          iconTheme={stats.isPro ? "accent" : "muted"}
        />
      </div>

      {!stats.isPro && (
        <GlassSectionCard
          title="Capacity usage"
          subtitle={`Free plan allows ${stats.maxConcurrentEvents} active wedding at a time`}
        >
          <BillingCapacityPanel stats={stats} />
        </GlassSectionCard>
      )}

      {stats.isPro && (
        <GlassSectionCard
          title="Payment method"
          subtitle="Renewals are processed securely through PayHere — we never store full card numbers"
        >
          <PlannerPaymentMethodSection
            isPro={stats.isPro}
            subscriptionEndsAt={overview?.subscriptionEndsAt}
            onUpdated={() => void invalidatePlannerAll()}
          />
        </GlassSectionCard>
      )}

      <GlassSectionCard
        title="Choose your plan"
        subtitle="Compare features and upgrade via PayHere when you scale your portfolio"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <BillingPlanCard tier="free" isCurrent={!stats.isPro} />
          <BillingPlanCard
            tier="pro"
            isCurrent={stats.isPro}
            upgrading={upgrading}
            onUpgrade={() => void upgrade()}
          />
        </div>
      </GlassSectionCard>
    </div>
  );
}
