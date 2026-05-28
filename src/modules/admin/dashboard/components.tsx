"use client";

import React from "react";
import { Loader2 } from "lucide-react";

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
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-emerald-800/90 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-emerald-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-rose-200/80 bg-white px-4 text-sm font-semibold text-rose-800/90 shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-rose-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
      Reject
    </button>
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-charcoal px-4 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-neutral-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
