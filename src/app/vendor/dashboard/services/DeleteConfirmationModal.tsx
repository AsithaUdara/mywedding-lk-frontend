"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/shared/components/ui";

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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-listing-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle size={32} strokeWidth={2} aria-hidden />
          </div>
          <h3 id="delete-listing-title" className="text-xl font-bold text-foreground">
            {title}
          </h3>
          <p className="mb-8 mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="danger" className="flex-1" onClick={onConfirm}>
              <Trash2 size={18} aria-hidden />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
