import { Building2, CalendarHeart, Users } from "lucide-react";

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
    <section className="border-y border-border/70 bg-white/90 shadow-sm" aria-label="Platform metrics">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {metrics.map(({ icon: Icon, value, label, sub }) => (
            <div key={label} className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon size={22} strokeWidth={2} aria-hidden />
              </div>
              <div>
                <p className="font-playfair text-3xl font-bold tabular-nums text-foreground">{value}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Trusted by boutique studios and multi-city agencies from Colombo to Kandy.
        </p>
      </div>
    </section>
  );
}
