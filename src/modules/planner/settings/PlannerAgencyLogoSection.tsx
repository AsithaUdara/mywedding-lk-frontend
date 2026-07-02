"use client";

import Image from "next/image";
import { Crown, ImagePlus, Loader2 } from "lucide-react";
import type { PlannerDashboardResponse } from "@/shared/lib/api/planner";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";

type PlannerAgencyLogoSectionProps = {
  profile: PlannerDashboardResponse;
  isPro: boolean;
  logoUploading: boolean;
  onLogoSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function PlannerAgencyLogoSection({
  profile,
  isPro,
  logoUploading,
  onLogoSelected,
}: PlannerAgencyLogoSectionProps) {
  return (
    <div className="space-y-4">
      {!isPro && (
        <div className="flex items-start gap-2 rounded-lg border border-[#FFF0B3] bg-[#FFF0B3]/40 px-4 py-3 text-sm text-[#974F0C]">
          <Crown size={16} className="mt-0.5 shrink-0" aria-hidden />
          <p>
            White-label branding is a Planner Pro feature. Upgrade to show your logo in the workspace,
            client portal, and quote PDFs.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#DFE1E6] bg-[#FAFBFC]">
          {profile.agencyLogoUrl ? (
            <Image
              src={profile.agencyLogoUrl}
              alt="Agency logo"
              fill
              className="object-contain p-2"
              sizes="112px"
              unoptimized
            />
          ) : (
            <ImagePlus className="text-[#97A0AF]" size={28} strokeWidth={1.25} aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm leading-relaxed text-[#42526E]">
            Upload a square or horizontal logo (PNG, JPEG, WebP, or SVG, max 2 MB). On Planner Pro,
            your logo appears in the workspace sidebar, PDF quotes, and other client-facing exports.
          </p>

          {isPro && profile.agencyLogoUrl && (
            <ul className="space-y-1 text-xs text-[#5E6C84]">
              <li>• Planner workspace sidebar — your studio brand</li>
              <li>• Client event portal — “Planned by” badge on their celebration</li>
              <li>• Quote PDFs and exports — white-label deliverables</li>
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <label
              className={
                isPro && !logoUploading
                  ? "inline-flex cursor-pointer"
                  : "inline-flex cursor-not-allowed opacity-60"
              }
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="sr-only"
                disabled={!isPro || logoUploading}
                onChange={onLogoSelected}
              />
              <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                {logoUploading ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                ) : (
                  <ImagePlus size={16} aria-hidden />
                )}
                {logoUploading ? "Uploading…" : "Upload logo"}
              </span>
            </label>
            {!isPro && (
              <GlassButton href="/planner/billing" variant="ghost" className="gap-1">
                <Crown size={14} aria-hidden />
                View Pro plans
              </GlassButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
