"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { useVendorVerification } from "./VendorVerificationContext";

const PENDING_COPY = {
  eyebrow: "Under review",
  title: "We're verifying your business",
  body: "Review usually takes 1–2 business days. You can prepare your profile and draft listings while you wait.",
  allowed: "Update profile & create draft listings",
  restricted: "Marketplace publishing unlocks after approval",
  cta: "Review profile",
};

const REJECTED_COPY = {
  eyebrow: "Action required",
  title: "Verification could not be completed",
  body: "Update your business profile with accurate details, then contact our team if you believe this was a mistake.",
  allowed: "Edit your business profile",
  restricted: "Marketplace publishing remains disabled",
  cta: "Update profile",
};

export function VendorVerificationStatusChip({ className }: { className?: string }) {
  const { loading, isVerified, isPending, isRejected } = useVendorVerification();

  if (loading || isVerified) {
    return null;
  }

  const label = isRejected ? "Not approved" : "Pending review";
  const dotClass = isRejected ? "bg-destructive" : "bg-[hsl(42_48%_52%)]";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass, isPending && "animate-pulse")} />
      {label}
    </span>
  );
}

export function VendorVerificationBanner({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { loading, isPending, isRejected } = useVendorVerification();

  if (loading || (!isPending && !isRejected)) {
    return null;
  }

  const copy = isRejected ? REJECTED_COPY : PENDING_COPY;
  const Icon = isRejected ? ShieldAlert : Clock;
  const accentBorder = isRejected ? "border-l-destructive" : "border-l-[hsl(42_48%_52%)]";
  const iconWrap = isRejected
    ? "bg-destructive/10 text-destructive ring-destructive/15"
    : "bg-[hsl(42_48%_52%/0.12)] text-[hsl(42_48%_52%)] ring-[hsl(42_48%_52%/0.2)]";

  if (compact) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "border-b border-white/40 bg-white/35 px-4 py-3 backdrop-blur-sm sm:px-6",
          className
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1",
              iconWrap
            )}
          >
            <Icon size={15} aria-hidden />
          </div>
          <p className={cn("min-w-0 flex-1 text-sm", rf.subtitle)}>
            <span className="font-medium text-foreground">{copy.eyebrow}.</span>{" "}
            {isPending
              ? "Listings save as drafts until your account is verified."
              : copy.body}
          </p>
          <Link
            href="/vendor/dashboard/profile"
            className="hidden shrink-0 items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-primary sm:inline-flex"
          >
            Profile
            <ArrowRight size={12} aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("mb-6 md:mb-8", className)}
    >
      <div
        className={cn(
          rf.panel,
          "relative overflow-hidden border-l-4",
          accentBorder
        )}
      >
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                iconWrap
              )}
            >
              <Icon size={20} aria-hidden />
            </div>

            <div className="min-w-0">
              <span
                className={cn(
                  rf.badge,
                  !isRejected && "text-[hsl(42_48%_52%)]"
                )}
              >
                {copy.eyebrow}
              </span>
              <h2 className="mt-2 font-luxury-section text-lg font-medium leading-snug text-foreground sm:text-xl">
                {copy.title}
              </h2>
              <p className={cn("mt-1.5 max-w-2xl", rf.subtitle)}>{copy.body}</p>

              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-success"
                    aria-hidden
                  />
                  {copy.allowed}
                </li>
                <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Lock size={16} className="mt-0.5 shrink-0 opacity-70" aria-hidden />
                  {copy.restricted}
                </li>
              </ul>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 lg:pt-1">
            <GlassButton
              href="/vendor/dashboard/profile"
              variant="ghost"
              className="gap-1.5 px-4 py-2 text-sm"
            >
              {copy.cta}
              <ArrowRight size={14} aria-hidden />
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VendorPublishRestrictionNotice({ className }: { className?: string }) {
  const { loading, canPublishListings, isPending } = useVendorVerification();

  if (loading || canPublishListings) {
    return null;
  }

  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-white/55 bg-white/40 px-4 py-3 backdrop-blur-sm",
        className
      )}
    >
      <Clock size={16} className="mt-0.5 shrink-0 text-[hsl(42_48%_52%)]" aria-hidden />
      <p className={cn("text-sm leading-relaxed", rf.subtitle)}>
        <span className="font-medium text-foreground">
          {isPending ? "Draft mode" : "Publishing disabled"}
        </span>
        {" — "}
        {isPending
          ? "Create and edit listings now. They won't appear in search until your account is verified."
          : "Resolve verification before publishing listings to couples."}
      </p>
    </div>
  );
}
