"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
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
  updatePlannerProfile,
} from "@/shared/lib/api/planner";
import { ErrorBanner } from "@/modules/planner/components/ui";
import {
  Button,
  PageHeader,
  PageLoadingSkeleton,
  SectionCard,
  StatCard,
  SuccessBanner,
  inputClass,
} from "@/shared/components/ui";

export default function PlannerSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PlannerDashboardResponse | null>(null);
  const [form, setForm] = useState({
    businessName: "",
    businessDescription: "",
    contactPhone: "",
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
    <div className="space-y-8 pb-4">
      <PageHeader
        title="Settings"
        description="Manage your studio profile, contact details, and account preferences."
        badge="Account"
        action={
          <Button href="/planner/billing" variant="secondary" size="sm">
            <BadgeCheck size={16} aria-hidden />
            Plan & billing
          </Button>
        }
      />

      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Plan"
          value={profile?.activePlanTier ?? "—"}
          icon={BadgeCheck}
          iconTheme="accent"
          index={0}
        />
        <StatCard
          label="Event capacity"
          value={profile?.maxConcurrentEvents ?? "—"}
          sub="Concurrent weddings"
          icon={Building2}
          iconTheme="primary"
          index={1}
        />
        <StatCard
          label="Managed events"
          value={profile?.events?.length ?? 0}
          icon={User}
          iconTheme="muted"
          index={2}
        />
      </div>

      <SectionCard title="Business profile" subtitle="Your studio details for clients and your dashboard">
        <form onSubmit={onSave} className="space-y-5">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary"
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {profile?.plannerName || user?.displayName || "Planner"}
              </p>
              <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <Mail size={14} className="shrink-0" aria-hidden />
                {user?.email ?? "—"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="business-name"
                className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Building2 size={16} className="text-muted-foreground" aria-hidden />
                Business name
              </label>
              <input
                id="business-name"
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                required
                className={inputClass}
                autoComplete="organization"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="business-description"
                className="mb-1.5 block text-sm font-semibold text-foreground"
              >
                Business description
              </label>
              <textarea
                id="business-description"
                value={form.businessDescription}
                onChange={(e) => setForm((f) => ({ ...f, businessDescription: e.target.value }))}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="Tell couples what makes your planning studio unique…"
              />
            </div>
            <div>
              <label
                htmlFor="contact-phone"
                className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <Phone size={16} className="text-muted-foreground" aria-hidden />
                Contact phone
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                className={inputClass}
                placeholder="+94 77 123 4567"
                autoComplete="tel"
              />
            </div>
            <div>
              <label
                htmlFor="city"
                className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <MapPin size={16} className="text-muted-foreground" aria-hidden />
                City
              </label>
              <input
                id="city"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className={inputClass}
                placeholder="Colombo"
                autoComplete="address-level2"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <Button type="submit" disabled={saving}>
              <Save size={18} aria-hidden />
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button
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
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
