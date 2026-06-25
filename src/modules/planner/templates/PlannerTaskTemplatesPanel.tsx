"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  deletePlannerTaskTemplate,
  getPlannerTaskTemplates,
  type PlannerTaskTemplateListItem,
} from "@/shared/lib/api/plannerTaskTemplates";
import { formatTemplateKey } from "@/modules/planner/settings/plannerSettingsHelpers";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";

type PlannerTaskTemplatesPanelProps = {
  embedded?: boolean;
};

export function PlannerTaskTemplatesPanel({ embedded = false }: PlannerTaskTemplatesPanelProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PlannerTaskTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerTaskTemplates(token);
      setTemplates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (template: PlannerTaskTemplateListItem) => {
    if (!user) return;
    if (!window.confirm(`Delete template "${template.name}"? This cannot be undone.`)) return;
    try {
      setDeletingId(template.id);
      setError(null);
      const token = await user.getIdToken();
      await deletePlannerTaskTemplate(token, template.id);
      setTemplates((prev) => prev.filter((item) => item.id !== template.id));
      setMessage(`Deleted "${template.name}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete template.");
    } finally {
      setDeletingId(null);
    }
  };

  const content = (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {message && (
        <p className="rounded-lg border border-[#E3FCEF] bg-[#E3FCEF]/60 px-4 py-3 text-sm font-medium text-[#006644]">
          {message}
        </p>
      )}

      {loading ? (
        <p className="inline-flex items-center gap-2 py-4 text-sm text-[#5E6C84]">
          <Loader2 size={14} className="animate-spin" aria-hidden />
          Loading templates…
        </p>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-[#EBECF0] bg-[#FAFBFC] px-4 py-6 text-center">
          <p className="font-medium text-[#172B4D]">No custom templates yet</p>
          <p className="mt-1 text-sm text-[#5E6C84]">
            Open a wedding timeline with tasks and use{" "}
            <span className="font-semibold text-[#172B4D]">Save as template</span>.
          </p>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          {templates.map((template, index) => (
            <li key={template.id}>
              <article className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_1px_rgba(9,30,66,0.08)]">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#5E6C84]">{formatTemplateKey(index)}</p>
                  <h3 className="mt-0.5 font-medium text-[#172B4D]">{template.name}</h3>
                  {template.description && (
                    <p className="mt-1 text-sm text-[#5E6C84]">{template.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[#DEEBFF] px-2.5 py-0.5 text-[10px] font-semibold text-[#0747A6]">
                      {template.taskCount} tasks
                    </span>
                    <span className="rounded-full bg-[#F4F5F7] px-2.5 py-0.5 text-[10px] font-semibold text-[#42526E]">
                      {template.scheduleMode === "DaysBeforeWedding"
                        ? "From wedding date"
                        : "From plan start"}
                    </span>
                  </div>
                </div>
                <GlassButton
                  type="button"
                  variant="ghost"
                  className="shrink-0 gap-1 px-2.5 py-1.5 text-xs text-destructive hover:text-destructive"
                  disabled={deletingId === template.id}
                  onClick={() => void handleDelete(template)}
                >
                  {deletingId === template.id ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden />
                  ) : (
                    <Trash2 size={14} aria-hidden />
                  )}
                  Delete
                </GlassButton>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  if (embedded) return content;

  return content;
}
