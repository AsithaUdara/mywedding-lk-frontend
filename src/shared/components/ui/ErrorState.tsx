"use client";

import React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "./Button";

export function ErrorBanner({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive",
        className
      )}
    >
      <AlertCircle size={18} className="flex-shrink-0" aria-hidden />
      {message}
    </div>
  );
}

export function SuccessBanner({ message, className }: { message: string; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl border border-success/25 bg-success/10 p-4 text-sm font-medium text-success",
        className
      )}
    >
      {message}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-destructive/20 bg-card px-6 py-12 text-center">
      <ShieldAlert size={40} className="mx-auto text-destructive/70" aria-hidden />
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
      {onRetry && (
        <div className="mt-6">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

/** Inline loading with label — prefer PageLoadingSkeleton for full pages */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
