"use client";

import { Crown, Sparkles, X, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

const PRO_FEATURES = [
  "Up to 10 concurrent client weddings",
  "AI copilot — inquiry drafts & meeting summaries",
  "Full timeline & procurement workspace",
  "Priority support for your agency",
];

type Props = {
  open: boolean;
  onClose: () => void;
  message?: string;
};

export function PlannerUpgradeModal({ open, onClose, message }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-xl"
        )}
      >
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-primary/15 blur-2xl"
          aria-hidden
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="relative p-8 pt-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
            <Sparkles size={14} aria-hidden />
            Planner Pro
          </div>

          <h2
            id="upgrade-modal-title"
            className="font-playfair text-2xl font-bold text-foreground md:text-3xl"
          >
            Scale your planning studio
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {message ??
              "Your Free plan includes one active wedding. Upgrade to Planner Pro to onboard unlimited clients and unlock the full AI copilot."}
          </p>

          <ul className="mt-6 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Zap size={12} aria-hidden />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/planner/billing" size="lg" className="flex-1 gap-2">
              <Crown size={18} aria-hidden />
              Upgrade to Pro
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={onClose}>
              Not now
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Existing client portals stay active —{" "}
            <Link href="/planner/billing" className="font-semibold text-primary hover:underline">
              view billing
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
