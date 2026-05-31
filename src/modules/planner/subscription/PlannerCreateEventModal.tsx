"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { PlannerCreateEventForm } from "@/modules/planner/subscription/PlannerCreateEventForm";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function PlannerCreateEventModal({ open, onClose, onCreated }: Props) {
  useEffect(() => {
    if (open) {
      document.body.classList.add("modal-open-blur");
    } else {
      document.body.classList.remove("modal-open-blur");
    }
    return () => {
      document.body.classList.remove("modal-open-blur");
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="planner-create-event-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/80 bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 id="planner-create-event-title" className={cn(rf.sectionTitle, "pr-8 text-foreground")}>
          New client wedding
        </h2>
        <p className={cn("mt-1", vg.subtitle)}>
          Link a registered couple by email and set the wedding date and budget.
        </p>

        <PlannerCreateEventForm
          key={open ? "open" : "closed"}
          className="mt-6"
          onCreated={() => {
            onCreated?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
}
