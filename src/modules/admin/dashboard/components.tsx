"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";

export function ApproveButton({
  onClick,
  loading,
  disabled,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "font-glass-body inline-flex items-center justify-center gap-1.5 rounded-xl bg-success px-3 py-1.5 text-xs font-medium text-success-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
      )}
    >
      {loading ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
      Approve
    </button>
  );
}

export function RejectButton({
  onClick,
  loading,
  disabled,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <GlassButton
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled || loading}
      className="text-destructive hover:bg-destructive/10"
    >
      {loading ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
      Reject
    </GlassButton>
  );
}

export function PrimaryButton({
  children,
  onClick,
  loading,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <GlassButton type="button" variant="primary" onClick={onClick} disabled={disabled || loading}>
      {loading && <Loader2 size={14} className="animate-spin" aria-hidden />}
      {children}
    </GlassButton>
  );
}
