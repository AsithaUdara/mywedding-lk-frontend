"use client";

import type { LucideIcon } from "lucide-react";
import { Building2, Globe, Info, MapPin, Phone } from "lucide-react";
import { SRI_LANKA_CITIES, SRI_LANKA_PROVINCES } from "@/modules/vendor/signup/constants";
import type { VendorProfileFormState } from "@/modules/vendor/dashboard/vendorProfileHelpers";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

function ProfileFieldLabel({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("mb-1.5 flex items-center gap-1.5 font-medium", vg.body)}>
      <Icon size={15} className="text-muted-foreground" aria-hidden />
      {children}
    </label>
  );
}

export function VendorProfileForm({
  form,
  onChange,
}: {
  form: VendorProfileFormState;
  onChange: <K extends keyof VendorProfileFormState>(key: K, value: VendorProfileFormState[K]) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <ProfileFieldLabel icon={Building2}>Business name</ProfileFieldLabel>
        <input
          className={vd.input}
          value={form.businessName}
          onChange={(e) => onChange("businessName", e.target.value)}
          required
        />
      </div>
      <div>
        <ProfileFieldLabel icon={Phone}>Contact phone</ProfileFieldLabel>
        <input
          className={vd.input}
          value={form.contactPhone}
          onChange={(e) => onChange("contactPhone", e.target.value)}
          placeholder="+94 77 123 4567"
        />
        <p className={cn("mt-1", vg.caption)}>
          Shown as a call button on your listing. Couples can tap to dial on mobile.
        </p>
      </div>
      <div>
        <ProfileFieldLabel icon={MapPin}>City / town</ProfileFieldLabel>
        <input
          list="vendor-cities"
          className={vd.input}
          value={form.city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="e.g. Colombo"
          required
        />
        <datalist id="vendor-cities">
          {SRI_LANKA_CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>
      <div>
        <ProfileFieldLabel icon={MapPin}>Province</ProfileFieldLabel>
        <select
          className={vd.input}
          value={form.province}
          onChange={(e) => onChange("province", e.target.value)}
        >
          <option value="">Select province (optional)</option>
          {SRI_LANKA_PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <ProfileFieldLabel icon={Globe}>Website</ProfileFieldLabel>
        <input
          type="url"
          className={vd.input}
          value={form.websiteUrl}
          onChange={(e) => onChange("websiteUrl", e.target.value)}
          placeholder="https://"
        />
      </div>
      <div className="md:col-span-2">
        <ProfileFieldLabel icon={Info}>About your business</ProfileFieldLabel>
        <textarea
          rows={5}
          className={vd.input}
          value={form.businessDescription}
          onChange={(e) => onChange("businessDescription", e.target.value)}
          placeholder="Tell couples about your style, experience, and what makes you unique…"
        />
      </div>
    </div>
  );
}
