"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Crown,
  ListTodo,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  applyChecklistPlan,
  generatePersonalizedChecklistPlan,
  getChecklistPreview,
  type ChecklistPlanPreview,
  type PersonalizedChecklistPlan,
} from "@/shared/lib/api/checklistPlan";
import { generateFullChecklist } from "@/shared/lib/api/tasks";
import { ErrorBanner, inputClass } from "@/modules/planner/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { PlannerUpgradeModal } from "@/modules/planner/subscription/PlannerUpgradeModal";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

interface ChecklistPlanWizardProps {
  eventId: string;
  eventName?: string;
  taskPlanPhase?: string;
  isPlannerPro?: boolean;
  onApplied?: () => void;
  embedded?: boolean;
}

export function ChecklistPlanWizard({
  eventId,
  eventName,
  taskPlanPhase,
  isPlannerPro = false,
  onApplied,
}: ChecklistPlanWizardProps) {
  const { user } = useAuth();
  const [preview, setPreview] = useState<ChecklistPlanPreview | null>(null);
  const [plan, setPlan] = useState<PersonalizedChecklistPlan | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [meetingNotes, setMeetingNotes] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [personalizing, setPersonalizing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isFullPhase = taskPlanPhase === "Full";

  const loadPreview = useCallback(async () => {
    if (!user || !eventId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const data = await getChecklistPreview(token, eventId);
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load checklist preview.");
    } finally {
      setLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    if (!isFullPhase) {
      void loadPreview();
    }
  }, [loadPreview, isFullPhase]);

  const includedCount = useMemo(() => {
    if (!preview) return 0;
    return preview.templateTasks.filter((t) => !excluded.has(t.title)).length;
  }, [preview, excluded]);

  const handleApplyStandard = async () => {
    if (!user || !eventId) return;
    try {
      setApplying(true);
      setError(null);
      setSuccess(null);
      const token = await user.getIdToken();
      const result = await generateFullChecklist(token, eventId);
      setSuccess(result.message);
      onApplied?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add checklist.");
    } finally {
      setApplying(false);
    }
  };

  const handlePersonalize = async () => {
    if (!isPlannerPro) {
      setUpgradeOpen(true);
      return;
    }
    if (!user || !eventId) return;
    try {
      setPersonalizing(true);
      setError(null);
      const token = await user.getIdToken();
      const result = await generatePersonalizedChecklistPlan(
        token,
        eventId,
        meetingNotes.trim() || undefined
      );
      setPlan(result);
      const nextExcluded = new Set(result.excludeTemplateTitles);
      for (const line of result.templatePreview) {
        if (line.excludedByPlan) {
          nextExcluded.add(line.title);
        }
      }
      setExcluded(nextExcluded);
      setShowAiPanel(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to personalize checklist.");
    } finally {
      setPersonalizing(false);
    }
  };

  const handleApplyPersonalized = async () => {
    if (!user || !eventId) return;
    try {
      setApplying(true);
      setError(null);
      const token = await user.getIdToken();
      const additionalTasks =
        plan?.additionalTasks.map((t) => ({
          title: t.title,
          description: t.description,
        })) ?? [];

      const result = await applyChecklistPlan(token, eventId, {
        excludeTemplateTitles: Array.from(excluded),
        additionalTasks,
        markBriefComplete: true,
      });
      setSuccess(result.message);
      onApplied?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply checklist.");
    } finally {
      setApplying(false);
    }
  };

  if (isFullPhase) {
    return null;
  }

  const displayName = eventName ?? preview?.eventName ?? "this wedding";
  const taskTotal = preview?.templateTasks.length ?? 51;

  return (
    <div className="space-y-5">
      {error && <ErrorBanner message={error} />}
      {success && (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin" aria-hidden />
          Loading…
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-4 text-sm leading-relaxed text-foreground">
            <p className="font-semibold">What happens here?</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>
                <strong className="text-foreground">Standard path:</strong> adds all {taskTotal}{" "}
                industry tasks to your Gantt, scheduled from today until the wedding.
              </li>
              <li>
                <strong className="text-foreground">Your couple brief</strong> is saved for you
                and the client hub — it does not change the standard list by itself.
              </li>
              <li>
                <strong className="text-foreground">Planner Pro (optional):</strong> AI reads the
                brief and meeting notes to <em>remove</em> tasks you do not need (e.g. skip poruwa
                steps for a garden wedding) and suggest extras.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm font-semibold text-foreground">Recommended — no AI required</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the full master checklist for {displayName} now. You can edit or delete tasks on
              the timeline anytime.
            </p>
            <GlassButton
              type="button"
              variant="primary"
              className="mt-4 w-full gap-2 sm:w-auto"
              disabled={applying}
              onClick={() => void handleApplyStandard()}
            >
              {applying ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : (
                <ListTodo size={16} aria-hidden />
              )}
              {applying ? "Adding tasks…" : `Add full checklist (${taskTotal} tasks)`}
            </GlassButton>
          </div>

          <div className="rounded-xl border border-border/60 bg-white/40">
            <button
              type="button"
              onClick={() => setShowAiPanel((v) => !v)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles size={16} className="text-accent" aria-hidden />
                Optional: personalize with AI
                {!isPlannerPro && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                    <Crown size={10} aria-hidden />
                    Pro
                  </span>
                )}
              </span>
              {showAiPanel ? (
                <ChevronDown size={18} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={18} className="text-muted-foreground" />
              )}
            </button>

            {showAiPanel && (
              <div className="space-y-4 border-t border-border/50 px-4 pb-5 pt-2">
                <p className="text-xs text-muted-foreground">
                  Uses your brief{preview?.isBriefComplete ? " (complete)" : ""} plus optional
                  meeting notes to exclude irrelevant template lines and add custom tasks.
                </p>

                <label className="block space-y-1.5">
                  <span className={vg.label}>Meeting notes (optional)</span>
                  <textarea
                    className={cn(glassInput, "min-h-[72px] resize-y")}
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder="Paste discovery call notes…"
                  />
                </label>

                <GlassButton
                  type="button"
                  variant="ghost"
                  className="gap-1.5"
                  disabled={personalizing}
                  onClick={() => void handlePersonalize()}
                >
                  {personalizing ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden />
                  ) : (
                    <Sparkles size={16} aria-hidden />
                  )}
                  {personalizing ? "Analyzing…" : "Run AI personalization"}
                </GlassButton>

                {plan && (
                  <div className="rounded-lg border border-violet-200/70 bg-violet-50/80 px-3 py-3 text-sm text-violet-950">
                    <p className="font-medium">AI summary</p>
                    <p className="mt-1 text-xs">{plan.executiveSummary}</p>
                    <p className="mt-2 text-xs font-medium">
                      {includedCount} tasks included · {excluded.size} excluded
                      {plan.additionalTasks.length > 0 &&
                        ` · +${plan.additionalTasks.length} custom`}
                    </p>
                  </div>
                )}

                {plan && (
                  <ul className="max-h-48 divide-y divide-border/40 overflow-y-auto rounded-lg border border-border/50 bg-white/50 text-sm">
                    {preview?.templateTasks.map((task) => {
                      const isExcluded = excluded.has(task.title);
                      return (
                        <li
                          key={task.templateIndex}
                          className="flex items-center justify-between gap-2 px-3 py-2"
                        >
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate",
                              isExcluded && "text-muted-foreground line-through"
                            )}
                          >
                            {task.title}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setExcluded((prev) => {
                                const next = new Set(prev);
                                if (next.has(task.title)) next.delete(task.title);
                                else next.add(task.title);
                                return next;
                              })
                            }
                            className="shrink-0 text-[10px] font-semibold uppercase text-primary"
                          >
                            {isExcluded ? "Include" : "Exclude"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {plan && (
                  <GlassButton
                    type="button"
                    variant="primary"
                    className="gap-1.5"
                    disabled={applying || includedCount === 0}
                    onClick={() => void handleApplyPersonalized()}
                  >
                    {applying ? (
                      <Loader2 size={16} className="animate-spin" aria-hidden />
                    ) : (
                      <ArrowRight size={16} aria-hidden />
                    )}
                    Apply personalized plan ({includedCount} tasks)
                  </GlassButton>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <PlannerUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        message="AI checklist personalization is included with Planner Pro. You can still add the full standard checklist without upgrading."
      />
    </div>
  );
}
