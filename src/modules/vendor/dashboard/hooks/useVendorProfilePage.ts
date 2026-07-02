"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { updateVendorBusinessProfile } from "@/shared/lib/api/vendors";
import { useVendorBusinessProfileQuery } from "@/shared/hooks/query/useVendorQueries";
import { useVendorVerification } from "@/modules/vendor/dashboard/VendorVerificationContext";
import {
  buildProfileSavePayload,
  computeProfileCompleteness,
  emptyProfileForm,
  hasProfileFormChanges,
  profileFormFromApi,
  type VendorProfileFormState,
} from "@/modules/vendor/dashboard/vendorProfileHelpers";

export function useVendorProfilePage() {
  const { user } = useAuth();
  const verification = useVendorVerification();

  const {
    data: profile = null,
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch,
  } = useVendorBusinessProfileQuery();

  const [form, setForm] = useState<VendorProfileFormState>(emptyProfileForm);
  const [baseline, setBaseline] = useState<VendorProfileFormState>(emptyProfileForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const next = profileFormFromApi(profile);
    setForm(next);
    setBaseline(next);
  }, [profile]);

  useEffect(() => {
    if (queryError) setError(queryError.message);
  }, [queryError]);

  const completeness = useMemo(() => computeProfileCompleteness(form), [form]);
  const isDirty = useMemo(() => hasProfileFormChanges(form, baseline), [form, baseline]);
  const showInitialSkeleton = loading && profile === null;
  const isRefreshing = isFetching && !loading;
  const needsProfileAttention = completeness.missing.length > 0;

  const reload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const updateField = useCallback(
    <K extends keyof VendorProfileFormState>(key: K, value: VendorProfileFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setSuccess(null);
    },
    []
  );

  const save = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = await user.getIdToken();
      const payload = buildProfileSavePayload(form);
      await updateVendorBusinessProfile(token, payload);
      setBaseline(form);
      setSuccess("Profile saved. Your public listing and map location are updated.");
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }, [user, profile, form, refetch]);

  return {
    profile,
    form,
    updateField,
    completeness,
    isDirty,
    needsProfileAttention,
    saving,
    error,
    success,
    showInitialSkeleton,
    isRefreshing,
    verification,
    reload,
    save,
  };
}
