"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import AuthModal from "@/modules/identity/AuthModal";

export type VendorAuthIntent = "book" | "message" | "review";

const INTENT_COPY: Record<
  VendorAuthIntent,
  { title: string; description: string }
> = {
  book: {
    title: "Sign in to request a booking",
    description:
      "Create a free account or sign in to choose your event date and send a booking request to this vendor.",
  },
  message: {
    title: "Sign in to message this vendor",
    description:
      "Sign in to send a message through MyWedding.lk. The vendor replies to your registered email.",
  },
  review: {
    title: "Sign in to leave a review",
    description:
      "Reviews help other couples choose with confidence. Sign in to share feedback after your wedding.",
  },
};

type PendingAction = () => void;

interface VendorDetailAuthContextValue {
  requireAuth: (intent: VendorAuthIntent, action: PendingAction) => void;
}

const VendorDetailAuthContext = createContext<VendorDetailAuthContextValue | null>(null);

export function VendorDetailAuthProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [intent, setIntent] = useState<VendorAuthIntent>("book");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [reviewNoticeOpen, setReviewNoticeOpen] = useState(false);

  const requireAuth = useCallback(
    (authIntent: VendorAuthIntent, action: PendingAction) => {
      if (user) {
        if (authIntent === "review") {
          setReviewNoticeOpen(true);
          return;
        }
        action();
        return;
      }
      setIntent(authIntent);
      setPendingAction(() => action);
      setAuthOpen(true);
    },
    [user]
  );

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    if (intent === "review") {
      setReviewNoticeOpen(true);
      setPendingAction(null);
      return;
    }
    pendingAction?.();
    setPendingAction(null);
  };

  const copy = INTENT_COPY[intent];

  return (
    <VendorDetailAuthContext.Provider value={{ requireAuth }}>
      {children}

      <AuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPendingAction(null);
        }}
        title={copy.title}
        description={copy.description}
        redirectOnSuccess={false}
        onSuccess={handleAuthSuccess}
      />

      {reviewNoticeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setReviewNoticeOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-charcoal">Reviews after your event</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              To keep reviews trustworthy, you can leave a rating after you have a completed booking
              with this vendor through MyWedding.lk. Book a service first, then return here once your
              event is done.
            </p>
            <button
              type="button"
              onClick={() => setReviewNoticeOpen(false)}
              className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </VendorDetailAuthContext.Provider>
  );
}

export function useVendorDetailAuth() {
  const ctx = useContext(VendorDetailAuthContext);
  if (!ctx) {
    throw new Error("useVendorDetailAuth must be used within VendorDetailAuthProvider");
  }
  return ctx;
}
