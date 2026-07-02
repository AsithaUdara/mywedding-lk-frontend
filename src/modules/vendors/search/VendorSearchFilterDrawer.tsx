"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { VendorSearchFilters, type VendorSearchFiltersProps } from "./VendorSearchFilters";
import { cn } from "@/shared/lib/cn";

type VendorSearchFilterDrawerProps = VendorSearchFiltersProps & {
  isOpen: boolean;
  onClose: () => void;
};

export function VendorSearchFilterDrawer({
  isOpen,
  onClose,
  ...filters
}: VendorSearchFilterDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/35 backdrop-blur-sm"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Filters</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <VendorSearchFilters
            {...filters}
            embedded
            showFooter
            onApply={onClose}
            applyLabel={`Show ${filters.vendorCount} results`}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
