"use client";

import { FormEvent, useState } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  createPlannerEvent,
  type CreatePlannerEventPayload,
} from "@/shared/lib/api/planner";
import { Button, inputClass } from "@/modules/planner/components/ui";
import { isPlannerSubscriptionLimitError } from "./errors";
import { PlannerUpgradeModal } from "./PlannerUpgradeModal";

const DEFAULT: CreatePlannerEventPayload = {
  eventName: "",
  eventDate: "",
  totalBudget: 0,
  clientEmail: "",
};

type Props = {
  onCreated?: () => void;
  className?: string;
};

export function PlannerCreateEventForm({ onCreated, className }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState<CreatePlannerEventPayload>(DEFAULT);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setCreating(true);
      setError(null);
      const token = await user.getIdToken();
      await createPlannerEvent(token, form);
      setForm(DEFAULT);
      onCreated?.();
    } catch (err) {
      if (isPlannerSubscriptionLimitError(err)) {
        setUpgradeMessage(err.message);
        setUpgradeOpen(true);
      } else {
        setError(err instanceof Error ? err.message : "Failed to create event.");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <form onSubmit={(e) => void onSubmit(e)} className={className}>
        {error && (
          <p className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="pe-name" className="mb-1.5 block text-sm font-semibold text-foreground">
              Event name
            </label>
            <input
              id="pe-name"
              required
              value={form.eventName}
              onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))}
              className={inputClass}
              placeholder="Amaya & Dev — Garden Wedding"
            />
          </div>
          <div>
            <label htmlFor="pe-date" className="mb-1.5 block text-sm font-semibold text-foreground">
              Wedding date
            </label>
            <input
              id="pe-date"
              type="date"
              required
              value={form.eventDate}
              onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pe-budget" className="mb-1.5 block text-sm font-semibold text-foreground">
              Total budget (LKR)
            </label>
            <input
              id="pe-budget"
              type="number"
              min={0}
              required
              value={form.totalBudget || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, totalBudget: Number(e.target.value) || 0 }))
              }
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pe-client" className="mb-1.5 block text-sm font-semibold text-foreground">
              Client email
            </label>
            <input
              id="pe-client"
              type="email"
              required
              value={form.clientEmail ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))}
              className={inputClass}
              placeholder="client@email.com"
            />
          </div>
        </div>
        <Button type="submit" className="mt-5 gap-2" disabled={creating}>
          {creating ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <CalendarPlus size={16} aria-hidden />
          )}
          {creating ? "Creating…" : "Create wedding"}
        </Button>
      </form>

      <PlannerUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        message={upgradeMessage}
      />
    </>
  );
}
