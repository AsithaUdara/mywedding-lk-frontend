"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Bookmark, CalendarPlus, ClipboardList, ListTodo, Loader2, PenLine } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  createPlannerEvent,
  type CreatePlannerEventPayload,
  type CreatePlannerEventResult,
  type EventTaskSeedMode,
} from "@/shared/lib/api/planner";
import {
  getPlannerTaskTemplates,
  type PlannerTaskTemplateListItem,
} from "@/shared/lib/api/plannerTaskTemplates";
import { inputClass } from "@/modules/planner/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";
import { todayForDateInput } from "@/shared/lib/format";
import { isPlannerSubscriptionLimitError } from "./errors";
import { PlannerUpgradeModal } from "./PlannerUpgradeModal";

const DEFAULT: CreatePlannerEventPayload = {
  eventName: "",
  eventDate: "",
  totalBudget: 0,
  clientEmail: "",
  taskSeedMode: "DiscoveryStarter",
};

const modalInput = cn(inputClass, "border-border bg-white");

const TASK_SEED_OPTIONS: {
  value: EventTaskSeedMode;
  title: string;
  description: string;
  icon: typeof ListTodo;
}[] = [
  {
    value: "Manual",
    title: "Build manually",
    description: "Empty timeline — add and edit every task yourself.",
    icon: PenLine,
  },
  {
    value: "DiscoveryStarter",
    title: "Starter template (8 tasks)",
    description: "Industry onboarding checklist from today until couple brief is done.",
    icon: ClipboardList,
  },
  {
    value: "MasterChecklist",
    title: "Master template (50 tasks)",
    description: "Full wedding timeline scheduled backward from the wedding date.",
    icon: ListTodo,
  },
];

const minWeddingDate = todayForDateInput();

type Props = {
  onCreated?: (result: CreatePlannerEventResult) => void;
  className?: string;
};

export function PlannerCreateEventForm({ onCreated, className }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState<CreatePlannerEventPayload>(DEFAULT);
  const [customTemplates, setCustomTemplates] = useState<PlannerTaskTemplateListItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>();

  const loadTemplates = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await getPlannerTaskTemplates(token);
      setCustomTemplates(data);
    } catch {
      setCustomTemplates([]);
    }
  }, [user]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (form.eventDate < minWeddingDate) {
      setError("Wedding date cannot be in the past.");
      return;
    }
    if (form.taskSeedMode === "CustomTemplate" && !form.customTemplateId) {
      setError("Select one of your saved templates.");
      return;
    }
    try {
      setCreating(true);
      setError(null);
      const token = await user.getIdToken();
      const created = await createPlannerEvent(token, form);
      const eventName = form.eventName.trim();
      const taskSeedMode = form.taskSeedMode ?? "DiscoveryStarter";
      setForm(DEFAULT);
      onCreated?.({
        ...created,
        eventName,
        taskSeedMode,
      });
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

  const selectBuiltIn = (mode: EventTaskSeedMode) => {
    setForm((f) => ({ ...f, taskSeedMode: mode, customTemplateId: undefined }));
  };

  const selectCustom = (templateId: string) => {
    setForm((f) => ({
      ...f,
      taskSeedMode: "CustomTemplate",
      customTemplateId: templateId,
    }));
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
              className={modalInput}
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
              min={minWeddingDate}
              value={form.eventDate}
              onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
              className={modalInput}
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
              className={modalInput}
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
              className={modalInput}
              placeholder="client@email.com"
            />
          </div>

          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-semibold text-foreground">
              How should tasks start?
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {TASK_SEED_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected =
                  (form.taskSeedMode ?? "DiscoveryStarter") === option.value &&
                  form.taskSeedMode !== "CustomTemplate";
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer flex-col gap-2 rounded-xl border p-3 transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-white hover:border-primary/30"
                    )}
                  >
                    <input
                      type="radio"
                      name="taskSeedMode"
                      value={option.value}
                      checked={selected}
                      onChange={() => selectBuiltIn(option.value)}
                      className="sr-only"
                    />
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Icon size={15} className="text-primary" aria-hidden />
                      {option.title}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </label>
                );
              })}
            </div>

            {customTemplates.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">My saved templates</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {customTemplates.map((template) => {
                    const selected =
                      form.taskSeedMode === "CustomTemplate" &&
                      form.customTemplateId === template.id;
                    return (
                      <label
                        key={template.id}
                        className={cn(
                          "flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-colors",
                          selected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border bg-white hover:border-primary/30"
                        )}
                      >
                        <input
                          type="radio"
                          name="customTemplate"
                          checked={selected}
                          onChange={() => selectCustom(template.id)}
                          className="sr-only"
                        />
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Bookmark size={14} className="text-primary" aria-hidden />
                          {template.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {template.taskCount} tasks
                          {template.description ? ` · ${template.description}` : ""}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </fieldset>
        </div>
        <GlassButton type="submit" variant="primary" className="mt-5 gap-2" disabled={creating}>
          {creating ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <CalendarPlus size={16} aria-hidden />
          )}
          {creating ? "Creating…" : "Create wedding"}
        </GlassButton>
      </form>

      <PlannerUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        message={upgradeMessage}
      />
    </>
  );
}
