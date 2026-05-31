import { ClipboardList, Handshake, Wallet } from "lucide-react";
import { MkSection, MkSectionHeader } from "@/modules/marketing/marketing-glass-ui";
import { mk } from "@/modules/marketing/marketing-theme";
import { cn } from "@/shared/lib/cn";

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
    <MkSection id="how-it-works">
      <MkSectionHeader
        eyebrow="How it works"
        title="Your agency operating system in three steps"
        subtitle="From first client call to vendor payout — built for professional planners, not generic project tools."
      />

      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <li key={step.number} className={cn(mk.card, "relative flex flex-col")}>
              <span className="font-luxury-section text-4xl font-light tabular-nums text-primary">
                {step.number}
              </span>
              <div className={cn(mk.iconWrapLg, "mt-4")}>
                <Icon size={28} strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="font-glass-body mt-6 text-xl font-semibold text-foreground">{step.title}</h3>
              <p className={cn(mk.body, "mt-3 flex-1")}>{step.description}</p>
            </li>
          );
        })}
      </ol>
    </MkSection>
  );
}
