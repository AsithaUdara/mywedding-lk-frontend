import { Building2, CalendarHeart, Users } from "lucide-react";
import { mk } from "@/modules/marketing/marketing-theme";
import { cn } from "@/shared/lib/cn";

const metrics = [
  {
    icon: Users,
    value: "120+",
    label: "Planning agencies",
    sub: "Onboarded across Sri Lanka",
  },
  {
    icon: CalendarHeart,
    value: "2,400+",
    label: "Events managed",
    sub: "Timelines, budgets & bookings",
  },
  {
    icon: Building2,
    value: "850+",
    label: "Verified vendors",
    sub: "In the curated directory",
  },
];

export default function SocialProof() {
  return (
    <section className="pb-4 pt-8 sm:pt-10" aria-label="Platform metrics">
      <div className={mk.container}>
        <div className={cn(mk.glass, "rounded-2xl px-6 py-8 sm:px-8 sm:py-10")}>
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {metrics.map(({ icon: Icon, value, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center"
              >
                <div className={mk.iconWrap}>
                  <Icon size={22} strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <p className={mk.statValue}>{value}</p>
                  <p className="font-glass-body mt-1 text-sm font-semibold text-foreground">{label}</p>
                  <p className={cn(mk.body, "mt-0.5 text-xs")}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <p className={cn(mk.body, "mt-8 text-center text-xs")}>
            Trusted by boutique studios and multi-city agencies from Colombo to Kandy.
          </p>
        </div>
      </div>
    </section>
  );
}
