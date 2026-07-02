"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";

type Props = {
  step: number;
  title: string;
  hint?: string;
  done?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function PlannerSetupSection({
  step,
  title,
  hint,
  done,
  open,
  onToggle,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white/50",
        open ? "border-primary/25 shadow-sm" : "border-white/60"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/70 sm:px-5"
        aria-expanded={open}
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            done
              ? "bg-emerald-600 text-white"
              : open
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
          )}
        >
          {done ? "✓" : step}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          {hint && !open && (
            <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
          )}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open && <div className="border-t border-white/50 px-4 pb-5 pt-1 sm:px-5">{children}</div>}
    </div>
  );
}
