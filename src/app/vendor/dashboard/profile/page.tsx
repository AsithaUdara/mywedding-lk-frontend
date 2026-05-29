"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Globe,
  Info,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  Store,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getVendorBusinessProfile,
  updateVendorBusinessProfile,
  VendorBusinessProfile,
} from "@/shared/lib/api/vendors";
import { SRI_LANKA_CITIES, SRI_LANKA_PROVINCES } from "@/modules/vendor/signup/constants";
import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  PageHeader,
  PageLoadingSkeleton,
  SectionCard,
  SuccessBanner,
  inputClass,
} from "@/modules/vendor/dashboard/ui";
import { cn } from "@/shared/lib/cn";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";

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

  const load = useCallback(async () => {
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
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

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
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (!profile) {
    return (
      <div className="space-y-8 pb-4">
        <PageHeader
          title="Business profile"
          description="Manage your public listing details on MyWedding.lk."
          badge="Account"
        />
        {error && <ErrorBanner message={error} />}
        <EmptyState
          title="Profile not available"
          description="We could not load your vendor profile. Try refreshing or complete vendor registration."
          icon={Store}
          action={
            <Button type="button" variant="secondary" size="sm" onClick={() => void load()}>
              <RefreshCw size={16} aria-hidden />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const isVerified = profile.verificationStatus === "Verified";

  return (
    <div className="space-y-8 pb-4">
      <PageHeader
        title="Business profile"
        description="Set your location, phone, and description — couples see this on your public listing and map."
        badge="Storefront"
        action={
          <Badge variant={isVerified ? "default" : "accent"}>
            {isVerified ? (
              <>
                <BadgeCheck size={12} className="mr-1 inline" aria-hidden />
                Verified
              </>
            ) : (
              "Pending verification"
            )}
          </Badge>
        }
      />

      {error && <ErrorBanner message={error} />}
      {success && <SuccessBanner message={success} />}

      <SectionCard title="Public listing preview" subtitle="How couples see you in search">
        <div className={cn(vd.cardPad, "!p-5")}>
          <p className="text-lg font-bold text-foreground">
            {form.businessName || "Your business name"}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {form.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} aria-hidden />
                {form.city}
                {form.province ? `, ${form.province}` : ""}
              </span>
            )}
            {form.contactPhone && (
              <span className="inline-flex items-center gap-1">
                <Phone size={14} aria-hidden />
                {form.contactPhone}
              </span>
            )}
          </p>
          <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
            {form.businessDescription?.trim() ||
              "Add an about section so couples understand your style and experience."}
          </p>
        </div>
      </SectionCard>

      <form onSubmit={(e) => void handleSave(e)}>
        <SectionCard
          title="Location & contact"
          subtitle="Used on your vendor page, search filters, and map embed"
          action={
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <Save size={16} aria-hidden />
              )}
              Save changes
            </Button>
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Building2 size={15} className="text-muted-foreground" aria-hidden />
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
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Phone size={15} className="text-muted-foreground" aria-hidden />
                Contact phone
              </label>
              <input
                className={inputClass}
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="+94 77 123 4567"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Shown as a call button on your listing. Couples can tap to dial on mobile.
              </p>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <MapPin size={15} className="text-muted-foreground" aria-hidden />
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
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <MapPin size={15} className="text-muted-foreground" aria-hidden />
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
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Globe size={15} className="text-muted-foreground" aria-hidden />
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
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Info size={15} className="text-muted-foreground" aria-hidden />
                About your business
              </label>
              <textarea
                rows={5}
                className={inputClass}
                value={form.businessDescription}
                onChange={(e) => setForm({ ...form, businessDescription: e.target.value })}
                placeholder="Tell couples about your style, experience, and what makes you unique…"
              />
            </div>
          </div>
        </SectionCard>
      </form>

      <SectionCard title="Storefront checklist" subtitle="Improve discovery on MyWedding.lk">
        <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <li className={cn(vd.metaBox)}>
            <span className="font-bold text-primary">Complete</span> — business name, city, and phone help
            you appear in local search.
          </li>
          <li className={cn(vd.metaBox)}>
            <span className="font-bold text-primary">Describe</span> — a compelling about section builds trust
            before the first inquiry.
          </li>
          <li className={cn(vd.metaBox)}>
            <span className="font-bold text-primary">Publish</span> — active service listings drive bookings from
            your profile.
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
