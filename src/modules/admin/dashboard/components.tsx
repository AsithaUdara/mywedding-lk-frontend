"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui";
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
    <Button
      type="button"
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "bg-success text-primary-foreground hover:opacity-90",
        "shadow-sm shadow-success/20"
      )}
    >
      {loading ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
      Approve
    </Button>
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
    <Button type="button" variant="danger" size="sm" onClick={onClick} disabled={disabled || loading}>
      {loading ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
      Reject
    </Button>
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
    <Button type="button" variant="primary" size="sm" onClick={onClick} disabled={disabled || loading}>
      {loading && <Loader2 size={14} className="animate-spin" aria-hidden />}
      {children}
    </Button>
  );
}
