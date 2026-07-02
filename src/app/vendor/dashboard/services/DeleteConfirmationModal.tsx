"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-listing-title"
    >
      <div className={cn(rf.panel, "relative w-full max-w-md overflow-hidden")}>
        <button
          type="button"
          onClick={onClose}
          className={cn(rf.navBtn, "absolute right-3 top-3")}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle size={32} strokeWidth={2} aria-hidden />
          </div>
          <h3 id="delete-listing-title" className={rf.sectionTitle}>
            {title}
          </h3>
          <p className={cn("mb-8 mt-2 leading-relaxed", rf.subtitle)}>{message}</p>

          <div className="flex gap-3">
            <GlassButton variant="ghost" className="flex-1 justify-center" onClick={onClose}>
              Cancel
            </GlassButton>
            <button
              type="button"
              className="font-glass-body inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-destructive px-3.5 py-1.5 text-xs font-medium text-destructive-foreground shadow-sm transition-opacity hover:opacity-90"
              onClick={onConfirm}
            >
              <Trash2 size={18} aria-hidden />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
