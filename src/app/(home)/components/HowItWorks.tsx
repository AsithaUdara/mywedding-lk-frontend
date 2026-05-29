import { ClipboardList, Handshake, Wallet } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Onboard your client",
    description:
      "Create the wedding event, invite the couple, and set roles — your CRM and checklist start in minutes, not spreadsheets.",
  },
  {
    number: "02",
    icon: Handshake,
    title: "Shortlist vendors",
    description:
      "Pull from Sri Lanka's verified directory, send proposals for client approval, and track inquiries in one procurement pipeline.",
  },
  {
    number: "03",
    icon: Wallet,
    title: "Get paid",
    description:
      "Digital contracts, PayHere deposits, and commission tracking — close bookings with audit-ready paperwork.",
  },
];

export default function HowItWorks() {
  return (
    <section className="marketing-section-alt py-20 md:py-28" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-3 font-playfair text-3xl font-bold text-foreground md:text-4xl">
            Your agency operating system in three steps
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            From first client call to vendor payout — built for professional planners, not generic project tools.
          </p>
        </div>

        <ol className="mt-16 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.number}
                className="relative flex flex-col rounded-3xl border border-border bg-white p-8 shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <span className="font-playfair text-4xl font-light tabular-nums text-primary">{step.number}</span>
                <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon size={28} strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mt-6 text-xl font-bold text-foreground">{step.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
