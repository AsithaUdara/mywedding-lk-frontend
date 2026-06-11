import Link from "next/link";
import { Check } from "lucide-react";
import { MkSection, MkSectionHeader } from "@/modules/marketing/marketing-glass-ui";
import { mk } from "@/modules/marketing/marketing-theme";
import { cn } from "@/shared/lib/cn";

const tiers = [
  {
    name: "Free",
    price: "LKR 0",
    period: "/ month",
    description: "Solo planners testing the platform with one active wedding.",
    features: ["1 active client event", "Kanban CRM board", "Basic Gantt timeline", "Vendor directory access"],
    cta: "Start free",
    href: "/planner/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "LKR 6,000",
    period: "/ month",
    description: "Growing agencies managing multiple concurrent celebrations.",
    features: [
      "Up to 10 active events",
      "Full CRM + Gantt",
      "Vendor inquiry inbox",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Go Pro",
    href: "/planner/signup",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "Custom",
    period: "",
    description: "Established studios with teams, white-label needs, and high volume.",
    features: [
      "Unlimited events",
      "Team seats",
      "Commission settlements",
      "Dedicated onboarding",
      "Custom integrations",
    ],
    cta: "Contact sales",
    href: "/planner/signup",
    highlighted: false,
  },
];

export default function PricingTiers() {
  return (
    <MkSection id="pricing" alt>
      <MkSectionHeader
        eyebrow="SaaS pricing"
        title="Plans that scale with your agency"
        subtitle="From solo planners to multi-city studios — pick the tier that matches your client load."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
        {tiers.map((tier) => (
          <article
            key={tier.name}
            className={cn(
              "flex flex-col rounded-2xl p-8 transition-all duration-200",
              tier.highlighted
                ? "mk-pricing-pro lg:scale-[1.02]"
                : cn(mk.card, "border border-white/55")
            )}
          >
            {tier.highlighted && (
              <span className="mk-badge-gold mb-4 inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                Most popular
              </span>
            )}
            <p
              className={cn(
                "font-playfair text-lg font-medium tracking-wide",
                tier.highlighted ? "text-white/90" : "text-foreground"
              )}
            >
              {tier.name}
            </p>
            <p className="font-playfair mt-4 text-4xl font-normal tabular-nums">
              {tier.price}
              <span className="text-lg font-normal opacity-80">{tier.period}</span>
            </p>
            <p
              className={cn(
                "font-glass-body mt-3 text-sm leading-relaxed",
                tier.highlighted ? "text-white/85" : "text-muted-foreground"
              )}
            >
              {tier.description}
            </p>
            <ul className="mt-8 flex-1 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 font-glass-body text-sm">
                  <Check
                    size={16}
                    className={cn(
                      "mt-0.5 flex-shrink-0",
                      tier.highlighted ? "text-[hsl(42_48%_72%)]" : "text-primary"
                    )}
                    aria-hidden
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={tier.href}
              className={cn(
                "mt-8 inline-flex w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                tier.highlighted
                  ? "bg-white text-primary hover:opacity-95"
                  : mk.btnPrimary
              )}
            >
              {tier.cta}
            </Link>
          </article>
        ))}
      </div>
    </MkSection>
  );
}
