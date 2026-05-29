"use client";

import React, { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { setTotalBudget as setTotalBudgetAPI } from "@/shared/lib/api/budget";
import { Wallet } from "lucide-react";
import { Button, ErrorBanner, inputClass } from "@/shared/components/ui";
import { pv } from "@/modules/vendors/public-theme";
import { cn } from "@/shared/lib/cn";

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
      className={cn(pv.modalOverlay, "z-[60]")}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={pv.modalPanel}>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <h2 className="mt-4 font-playfair text-2xl font-bold text-foreground sm:text-3xl">
            Welcome to &quot;{eventName}&quot;
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Let&apos;s start with the basics. What is your total estimated budget?
          </p>
        </div>

        {error && <ErrorBanner message={error} className="mt-4" />}

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-5">
          <div>
            <label htmlFor="totalBudget" className={cn("mb-1.5 block", pv.label)}>
              Total budget (LKR)
            </label>
            <input
              id="totalBudget"
              type="number"
              placeholder="e.g., 5000000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              required
              className={cn(inputClass, "text-center text-xl font-bold")}
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Set budget & start planning"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EventSetupModal;
