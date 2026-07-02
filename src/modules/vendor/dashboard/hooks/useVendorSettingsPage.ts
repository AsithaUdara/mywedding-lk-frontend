"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import {
  createVendorSubscriptionCheckout,
  openPayHereCheckout,
  saveVendorBillingProfile,
  setVendorSubscription,
} from "@/shared/lib/api/vendors";
import {
  useVendorBillingProfileQuery,
  useVendorSubscriptionQuery,
} from "@/shared/hooks/query/useVendorQueries";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import type { VendorTier } from "@/modules/vendor/billing/constants";
import {
  buildPaymentSavePayload,
  emptyPaymentForm,
  hasPaymentFormInput,
  normalizeVendorTier,
  VENDOR_TIER_PRICING,
  type PaymentFormState,
} from "@/modules/vendor/dashboard/vendorSettingsHelpers";

export function useVendorSettingsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const {
    data: subscription,
    isLoading: subLoading,
    isFetching: subFetching,
    error: subError,
  } = useVendorSubscriptionQuery();
  const {
    data: billingProfile,
    isLoading: profileLoading,
    isFetching: profileFetching,
    error: profileError,
  } = useVendorBillingProfileQuery();

  const currentTier = useMemo(
    () => normalizeVendorTier(subscription?.tier),
    [subscription?.tier]
  );

  const [selectedTier, setSelectedTier] = useState<VendorTier>("Free");
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(emptyPaymentForm);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentReturn = searchParams.get("payment");
  const showInitialSkeleton =
    (subLoading && subscription === undefined) ||
    (profileLoading && billingProfile === undefined);
  const isRefreshing =
    (subFetching || profileFetching) &&
    !subLoading &&
    !profileLoading &&
    subscription !== undefined &&
    billingProfile !== undefined;

  const hasPaymentMethod = Boolean(billingProfile?.hasPaymentMethod);
  const savedLast4 = billingProfile?.last4 ?? null;
  const savedBrand = billingProfile?.cardBrand ?? null;
  const planDirty = selectedTier !== currentTier;
  const paymentDirty = hasPaymentFormInput(paymentForm);
  const needsPaymentForUpgrade = selectedTier !== "Free" && !hasPaymentMethod;

  useEffect(() => {
    setSelectedTier(currentTier);
  }, [currentTier]);

  useEffect(() => {
    if (!billingProfile?.cardholderName) return;
    setPaymentForm((prev) =>
      prev.cardholderName ? prev : { ...prev, cardholderName: billingProfile.cardholderName ?? "" }
    );
  }, [billingProfile?.cardholderName]);

  useEffect(() => {
    const err = subError ?? profileError;
    if (err) setError(err.message);
  }, [subError, profileError]);

  useEffect(() => {
    if (paymentReturn === "success") {
      setMessage("Payment received. Your plan will activate shortly after confirmation.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.vendor.all });
    } else if (paymentReturn === "cancelled") {
      setError("Payment was cancelled. Your plan was not changed.");
    }
  }, [paymentReturn, queryClient]);

  const reload = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.vendor.all });
  }, [queryClient]);

  const updatePaymentField = useCallback(
    <K extends keyof PaymentFormState>(key: K, value: PaymentFormState[K]) => {
      setPaymentForm((prev) => ({ ...prev, [key]: value }));
      setMessage(null);
    },
    []
  );

  const savePaymentMethod = useCallback(async () => {
    if (!user) return;

    const payload = buildPaymentSavePayload(paymentForm);
    if (!payload) {
      setError("Enter a valid card number, cardholder name, and expiry (MM/YY).");
      return;
    }

    try {
      setSavingPayment(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();
      await saveVendorBillingProfile(token, payload);
      setMessage("Payment method saved securely (only masked details are stored).");
      setPaymentForm((prev) => ({
        ...prev,
        cardNumber: "",
        cvv: "",
      }));
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendor.all });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save payment method.");
    } finally {
      setSavingPayment(false);
    }
  }, [user, paymentForm, queryClient]);

  const savePlan = useCallback(async () => {
    if (!user) return;

    const monthlyFee = VENDOR_TIER_PRICING[selectedTier];
    if (selectedTier !== "Free" && !hasPaymentMethod) {
      setError("Add a payment method before selecting a paid plan.");
      return;
    }

    try {
      setSavingPlan(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();

      if (selectedTier === "Free") {
        await setVendorSubscription(token, { tier: selectedTier, monthlyFee: 0 });
        setMessage("Plan updated to Free.");
        await queryClient.invalidateQueries({ queryKey: queryKeys.vendor.all });
        return;
      }

      const checkout = await createVendorSubscriptionCheckout(token, {
        tier: selectedTier,
        monthlyFee,
      });
      if (checkout?.checkout?.checkoutUrl) {
        openPayHereCheckout(checkout.checkout);
        setMessage("Redirecting to secure PayHere checkout…");
        return;
      }

      await setVendorSubscription(token, { tier: selectedTier, monthlyFee });
      setMessage("Subscription updated successfully.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.vendor.all });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subscription.");
    } finally {
      setSavingPlan(false);
    }
  }, [user, selectedTier, hasPaymentMethod, queryClient]);

  return {
    currentTier,
    selectedTier,
    setSelectedTier,
    subscriptionStatus: subscription?.status ?? "Active",
    hasPaymentMethod,
    savedLast4,
    savedBrand,
    paymentForm,
    updatePaymentField,
    planDirty,
    paymentDirty,
    needsPaymentForUpgrade,
    savingPlan,
    savingPayment,
    message,
    error,
    showInitialSkeleton,
    isRefreshing,
    reload,
    savePlan,
    savePaymentMethod,
  };
}
