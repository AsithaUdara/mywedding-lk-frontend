"use client";

import { ArrowRight, CalendarDays, Inbox, LineChart, Store } from "lucide-react";
import { AnalyticsDashboard } from "@/modules/vendor/dashboard/AnalyticsDashboard";
import { InquiryManagementInbox } from "@/modules/vendor/dashboard/InquiryManagementInbox";
import { AvailabilityCalendar } from "@/modules/vendor/dashboard/AvailabilityCalendar";
import {
  GlassButton,
  GlassPageHeader,
  GlassQuickActionLink,
  GlassSectionCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { useVendorVerification } from "@/modules/vendor/dashboard/VendorVerificationContext";
import { VendorVerificationStatusChip } from "@/modules/vendor/dashboard/VendorVerificationBanner";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const QUICK_LINKS = [
  {
    href: "/vendor/dashboard/analytics",
    label: "Analytics",
    description: "Views, inquiries, win rate",
    icon: LineChart,
  },
  {
    href: "/vendor/dashboard/inquiries",
    label: "Inquiries",
    description: "Messages and quotes",
    icon: Inbox,
  },
  {
    href: "/vendor/dashboard/availability",
    label: "Availability",
    description: "Calendar and blocked dates",
    icon: CalendarDays,
  },
];

function StorefrontStatusPill() {
  const { loading, isVerified } = useVendorVerification();

  if (loading) {
    return (
      <div className={vg.storefrontPill}>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", vg.iconAccent)}>
          <Store size={16} aria-hidden />
        </div>
        <div>
          <p className={vg.label}>Storefront</p>
          <p className={cn("font-glass-body text-sm font-medium text-muted-foreground")}>…</p>
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
        <p className={cn("font-glass-body text-sm font-medium text-foreground")}>Live</p>
      </div>
    </div>
  );
}

export default function VendorDashboardOverview() {
  return (
    <div className="space-y-6 md:space-y-8">
      <GlassPageHeader
        title="Dashboard"
        description="Respond to inquiries, manage services, and keep your storefront up to date."
        badge="Overview"
        action={<StorefrontStatusPill />}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <GlassQuickActionLink
            key={item.href}
            href={item.href}
            label={item.label}
            description={item.description}
            icon={<item.icon size={16} />}
          />
        ))}
      </div>

      <GlassSectionCard
        title="Performance"
        subtitle="This week · profile views, inquiries, win rate"
        action={
          <GlassButton href="/vendor/dashboard/analytics">
            Analytics
            <ArrowRight size={14} aria-hidden />
          </GlassButton>
        }
      >
        <AnalyticsDashboard compact />
      </GlassSectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassSectionCard
          title="Inquiries"
          subtitle="Recent planner and client messages"
          action={
            <GlassButton href="/vendor/dashboard/inquiries">
              Inbox
              <ArrowRight size={14} aria-hidden />
            </GlassButton>
          }
        >
          <InquiryManagementInbox embedded />
        </GlassSectionCard>

        <GlassSectionCard
          title="Availability"
          subtitle="Booked and blocked dates"
          action={
            <GlassButton href="/vendor/dashboard/availability">
              Calendar
              <ArrowRight size={14} aria-hidden />
            </GlassButton>
          }
        >
          <AvailabilityCalendar embedded />
        </GlassSectionCard>
      </div>
    </div>
  );
}
