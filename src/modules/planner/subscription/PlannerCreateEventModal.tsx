"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { PlannerCreateEventForm } from "@/modules/planner/subscription/PlannerCreateEventForm";
import { PlannerCreateEventSuccess } from "@/modules/planner/subscription/PlannerCreateEventSuccess";
import type { CreatePlannerEventResult } from "@/shared/lib/api/planner";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (result: CreatePlannerEventResult) => void;
};

export function PlannerCreateEventModal({ open, onClose, onCreated }: Props) {
  const [success, setSuccess] = useState<CreatePlannerEventResult | null>(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open-blur");
      setSuccess(null);
    } else {
      document.body.classList.remove("modal-open-blur");
    }
    return () => {
      document.body.classList.remove("modal-open-blur");
    };
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    setSuccess(null);
    onClose();
  };

  const handleCreated = (result: CreatePlannerEventResult) => {
    setSuccess(result);
    onCreated?.(result);
  };

  const titleId = success
    ? "planner-create-event-success-title"
    : "planner-create-event-title";

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleClose}
    >
      <div
        className={cn(
          "font-glass-body relative w-full overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl",
          success ? "max-w-md" : "max-w-xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/[0.06] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-accent/[0.08] blur-2xl"
          aria-hidden
        />

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="relative p-6 sm:p-8">
          {success ? (
            <PlannerCreateEventSuccess result={success} onClose={handleClose} />
          ) : (
            <>
              <div className="mb-6 flex items-start gap-4 pr-8">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <CalendarPlus size={22} strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0">
            <h2
              id="planner-create-event-title"
              className="font-glass-body text-xl font-semibold text-foreground"
            >
                    New client wedding
                  </h2>
                  <p className={cn("mt-1.5 leading-relaxed", vg.subtitle)}>
                    Link a registered couple by email. We&apos;ll create the event and seed{" "}
                    <span className="font-medium text-foreground">8 discovery tasks</span> on
                    your timeline.
                  </p>
                </div>
              </div>

              <PlannerCreateEventForm
                key={open ? "open" : "closed"}
                onCreated={handleCreated}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
