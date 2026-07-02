"use client";

import { useEffect, useId, useRef } from "react";
import { CalendarOff, Lock, X } from "lucide-react";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

export function VendorBlockDateModal({
  isOpen,
  dateLabel,
  reason,
  saving,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  dateLabel: string;
  reason: string;
  saving?: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    document.addEventListener("keydown", onEscape);
    const frame = requestAnimationFrame(() => textareaRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", onEscape);
      cancelAnimationFrame(frame);
    };
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        className={cn(rf.panel, "relative w-full max-w-md overflow-hidden")}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className={cn(rf.navBtn, "absolute right-3 top-3")}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-8">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Lock size={20} aria-hidden />
            </div>
            <div className="min-w-0 pr-6">
              <h3 id={titleId} className={rf.sectionTitle}>
                Block this day?
              </h3>
              <p className={cn("mt-1", rf.subtitle)}>
                <span className="font-medium text-foreground">{dateLabel}</span> will show as unavailable to
                couples and planners.
              </p>
            </div>
          </div>

          <label className={cn("block", vg.label)} htmlFor="block-date-reason">
            Reason <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            ref={textareaRef}
            id="block-date-reason"
            rows={3}
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            disabled={saving}
            placeholder="e.g. Personal travel, equipment service, already booked offline…"
            className={cn(vd.input, "mt-1.5 resize-none")}
            maxLength={200}
          />
          <p className={cn("mt-1.5", vg.caption)}>
            Only you see this note. It helps you remember why the day is blocked.
          </p>

          <div className="mt-6 flex gap-3">
            <GlassButton
              variant="ghost"
              className="flex-1 justify-center"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </GlassButton>
            <GlassButton
              variant="primary"
              className="flex-1 justify-center gap-1.5"
              onClick={onConfirm}
              disabled={saving}
            >
              <CalendarOff size={16} aria-hidden />
              {saving ? "Blocking…" : "Block day"}
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
}
