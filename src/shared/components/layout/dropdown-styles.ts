import { cn } from "@/shared/lib/cn";

/** Shared flyout panel — Stripe / Linear-style */
export const dropdownPanelClass = cn(
  "z-[60] overflow-hidden rounded-2xl border border-border/80 bg-white",
  "p-1.5 shadow-xl shadow-black/[0.08] ring-1 ring-black/[0.04]",
  "focus:outline-none",
  "transition duration-200 ease-out",
  "data-closed:scale-[0.98] data-closed:opacity-0",
  "origin-top"
);

export const dropdownItemClass = cn(
  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground",
  "transition-colors duration-150",
  "hover:bg-muted focus:outline-none focus-visible:bg-muted",
  "data-[focus]:bg-muted"
);

export const dropdownIconWrapClass = cn(
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
  "bg-primary/8 text-primary transition-colors duration-150",
  "group-hover:bg-primary/12 group-data-[focus]:bg-primary/12"
);

export const navTriggerClass = cn(
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/90",
  "transition-colors duration-150",
  "hover:bg-muted/80 hover:text-foreground",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "data-[open]:bg-muted data-[open]:text-primary"
);
