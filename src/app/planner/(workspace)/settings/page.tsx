"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, Building2, FolderKanban } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPlannerDashboard,
  PlannerDashboardResponse,
  updatePlannerAgencyLogo,
  updatePlannerProfile,
} from "@/shared/lib/api/planner";
import { uploadAgencyLogo } from "@/shared/lib/plannerMedia";
import { usePlannerBranding } from "@/modules/planner/branding/PlannerBrandingProvider";
import { PlannerAgencyLogoSection } from "@/modules/planner/settings/PlannerAgencyLogoSection";
import { PlannerBusinessProfileForm } from "@/modules/planner/settings/PlannerBusinessProfileForm";
import { SettingsToolbar } from "@/modules/planner/settings/SettingsToolbar";
import {
  computeSettingsStats,
  parseSettingsTab,
  profileToForm,
  type PlannerProfileFormState,
  type SettingsTab,
} from "@/modules/planner/settings/plannerSettingsHelpers";
import { PlannerTaskTemplatesPanel } from "@/modules/planner/templates/PlannerTaskTemplatesPanel";
import {
  ErrorBanner,
  SuccessBanner,
} from "@/modules/planner/components/ui";
import { PageLoadingSkeleton } from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";

export default function PlannerSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = parseSettingsTab(searchParams.get("tab"));
  const { refresh: refreshBranding } = usePlannerBranding();

  const [profile, setProfile] = useState<PlannerDashboardResponse | null>(null);
  const [tab, setTab] = useState<SettingsTab>(tabFromUrl);
  const [form, setForm] = useState<PlannerProfileFormState>({
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

  const syncUrl = useCallback(
    (nextTab: SettingsTab) => {
      const params = new URLSearchParams();
      if (nextTab !== "profile") params.set("tab", nextTab);
      const query = params.toString();
      router.replace(query ? `/planner/settings?${query}` : "/planner/settings", { scroll: false });
    },
    [router]
  );

  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerDashboard(token);
      setProfile(data);
      setForm(profileToForm(data));
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

  useEffect(() => {
    setTab(tabFromUrl);
  }, [tabFromUrl]);

  const stats = useMemo(() => computeSettingsStats(profile), [profile]);
  const isPro = stats.isPro;

  const handleTabChange = (nextTab: SettingsTab) => {
    setTab(nextTab);
    syncUrl(nextTab);
  };

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
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

  const onReset = () => {
    if (!profile) return;
    setForm(profileToForm(profile));
    setMessage(null);
    setError(null);
  };

  const onLogoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
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

  const sectionTitle =
    tab === "profile"
      ? "Studio profile"
      : tab === "branding"
        ? "Agency branding"
        : "Task templates";

  const sectionSubtitle =
    tab === "profile"
      ? "Your studio details for clients and your dashboard"
      : tab === "branding"
        ? "White-label your client-facing materials with your studio brand mark"
        : "Reusable checklists saved from your weddings";

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Settings"
        description="Manage your studio profile, agency branding, and reusable task templates."
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

      <div className="grid gap-4 sm:grid-cols-3">
        <GlassStatCard
          label="Plan"
          value={stats.planLabel}
          sub={stats.isPro ? "White-label enabled" : "Free tier"}
          icon={BadgeCheck}
          iconTheme="accent"
        />
        <GlassStatCard
          label="Event capacity"
          value={stats.eventCapacity}
          sub={stats.capacityLabel}
          icon={Building2}
          iconTheme="primary"
        />
        <GlassStatCard
          label="Managed events"
          value={stats.managedEvents}
          sub="In your portfolio"
          icon={FolderKanban}
          iconTheme="muted"
        />
      </div>

      <GlassSectionCard title={sectionTitle} subtitle={sectionSubtitle}>
        <SettingsToolbar tab={tab} onTabChange={handleTabChange} />

        {!profile ? (
          <p className="py-6 text-center text-sm text-[#5E6C84]">Unable to load profile.</p>
        ) : tab === "profile" ? (
          <PlannerBusinessProfileForm
            profile={profile}
            form={form}
            onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
            onSubmit={onSave}
            onReset={onReset}
            saving={saving}
            isPro={isPro}
            userEmail={user?.email}
            userDisplayName={user?.displayName}
          />
        ) : tab === "branding" ? (
          <PlannerAgencyLogoSection
            profile={profile}
            isPro={isPro}
            logoUploading={logoUploading}
            onLogoSelected={(event) => void onLogoSelected(event)}
          />
        ) : (
          <PlannerTaskTemplatesPanel embedded />
        )}
      </GlassSectionCard>
    </div>
  );
}
