"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Inbox, LineChart, Store } from "lucide-react";
import { AnalyticsDashboard } from "@/modules/vendor/dashboard/AnalyticsDashboard";
import { InquiryManagementInbox } from "@/modules/vendor/dashboard/InquiryManagementInbox";
import { AvailabilityCalendar } from "@/modules/vendor/dashboard/AvailabilityCalendar";
import {
  Button,
  PageHeader,
  QuickActionLink,
  SectionCard,
} from "@/shared/components/ui";

const QUICK_LINKS = [
  {
    href: "/vendor/dashboard/analytics",
    label: "Analytics",
    description: "Profile views, inquiries, win rate",
    icon: LineChart,
  },
  {
    href: "/vendor/dashboard/inquiries",
    label: "Inquiry inbox",
    description: "Planner & client messages · send quotes",
    icon: Inbox,
  },
  {
    href: "/vendor/dashboard/availability",
    label: "Availability",
    description: "Block dates and show booked days",
    icon: CalendarDays,
  },
];

export default function VendorDashboardOverview() {
  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <PageHeader
        title="Dashboard"
        description="Your digital storefront and CRM — respond to planner inquiries, manage services, and keep availability up to date."
        badge="Overview"
        action={
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Store size={20} aria-hidden />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Storefront
              </p>
              <p className="text-sm font-semibold text-foreground">Live on MyWedding.lk</p>
            </div>
          </div>
        }
      />

      <SectionCard title="Quick links" subtitle="Jump to your most-used tools">
        <div className="grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((item) => (
            <QuickActionLink
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              icon={<item.icon size={18} />}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Performance"
        subtitle="Profile views, inquiries, and win rate from your storefront"
        action={
          <Button href="/vendor/dashboard/analytics" variant="secondary" size="sm">
            Full analytics
            <ArrowRight size={14} aria-hidden />
          </Button>
        }
      >
        <AnalyticsDashboard compact />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Inquiry inbox"
          subtitle="Planner and client messages — reply with official quotes"
          action={
            <Button href="/vendor/dashboard/inquiries" variant="secondary" size="sm">
              Open inbox
              <ArrowRight size={14} aria-hidden />
            </Button>
          }
        >
          <InquiryManagementInbox embedded />
        </SectionCard>

        <SectionCard
          title="Availability"
          subtitle="Booked and blocked dates at a glance"
          action={
            <Button href="/vendor/dashboard/availability" variant="secondary" size="sm">
              Open calendar
              <ArrowRight size={14} aria-hidden />
            </Button>
          }
        >
          <AvailabilityCalendar embedded />
        </SectionCard>
      </div>
    </div>
  );
}
