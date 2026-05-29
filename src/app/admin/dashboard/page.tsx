"use client";

import { useMemo } from "react";
import { ArrowRight, RefreshCw, ShieldCheck, ShieldAlert, Users, Wallet } from "lucide-react";
import { VendorApprovalQueue } from "@/modules/admin/VendorApprovalQueue";
import { usePlatformAnalytics } from "@/modules/admin/hooks/usePlatformAnalytics";
import { AdminPlatformKpis } from "@/modules/admin/components/AdminPlatformKpis";
import { AdminGrowthChart } from "@/modules/admin/components/AdminGrowthChart";
import { AdminEcosystemSnapshot } from "@/modules/admin/components/AdminEcosystemSnapshot";
import {
  Badge,
  Button,
  Card,
  ErrorBanner,
  PageHeader,
  PageLoadingSkeleton,
  QuickActionLink,
  SectionCard,
} from "@/shared/components/ui";

const QUICK_LINKS = [
  {
    href: "/admin/vendors",
    label: "KYB queue",
    description: "Approve or reject vendor applications",
    icon: ShieldAlert,
  },
  {
    href: "/admin/dashboard/commissions",
    label: "Commission payouts",
    description: "Settle vendor payouts from confirmed bookings",
    icon: Wallet,
  },
  {
    href: "/vendors",
    label: "Public directory",
    description: "Preview couple-facing vendor hub",
    icon: Users,
  },
];

export default function AdminDashboardPage() {
  const { data, loading, refreshing, error, reload } = usePlatformAnalytics();

  const growthMax = useMemo(
    () => Math.max(...(data?.plannerGrowthByMonth.map((p) => p.count) ?? [1]), 1),
    [data]
  );

  if (loading && !data) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <PageHeader
        title="Operations center"
        description="Platform financial health, planner growth, and vendor trust & safety — live from your admin API."
        badge={
          <Badge variant="muted" className="inline-flex items-center gap-1.5">
            <ShieldCheck size={12} aria-hidden />
            Internal
          </Badge>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={refreshing}
              onClick={() => void reload()}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} aria-hidden />
              Refresh
            </Button>
            <Button href="/admin/vendors" size="sm">
              <ShieldAlert size={16} aria-hidden />
              KYB queue
            </Button>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      {data && (
        <>
          <AdminPlatformKpis data={data} />

          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard
              className="lg:col-span-2"
              title="Planner growth"
              subtitle="Active planners — 6 month trend"
              action={
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                  {data.activePlanners} active
                </span>
              }
            >
              <AdminGrowthChart points={data.plannerGrowthByMonth} max={growthMax} />
              <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">{data.totalUsers}</strong> users
                </span>
                <span>
                  <strong className="text-foreground">{data.totalEvents}</strong> events
                </span>
                <span>
                  <strong className="text-foreground">{data.totalBookings}</strong> bookings
                </span>
              </div>
            </SectionCard>

            <SectionCard title="Ecosystem snapshot" subtitle="Platform scale at a glance">
              <AdminEcosystemSnapshot data={data} />
            </SectionCard>
          </div>

          <SectionCard title="Quick links" subtitle="Common admin workflows">
            <div className="grid gap-3 sm:grid-cols-2">
              {QUICK_LINKS.map((item) => (
                <QuickActionLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  description={item.description}
                  icon={<item.icon size={18} aria-hidden />}
                />
              ))}
            </div>
          </SectionCard>
        </>
      )}

      <SectionCard
        title="Vendor approval queue"
        subtitle="Know-your-business review before marketplace listing"
        action={
          <Button href="/admin/vendors" variant="secondary" size="sm">
            Full queue
            <ArrowRight size={14} aria-hidden />
          </Button>
        }
      >
        <VendorApprovalQueue embedded />
      </SectionCard>

      <Card className="border-primary/20 bg-primary text-primary-foreground">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
              Platform integrity
            </p>
            <h3 className="mt-2 font-playfair text-2xl font-bold">Keep the marketplace trustworthy</h3>
            <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
              Verified vendors protect couples and planners. Review credentials, portfolio links, and
              business details before approval.
            </p>
          </div>
          <Button
            href="/admin/vendors"
            variant="secondary"
            className="shrink-0 border-0 bg-card text-primary hover:opacity-95"
          >
            Review applications
            <ArrowRight size={16} aria-hidden />
          </Button>
        </div>
      </Card>
    </div>
  );
}
