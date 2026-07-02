"use client";

import { BadgeCheck, Globe, MapPin, Phone, Store } from "lucide-react";
import type { VendorProfileFormState } from "@/modules/vendor/dashboard/vendorProfileHelpers";
import { formatWebsiteDisplay } from "@/modules/vendor/dashboard/vendorProfileHelpers";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export function VendorProfilePreview({
  form,
  isVerified,
}: {
  form: VendorProfileFormState;
  isVerified: boolean;
}) {
  const website = formatWebsiteDisplay(form.websiteUrl);

  return (
    <div className={cn(vd.metaBox, "flex gap-4 p-5")}>
      <div className={vg.iconWrap}>
        <Store size={22} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("font-medium text-foreground", vg.body, "text-lg")}>
            {form.businessName.trim() || "Your business name"}
          </p>
          {isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
              <BadgeCheck size={12} aria-hidden />
              Verified
            </span>
          ) : null}
        </div>

        <p className={cn("mt-1 flex flex-wrap items-center gap-x-3 gap-y-1", vg.subtitle)}>
          {form.city.trim() ? (
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} aria-hidden />
              {form.city.trim()}
              {form.province.trim() ? `, ${form.province.trim()}` : ""}
            </span>
          ) : (
            <span className="italic opacity-70">Add your city for local search</span>
          )}
          {form.contactPhone.trim() ? (
            <span className="inline-flex items-center gap-1">
              <Phone size={14} aria-hidden />
              {form.contactPhone.trim()}
            </span>
          ) : null}
        </p>

        {website ? (
          <p className={cn("mt-1 flex items-center gap-1", vg.caption)}>
            <Globe size={13} aria-hidden />
            {website}
          </p>
        ) : null}

        <p className={cn("mt-3 line-clamp-4", vg.subtitle)}>
          {form.businessDescription.trim() ||
            "Add an about section so couples understand your style and experience."}
        </p>
      </div>
    </div>
  );
}
