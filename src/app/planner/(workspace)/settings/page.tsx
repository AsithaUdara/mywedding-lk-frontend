"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, MapPin, Phone, Save } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerDashboard, updatePlannerProfile } from "@/shared/lib/api/planner";
import {
  ErrorBanner,
  inputClass,
  LoadingState,
  PageHeader,
  SectionCard,
  SuccessBanner,
} from "@/modules/planner/components/ui";

export default function PlannerSettingsPage() {
  const { user } = useAuth();
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
      const profile = await getPlannerDashboard(token);
      setForm({
        businessName: profile.businessName || "",
        businessDescription: profile.businessDescription || "",
        contactPhone: profile.contactPhone || "",
        city: profile.city || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load planner profile.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
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
      setMessage("Planner profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading profile…" />;
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Planner Settings"
        description="Keep your business profile and contact information up to date."
      />

      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <SectionCard title="Business profile" subtitle="Shown to clients and on your planner overview">
        <form onSubmit={onSave} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-charcoal">
                <Building2 size={16} className="text-slate-400" />
                Business name
              </label>
              <input
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-charcoal">Business description</label>
              <textarea
                value={form.businessDescription}
                onChange={(e) => setForm((f) => ({ ...f, businessDescription: e.target.value }))}
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="Tell couples what makes your planning studio unique…"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-charcoal">
                <Phone size={16} className="text-slate-400" />
                Contact phone
              </label>
              <input
                value={form.contactPhone}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                className={inputClass}
                placeholder="+94 …"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-charcoal">
                <MapPin size={16} className="text-slate-400" />
                City
              </label>
              <input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className={inputClass}
                placeholder="Colombo"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </SectionCard>
    </section>
  );
}
