"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
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
  EmptyState,
  ErrorBanner,
  PageLoadingSkeleton,
  SuccessBanner,
} from "@/modules/vendor/dashboard/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassQuickActionLink,
  GlassSectionCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";

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

function VerificationBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        verified
          ? "bg-success/10 text-success ring-1 ring-success/20"
          : "bg-white/55 text-muted-foreground ring-1 ring-white/60"
      )}
    >
      {verified ? (
        <>
          <BadgeCheck size={14} aria-hidden />
          Verified
        </>
      ) : (
        "Pending verification"
      )}
    </span>
  );
}

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
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
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
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

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

  const completeness = useMemo(() => {
    const fields = [
      form.businessName.trim(),
      form.city.trim(),
      form.contactPhone.trim(),
      form.businessDescription.trim(),
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [form]);

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (!profile) {
    return (
      <div className="space-y-6 pb-4 md:space-y-8">
        <GlassPageHeader
          title="Business profile"
          description="Manage your public listing details on MyWedding.lk."
          badge="Storefront"
        />
        {error && <ErrorBanner message={error} />}
        <EmptyState
          title="Profile not available"
          description="We could not load your vendor profile. Try refreshing or complete vendor registration."
          icon={Store}
          action={
            <GlassButton variant="ghost" onClick={() => void load()} className="gap-1.5">
              <RefreshCw size={16} aria-hidden />
              Retry
            </GlassButton>
          }
          className="border-0 bg-transparent shadow-none"
        />
      </div>
    );
  }

  const isVerified = profile.verificationStatus === "Verified";

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Business profile"
        description="Set your location, phone, and description — couples see this on your public listing and map."
        badge="Storefront"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge verified={isVerified} />
            <GlassButton
              variant="ghost"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
              Refresh
            </GlassButton>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <GlassQuickActionLink
          href="/vendor/dashboard/services"
          label="My services"
          description="Publish listings for search"
          icon={<Store size={16} />}
        />
        <GlassQuickActionLink
          href="/vendor/dashboard/analytics"
          label="Analytics"
          description={`Profile ${completeness}% complete`}
          icon={<Info size={16} />}
        />
        <GlassQuickActionLink
          href={`/vendor/${profile.userId}`}
          label="Public listing"
          description="View as couples see you"
          icon={<Globe size={16} />}
        />
      </div>

      {error && <ErrorBanner message={error} />}
      {success && <SuccessBanner message={success} />}

      <GlassSectionCard title="Public listing preview" subtitle="How couples see you in search">
        <div className={cn(vd.metaBox, "flex gap-4 p-5")}>
          <div className={vg.iconWrap}>
            <Store size={22} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("font-medium text-foreground", vg.body, "text-lg")}>
                {form.businessName.trim() || "Your business name"}
              </p>
              {isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                  <BadgeCheck size={12} aria-hidden />
                  Verified
                </span>
              )}
            </div>
            <p className={cn("mt-1 flex flex-wrap items-center gap-x-3 gap-y-1", vg.subtitle)}>
              {form.city ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} aria-hidden />
                  {form.city}
                  {form.province ? `, ${form.province}` : ""}
                </span>
              ) : (
                <span className="italic opacity-70">Add your city for local search</span>
              )}
              {form.contactPhone && (
                <span className="inline-flex items-center gap-1">
                  <Phone size={14} aria-hidden />
                  {form.contactPhone}
                </span>
              )}
            </p>
            {form.websiteUrl && (
              <p className={cn("mt-1 flex items-center gap-1", vg.caption)}>
                <Globe size={13} aria-hidden />
                {form.websiteUrl.replace(/^https?:\/\//, "")}
              </p>
            )}
            <p className={cn("mt-3 line-clamp-3", vg.subtitle)}>
              {form.businessDescription.trim() ||
                "Add an about section so couples understand your style and experience."}
            </p>
          </div>
        </div>
      </GlassSectionCard>

      <form onSubmit={(e) => void handleSave(e)}>
        <GlassSectionCard
          title="Location & contact"
          subtitle="Used on your vendor page, search filters, and map embed"
          action={
            <GlassButton variant="primary" type="submit" disabled={saving} className="gap-1.5">
              {saving ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <Save size={16} aria-hidden />
              )}
              Save changes
            </GlassButton>
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <ProfileFieldLabel icon={Building2}>Business name</ProfileFieldLabel>
              <input
                className={vd.input}
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                required
              />
            </div>
            <div>
              <ProfileFieldLabel icon={Phone}>Contact phone</ProfileFieldLabel>
              <input
                className={vd.input}
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
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
              <ProfileFieldLabel icon={MapPin}>Province</ProfileFieldLabel>
              <select
                className={vd.input}
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
              <ProfileFieldLabel icon={Globe}>Website</ProfileFieldLabel>
              <input
                type="url"
                className={vd.input}
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div className="md:col-span-2">
              <ProfileFieldLabel icon={Info}>About your business</ProfileFieldLabel>
              <textarea
                rows={5}
                className={vd.input}
                value={form.businessDescription}
                onChange={(e) => setForm({ ...form, businessDescription: e.target.value })}
                placeholder="Tell couples about your style, experience, and what makes you unique…"
              />
            </div>
          </div>
        </GlassSectionCard>
      </form>

      <GlassSectionCard title="Storefront checklist" subtitle="Improve discovery on MyWedding.lk">
        <ul className="grid gap-3 sm:grid-cols-3">
          <li className={cn(vd.metaBox, vg.subtitle)}>
            <span className="font-semibold text-primary">Complete</span> — business name, city, and phone help
            you appear in local search.
          </li>
          <li className={cn(vd.metaBox, vg.subtitle)}>
            <span className="font-semibold text-primary">Describe</span> — a compelling about section builds trust
            before the first inquiry.
          </li>
          <li className={cn(vd.metaBox, vg.subtitle)}>
            <span className="font-semibold text-primary">Publish</span> — active service listings drive bookings from
            your profile.
          </li>
        </ul>
      </GlassSectionCard>
    </div>
  );
}
