"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, LucideIcon, MoreHorizontal, Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function StatusBadge({
  active,
  label,
}: {
  active: boolean;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        active
          ? "bg-success/10 text-success ring-1 ring-success/20"
          : "bg-white/50 text-muted-foreground ring-1 ring-white/60"
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-success" : "bg-muted-foreground/50")}
        aria-hidden
      />
      {label ?? (active ? "Published" : "Draft")}
    </span>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  id: idProp,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  id?: string;
  "aria-label": string;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-card shadow-sm ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  onClick,
  href,
  variant = "default",
  disabled,
  glass,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "danger";
  disabled?: boolean;
  glass?: boolean;
}) {
  const className = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    glass
      ? variant === "danger"
        ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        : "text-muted-foreground hover:bg-white/70 hover:text-primary"
      : cn(
          "border",
          variant === "danger"
            ? "border-transparent text-muted-foreground hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        )
  );

  if (href) {
    return (
      <Link href={href} className={className} title={label} aria-label={label}>
        <Icon size={16} strokeWidth={2} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      title={label}
      aria-label={label}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
}

export type RowAction = {
  key: string;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

export function RowActionsMenu({ actions, glass }: { actions: RowAction[]; glass?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          glass
            ? "text-muted-foreground hover:bg-white/70 hover:text-primary"
            : "border border-border bg-card text-muted-foreground hover:bg-muted"
        )}
        aria-label="More actions"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 z-20 mt-1 min-w-[180px] overflow-hidden rounded-2xl py-1 shadow-lg",
            glass
              ? "rf-glass-panel vgo-glass-panel border border-white/50"
              : "border border-border bg-card"
          )}
        >
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              role="menuitem"
              disabled={action.disabled}
              onClick={() => {
                setOpen(false);
                action.onClick();
              }}
              className={cn(
                "flex w-full px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                action.destructive
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  className,
  glass,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  glass?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={18}
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-full border py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground",
          glass
            ? "vgo-search"
            : "border-border bg-muted/40 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
        )}
      />
    </div>
  );
}

export function TableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
  );
}

export function Th({
  children,
  align = "left",
  glass,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  glass?: boolean;
}) {
  return (
    <th
      className={cn(
        "border-b px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
        glass ? "border-white/40 bg-white/30" : "border-border bg-muted/40",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className = "",
  glass,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  glass?: boolean;
}) {
  return (
    <td
      className={cn(
        "border-b px-4 py-4 align-middle",
        glass ? "border-white/30" : "border-border",
        align === "right" ? "text-right" : "text-left",
        className
      )}
    >
      {children}
    </td>
  );
}

export function InlineSpinner() {
  return <Loader2 size={16} className="animate-spin text-primary" aria-hidden />;
}
