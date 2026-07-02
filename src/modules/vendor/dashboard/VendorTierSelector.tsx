"use client";

import { Check } from "lucide-react";
import type { VendorTier } from "@/modules/vendor/billing/constants";
import {
  tierIcon,
  tierTheme,
  VENDOR_TIER_FEATURES,
  VENDOR_TIER_PRICING,
  VENDOR_TIERS,
} from "@/modules/vendor/dashboard/vendorSettingsHelpers";
import { formatLKR, StatIcon } from "@/modules/vendor/dashboard/ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export function VendorTierSelector({
  selectedTier,
  currentTier,
  onSelect,
  disabled,
}: {
  selectedTier: VendorTier;
  currentTier: VendorTier;
  onSelect: (tier: VendorTier) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {VENDOR_TIERS.map((tier) => {
        const selected = selectedTier === tier;
        const isCurrent = currentTier === tier;
        const Icon = tierIcon(tier);

        return (
          <label
            key={tier}
            className={cn(
              "flex cursor-pointer flex-col rounded-xl border p-5 backdrop-blur-sm transition-all duration-200",
              selected
                ? "border-primary/35 bg-primary/5 shadow-[0_4px_20px_hsl(345_100%_25%/0.1)] ring-1 ring-primary/25"
                : "border-white/55 bg-white/40 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55",
              disabled && "pointer-events-none opacity-60"
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <StatIcon icon={Icon} theme={tierTheme(tier)} size={18} className="!h-10 !w-10" />
                <div>
                  <p className={cn("font-medium", vg.body)}>{tier}</p>
                  {isCurrent ? (
                    <p className={cn("text-success", vg.caption)}>Current plan</p>
                  ) : selected ? (
                    <p className={cn("text-primary", vg.caption)}>Selected</p>
                  ) : null}
                </div>
              </div>
              <input
                type="radio"
                name="tier"
                checked={selected}
                onChange={() => onSelect(tier)}
                disabled={disabled}
                className="h-4 w-4 accent-primary"
              />
            </div>

            <p className="font-semibold tabular-nums tracking-tight text-foreground">
              {formatLKR(VENDOR_TIER_PRICING[tier])}
              <span className={cn("font-normal", vg.caption)}>/mo</span>
            </p>

            <ul className="mt-4 flex-1 space-y-2">
              {VENDOR_TIER_FEATURES[tier].map((feature) => (
                <li key={feature} className={cn("flex items-start gap-2", vg.subtitle)}>
                  <Check size={14} className="mt-0.5 flex-shrink-0 text-success" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          </label>
        );
      })}
    </div>
  );
}
