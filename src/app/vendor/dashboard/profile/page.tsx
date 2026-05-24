"use client";

import React, { useEffect, useState } from "react";
import { Building2, Globe, Info, Mail, MapPin, Phone, User2 } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getVendorById, VendorDetail } from "@/shared/lib/api/vendors";
import {
  EmptyState,
  ErrorBanner,
  IconCircle,
  LoadingState,
  PageHeader,
  SectionCard,
} from "@/modules/vendor/dashboard/ui";

export default function VendorProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getVendorById(user.uid);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load vendor profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user?.uid]);

  if (loading) return <LoadingState label="Loading profile..." />;

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Business Profile" description="How couples view your business listing." />
        {error ? <ErrorBanner message={error} /> : null}
        <EmptyState
          title="Profile unavailable"
          description="Your public profile could not be loaded right now."
        />
      </div>
    );
  }

  const initial = profile.businessName.charAt(0).toUpperCase();
  const isVerified = profile.verificationStatus === "Verified";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Business Profile"
        description="Review your public-facing vendor information and listing readiness."
        badge={isVerified ? "Verified" : "Pending verification"}
      />
      {error ? <ErrorBanner message={error} /> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Identity" subtitle="Public account snapshot">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary shadow-sm ring-4 ring-white">
              {initial}
            </div>
            <p className="text-lg font-bold text-charcoal">{profile.businessName}</p>
            <p className="text-sm text-slate-400">ID: {profile.userId.slice(0, 10)}...</p>
            <div
              className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isVerified ? "bg-emerald-500" : "bg-amber-500"}`} />
              {isVerified ? "Verified partner" : "Verification pending"}
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Business details" subtitle="Current values shown to couples">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <IconCircle icon={Building2} theme="primary" size={18} className="h-10 w-10" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Business name</p>
                  <p className="mt-0.5 font-semibold text-charcoal">{profile.businessName}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <IconCircle icon={MapPin} theme="blue" size={18} className="h-10 w-10" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">City</p>
                  <p className="mt-0.5 font-semibold text-charcoal">{profile.city || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <IconCircle icon={Phone} theme="green" size={18} className="h-10 w-10" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Contact phone</p>
                  <p className="mt-0.5 font-semibold text-charcoal">{profile.contactPhone || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <IconCircle icon={Globe} theme="amber" size={18} className="h-10 w-10" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Website</p>
                  <p className="mt-0.5 break-all font-semibold text-charcoal">{profile.websiteUrl || "Not set"}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <IconCircle icon={Info} theme="slate" size={18} className="h-10 w-10" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Description</p>
                <p className="mt-0.5 text-sm leading-relaxed text-charcoal">
                  {profile.businessDescription || "No business description added yet."}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Next best actions" subtitle="Improve discoverability and conversion">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <IconCircle icon={Mail} theme="rose" size={18} className="h-10 w-10" />
                <p className="text-sm text-slate-600">
                  Keep inquiries active and respond within 24 hours to improve ranking signals.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <IconCircle icon={User2} theme="blue" size={18} className="h-10 w-10" />
                <p className="text-sm text-slate-600">
                  Add multiple services and transparent pricing to increase booking conversions.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

