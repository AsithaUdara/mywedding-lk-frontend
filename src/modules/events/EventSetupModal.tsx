"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { setTotalBudget as setTotalBudgetAPI } from "@/shared/lib/api/budget";
import { Wallet } from "lucide-react";
import { ErrorBanner, inputClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

interface EventSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

const EventSetupModal = ({ isOpen, onClose, eventId, eventName }: EventSetupModalProps) => {
  const { user } = useAuth();
  const [totalBudget, setTotalBudget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open-blur");
    } else {
      document.body.classList.remove("modal-open-blur");
    }
    return () => {
      document.body.classList.remove("modal-open-blur");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in.");
      return;
    }

    const budgetAmount = parseFloat(totalBudget);
    if (isNaN(budgetAmount) || budgetAmount < 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      await setTotalBudgetAPI(token, eventId, budgetAmount);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-setup-title"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={cn(rf.panel, "relative w-full max-w-lg overflow-hidden p-6 sm:p-8")}>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
            <Wallet className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <h2 id="event-setup-title" className={cn(rf.sectionTitle, "mt-4")}>
            Welcome to &quot;{eventName}&quot;
          </h2>
          <p className={cn("mt-2", rf.subtitle)}>
            Let&apos;s start with the basics. What is your total estimated budget?
          </p>
        </div>

        {error && <ErrorBanner message={error} className="mt-4" />}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-5">
          <div>
            <label htmlFor="totalBudget" className={cn("mb-1.5 block", rf.label)}>
              Total budget (LKR)
            </label>
            <input
              id="totalBudget"
              type="number"
              placeholder="e.g., 5000000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              required
              className={cn(glassInput, "text-center text-xl font-bold")}
            />
          </div>

          <GlassButton type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
            {loading ? "Saving…" : "Set budget & start planning"}
          </GlassButton>
        </form>
      </div>
    </div>
  );
};

export default EventSetupModal;
