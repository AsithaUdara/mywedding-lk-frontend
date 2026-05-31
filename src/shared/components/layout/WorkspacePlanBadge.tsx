"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export type WorkspacePlanTier = "FREE" | "PRO" | "…";

type WorkspacePlanBadgeProps = {
  tier: WorkspacePlanTier;
  href?: string;
  title?: string;
  className?: string;
};

export function WorkspacePlanBadge({
  tier,
  href,
  title = "Plan & billing",
  className,
}: WorkspacePlanBadgeProps) {
  const isPro = tier === "PRO";
  const badgeClass = cn(
    isPro ? "vgo-plan-pro-badge" : "vgo-plan-free-badge",
    tier === "…" && "opacity-60",
    className
  );

  const content = (
    <>
      <Crown size={13} strokeWidth={2.25} aria-hidden />
      <span>{tier}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={badgeClass} title={title}>
        {content}
      </Link>
    );
  }

  return (
    <span className={badgeClass} title={title}>
      {content}
    </span>
  );
}
