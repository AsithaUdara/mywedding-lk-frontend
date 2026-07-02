"use client";

import Image from "next/image";
import { Building2, Mail, MapPin, Phone, Save } from "lucide-react";
import type { PlannerDashboardResponse } from "@/shared/lib/api/planner";
import {
  plannerInitials,
  SETTINGS_JIRA_INPUT,
  type PlannerProfileFormState,
} from "@/modules/planner/settings/plannerSettingsHelpers";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";

type PlannerBusinessProfileFormProps = {
  profile: PlannerDashboardResponse;
  form: PlannerProfileFormState;
  onChange: (patch: Partial<PlannerProfileFormState>) => void;
  onSubmit: (event: React.FormEvent) => void;
  onReset: () => void;
  saving: boolean;
  isPro: boolean;
  userEmail?: string | null;
  userDisplayName?: string | null;
};

export function PlannerBusinessProfileForm({
  profile,
  form,
  onChange,
  onSubmit,
  onReset,
  saving,
  isPro,
  userEmail,
  userDisplayName,
}: PlannerBusinessProfileFormProps) {
  const initials = plannerInitials(profile.plannerName || userDisplayName, userEmail);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-center gap-3 rounded-lg border border-[#DFE1E6] bg-white px-4 py-3 shadow-[0_1px_1px_rgba(9,30,66,0.08)]">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#EBECF0] bg-[#FAFBFC]">
          {isPro && profile.agencyLogoUrl ? (
            <Image
              src={profile.agencyLogoUrl}
              alt={`${profile.businessName} logo`}
              fill
              className="object-contain p-1.5"
              sizes="44px"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-[#172B4D]">{profile.plannerName || userDisplayName || "Planner"}</p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-[#5E6C84]">
            <Mail size={14} className="shrink-0" aria-hidden />
            {userEmail ?? "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="business-name"
            className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#97A0AF]"
          >
            <Building2 size={14} aria-hidden />
            Business name
          </label>
          <input
            id="business-name"
            value={form.businessName}
            onChange={(event) => onChange({ businessName: event.target.value })}
            required
            className={SETTINGS_JIRA_INPUT}
            autoComplete="organization"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="business-description"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#97A0AF]"
          >
            Business description
          </label>
          <textarea
            id="business-description"
            value={form.businessDescription}
            onChange={(event) => onChange({ businessDescription: event.target.value })}
            rows={4}
            className={cn(SETTINGS_JIRA_INPUT, "resize-y")}
            placeholder="Tell couples what makes your planning studio unique…"
          />
        </div>

        <div>
          <label
            htmlFor="contact-phone"
            className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#97A0AF]"
          >
            <Phone size={14} aria-hidden />
            Contact phone
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={form.contactPhone}
            onChange={(event) => onChange({ contactPhone: event.target.value })}
            className={SETTINGS_JIRA_INPUT}
            placeholder="+94 77 123 4567"
            autoComplete="tel"
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#97A0AF]"
          >
            <MapPin size={14} aria-hidden />
            City
          </label>
          <input
            id="city"
            value={form.city}
            onChange={(event) => onChange({ city: event.target.value })}
            className={SETTINGS_JIRA_INPUT}
            placeholder="Colombo"
            autoComplete="address-level2"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[#EBECF0] pt-4">
        <GlassButton type="submit" variant="primary" className="gap-1.5" disabled={saving}>
          <Save size={16} aria-hidden />
          {saving ? "Saving…" : "Save changes"}
        </GlassButton>
        <GlassButton type="button" variant="ghost" disabled={saving} onClick={onReset}>
          Reset
        </GlassButton>
      </div>
    </form>
  );
}
