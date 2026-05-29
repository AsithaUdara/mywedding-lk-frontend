import Link from "next/link";
import { Check } from "lucide-react";

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
    price: "LKR 9,900",
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
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">SaaS pricing</p>
          <h2 className="mt-3 font-playfair text-4xl font-bold text-charcoal md:text-5xl">
            Plans that scale with your agency
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            From solo planners to multi-city studios — pick the tier that matches your client load.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`rounded-[2rem] border p-8 shadow-sm transition hover:shadow-lg ${
                tier.highlighted
                  ? "border-charcoal bg-charcoal text-white shadow-xl"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-wider opacity-80">{tier.name}</p>
              <p className="mt-4 font-playfair text-4xl font-bold">
                {tier.price}
                <span className="text-lg font-normal opacity-70">{tier.period}</span>
              </p>
              <p className={`mt-3 text-sm ${tier.highlighted ? "text-white/80" : "text-slate-600"}`}>
                {tier.description}
              </p>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                  tier.highlighted
                    ? "bg-white text-charcoal hover:bg-slate-100"
                    : "bg-charcoal text-white hover:bg-neutral-900"
                }`}
              >
                {tier.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
