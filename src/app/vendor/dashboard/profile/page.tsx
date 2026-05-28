"use client";

import React, { useEffect, useState } from "react";
import { Building2, Globe, Info, Loader2, MapPin, Phone, Save } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getVendorBusinessProfile,
  updateVendorBusinessProfile,
  VendorBusinessProfile,
} from "@/shared/lib/api/vendors";
import { SRI_LANKA_CITIES, SRI_LANKA_PROVINCES } from "@/modules/vendor/signup/constants";
import {
  ErrorBanner,
  LoadingState,
  PageHeader,
  SectionCard,
  SuccessBanner,
} from "@/modules/vendor/dashboard/ui";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export default function VendorProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VendorBusinessProfile | null>(null);
  const [form, setForm] = useState({
    businessName: "",
    businessDescription: "",
    websiteUrl: "",
    contactPhone: "",
    city: "",
    province: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const token = await user.getIdToken();
        const data = await getVendorBusinessProfile(token);
        setProfile(data);
        setForm({
          businessName: data.businessName ?? "",
          businessDescription: data.businessDescription ?? "",
          websiteUrl: data.websiteUrl ?? "",
          contactPhone: data.contactPhone ?? "",
          city: data.city ?? "",
          province: data.province ?? "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load business profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = await user.getIdToken();
      await updateVendorBusinessProfile(token, {
        businessName: form.businessName.trim(),
        businessDescription: form.businessDescription.trim(),
        websiteUrl: form.websiteUrl.trim() || undefined,
        contactPhone: form.contactPhone.trim() || undefined,
        city: form.city.trim(),
        province: form.province.trim() || undefined,
      });
      setSuccess("Business profile saved. Your public listing and map location are updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading profile..." />;

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Business profile" description="Manage your public listing details." />
        {error && <ErrorBanner message={error} />}
      </div>
    );
  }

  const isVerified = profile.verificationStatus === "Verified";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business profile"
        description="Set your location, phone, and description — couples see this on your public listing and map."
        badge={isVerified ? "Verified" : "Pending verification"}
      />

      {error && <ErrorBanner message={error} />}
      {success && <SuccessBanner message={success} />}

      <form onSubmit={handleSave}>
        <SectionCard
          title="Location & contact"
          subtitle="Used on your vendor page, search filters, and Google Maps embed"
          action={
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save changes
            </button>
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                <Building2 size={15} className="text-slate-400" />
                Business name
              </label>
              <input
                className={inputClass}
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                <Phone size={15} className="text-slate-400" />
                Contact phone
              </label>
              <input
                className={inputClass}
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="+94 77 123 4567"
              />
              <p className="mt-1 text-xs text-slate-500">
                Shown as a Call button on your listing. Couples can tap to dial on mobile.
              </p>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                <MapPin size={15} className="text-slate-400" />
                City / town
              </label>
              <input
                list="vendor-cities"
                className={inputClass}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
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
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                <MapPin size={15} className="text-slate-400" />
                Province
              </label>
              <select
                className={inputClass}
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
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
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                <Globe size={15} className="text-slate-400" />
                Website
              </label>
              <input
                type="url"
                className={inputClass}
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-charcoal">
                <Info size={15} className="text-slate-400" />
                About your business
              </label>
              <textarea
                rows={5}
                className={inputClass}
                value={form.businessDescription}
                onChange={(e) => setForm({ ...form, businessDescription: e.target.value })}
                placeholder="Tell couples about your style, experience, and what makes you unique..."
              />
            </div>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
