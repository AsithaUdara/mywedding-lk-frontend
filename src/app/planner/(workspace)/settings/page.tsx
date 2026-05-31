"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Building2,
  Crown,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPlannerDashboard,
  PlannerDashboardResponse,
  updatePlannerAgencyLogo,
  updatePlannerProfile,
} from "@/shared/lib/api/planner";
import { uploadAgencyLogo } from "@/shared/lib/plannerMedia";
import { usePlannerBranding } from "@/modules/planner/branding/PlannerBrandingProvider";
import {
  formatPlannerPlanTier,
  isPlannerProTier,
} from "@/modules/planner/subscription/planTier";
import {
  ErrorBanner,
  SuccessBanner,
  inputClass,
} from "@/modules/planner/components/ui";
import { PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

export default function PlannerSettingsPage() {
  const { user } = useAuth();
  const { refresh: refreshBranding } = usePlannerBranding();
  const [profile, setProfile] = useState<PlannerDashboardResponse | null>(null);
  const [form, setForm] = useState({
    businessName: "",
    businessDescription: "",
    contactPhone: "",
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isPro = isPlannerProTier(profile?.activePlanTier);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerDashboard(token);
      setProfile(data);
      setForm({
        businessName: data.businessName || "",
        businessDescription: data.businessDescription || "",
        contactPhone: data.contactPhone || "",
        city: data.city || "",
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load planner profile.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();
      await updatePlannerProfile(token, form);
      setMessage("Profile saved.");
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const onLogoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user || !profile || !isPro) return;

    try {
      setLogoUploading(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();
      const url = await uploadAgencyLogo(file, profile.plannerId);
      await updatePlannerAgencyLogo(token, url);
      setMessage("Agency logo updated.");
      await Promise.all([loadProfile(), refreshBranding()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload agency logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  if (loading && !profile) {
    return <PageLoadingSkeleton />;
  }

  const initials = (profile?.plannerName || user?.displayName || user?.email || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Settings"
        description="Manage your studio profile, contact details, and account preferences."
        badge="Account"
        action={
          <GlassButton href="/planner/billing" variant="ghost" className="gap-1.5">
            <BadgeCheck size={16} aria-hidden />
            Plan & billing
          </GlassButton>
        }
      />

      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassStatCard
          label="Plan"
          value={formatPlannerPlanTier(profile?.activePlanTier)}
          sub={isPro ? "White-label enabled" : "Free tier"}
          icon={BadgeCheck}
          iconTheme="accent"
        />
        <GlassStatCard
          label="Event capacity"
          value={profile?.maxConcurrentEvents ?? "—"}
          sub="Concurrent weddings"
          icon={Building2}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Managed events"
          value={profile?.events?.length ?? 0}
          sub="In your portfolio"
          icon={User}
          iconTheme="muted"
        />
      </div>

      <GlassSectionCard
        title="Agency logo upload"
        subtitle="White-label your client-facing materials with your studio brand mark"
        action={
          !isPro ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent ring-1 ring-accent/15">
              <Crown size={12} aria-hidden />
              Pro unlocks white-labeling
            </span>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/60 bg-white/35 backdrop-blur-sm">
            {profile?.agencyLogoUrl ? (
              <Image
                src={profile.agencyLogoUrl}
                alt="Agency logo"
                fill
                className="object-contain p-2"
                sizes="96px"
                unoptimized
              />
            ) : (
              <ImagePlus className="text-muted-foreground" size={28} strokeWidth={1.25} aria-hidden />
            )}
          </div>
          <div className="flex-1 space-y-3">
            <p className={vg.subtitle}>
              Upload a square or horizontal logo (PNG, JPEG, WebP, or SVG, max 2 MB). On Planner Pro,
              your logo appears in the workspace sidebar, PDF quotes, and other client-facing exports.
            </p>
            {isPro && profile?.agencyLogoUrl ? (
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Planner workspace sidebar — your studio brand</li>
                <li>• Client event portal — “Planned by” badge on their celebration</li>
                <li>• Quote PDFs and exports — white-label deliverables</li>
              </ul>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
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
                  onChange={(ev) => void onLogoSelected(ev)}
                />
                <span className="font-glass-body inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_4px_16px_hsl(345_100%_25%/0.25)]">
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
      </GlassSectionCard>

      <GlassSectionCard title="Business profile" subtitle="Your studio details for clients and your dashboard">
        <form onSubmit={onSave} className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-white/55 bg-white/35 px-4 py-3 backdrop-blur-sm">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/55 bg-white/40">
              {isPro && profile?.agencyLogoUrl ? (
                <Image
                  src={profile.agencyLogoUrl}
                  alt={`${profile.businessName} logo`}
                  fill
                  className="object-contain p-1.5"
                  sizes="44px"
                  unoptimized
                />
              ) : (
                <span
                  className="flex h-full w-full items-center justify-center bg-primary/10 text-sm font-bold text-primary"
                  aria-hidden
                >
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className={cn("font-medium", vg.body)}>
                {profile?.plannerName || user?.displayName || "Planner"}
              </p>
              <p className={cn("flex items-center gap-1.5 truncate", vg.subtitle)}>
                <Mail size={14} className="shrink-0" aria-hidden />
                {user?.email ?? "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="business-name"
                className={cn("mb-1.5 flex items-center gap-2 font-semibold", vg.body)}
              >
                <Building2 size={16} className="text-muted-foreground" aria-hidden />
                Business name
              </label>
              <input
                id="business-name"
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                required
                className={glassInput}
                autoComplete="organization"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="business-description" className={cn("mb-1.5 block font-semibold", vg.body)}>
                Business description
              </label>
              <textarea
                id="business-description"
                value={form.businessDescription}
                onChange={(e) => setForm((f) => ({ ...f, businessDescription: e.target.value }))}
                rows={4}
                className={cn(glassInput, "resize-none")}
                placeholder="Tell couples what makes your planning studio unique…"
              />
            </div>
            <div>
              <label
                htmlFor="contact-phone"
                className={cn("mb-1.5 flex items-center gap-2 font-semibold", vg.body)}
              >
                <Phone size={16} className="text-muted-foreground" aria-hidden />
                Contact phone
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                className={glassInput}
                placeholder="+94 77 123 4567"
                autoComplete="tel"
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className={cn("mb-1.5 flex items-center gap-2 font-semibold", vg.body)}
              >
                <MapPin size={16} className="text-muted-foreground" aria-hidden />
                City
              </label>
              <input
                id="city"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className={glassInput}
                placeholder="Colombo"
                autoComplete="address-level2"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-white/40 pt-5">
            <GlassButton type="submit" variant="primary" className="gap-1.5" disabled={saving}>
              <Save size={18} aria-hidden />
              {saving ? "Saving…" : "Save changes"}
            </GlassButton>
            <GlassButton
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                if (!profile) return;
                setForm({
                  businessName: profile.businessName || "",
                  businessDescription: profile.businessDescription || "",
                  contactPhone: profile.contactPhone || "",
                  city: profile.city || "",
                });
                setMessage(null);
                setError(null);
              }}
            >
              Reset
            </GlassButton>
          </div>
        </form>
      </GlassSectionCard>
    </div>
  );
}
