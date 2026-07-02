"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookmarkPlus, Loader2, X } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { savePlannerTaskTemplateFromEvent } from "@/shared/lib/api/plannerTaskTemplates";
import { ErrorBanner, inputClass } from "@/modules/planner/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

type Props = {
  open: boolean;
  eventId: string;
  eventName?: string;
  taskCount: number;
  onClose: () => void;
  onSaved?: () => void;
};

export function SaveTaskTemplateModal({
  open,
  eventId,
  eventName,
  taskCount,
  onClose,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(eventName ? `${eventName} checklist` : "");
    setDescription("");
    setError(null);
  }, [open, eventName]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const token = await user.getIdToken();
      await savePlannerTaskTemplateFromEvent(token, eventId, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template.");
    } finally {
      setSaving(false);
    }
  }, [user, eventId, name, description, onClose, onSaved]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative z-[1] w-full max-w-md rounded-2xl border border-white/60 bg-white/95 p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className={cn("text-lg font-semibold", vg.body)}>Save as my template</h2>
            <p className={cn("mt-0.5", vg.caption)}>
              Stores {taskCount} tasks with dates as days-before-wedding offsets for reuse.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <div className="space-y-4">
          <div>
            <label htmlFor="tpl-name" className={cn("mb-1.5 block font-semibold", vg.body)}>
              Template name
            </label>
            <input
              id="tpl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={glassInput}
              placeholder="e.g. Kandyan garden wedding — full plan"
              required
            />
          </div>
          <div>
            <label htmlFor="tpl-desc" className={cn("mb-1.5 block font-semibold", vg.body)}>
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="tpl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={cn(glassInput, "resize-y")}
              placeholder="When to use this template…"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <GlassButton type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </GlassButton>
          <GlassButton
            type="button"
            variant="primary"
            className="gap-1.5"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" aria-hidden />
            ) : (
              <BookmarkPlus size={14} aria-hidden />
            )}
            Save template
          </GlassButton>
        </div>
      </div>
    </div>,
    document.body
  );
}
