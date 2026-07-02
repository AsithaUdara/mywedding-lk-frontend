"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export type SetupStep = 1 | 2 | 3;

const STEPS: { id: SetupStep; label: string }[] = [
  { id: 1, label: "Starter tasks" },
  { id: 2, label: "Couple brief" },
  { id: 3, label: "Full checklist" },
];

type Props = {
  currentStep: SetupStep;
  briefComplete?: boolean;
  checklistDone?: boolean;
  children: React.ReactNode;
};

export function PlannerSetupFlow({ currentStep, briefComplete, checklistDone, children }: Props) {
  return (
    <div className="space-y-6">
      <nav aria-label="Setup progress" className="rounded-xl border border-border/60 bg-white/50 px-4 py-4">
        <div className="relative">
          <div
            className="pointer-events-none absolute left-[calc(16.67%-14px)] right-[calc(16.67%-14px)] top-[14px] hidden h-px bg-border sm:block"
            aria-hidden
          />
          <ol className="relative grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isDone =
                (step.id === 1 && currentStep > 1) ||
                (step.id === 2 && briefComplete) ||
                (step.id === 3 && checklistDone);
              const isPast = step.id < currentStep;

              return (
                <li key={step.id} className="flex min-w-0 items-center justify-start gap-2">
                  <span
                    className={cn(
                      "flex min-w-0 items-center gap-2 rounded-lg px-2 py-1 text-sm",
                      isActive && "bg-primary/10 font-semibold text-primary",
                      !isActive && !isDone && !isPast && "text-muted-foreground",
                      (isDone || isPast) && !isActive && "text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isActive && "bg-primary text-primary-foreground",
                        isDone && !isActive && "bg-emerald-600 text-white",
                        !isActive && !isDone && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isDone && !isActive ? (
                        <CheckCircle2 size={14} aria-hidden />
                      ) : (
                        step.id
                      )}
                    </span>
                    <span className="truncate">{step.label}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Step {currentStep} of 3 — complete each step before moving on.
        </p>
      </nav>

      {children}
    </div>
  );
}
