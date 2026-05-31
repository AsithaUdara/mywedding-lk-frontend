import { cn } from "@/shared/lib/cn";

export function priorityBadgeClass(priority: string): string {
  const p = priority.toLowerCase();
  if (p === "high") return "bg-primary/10 text-primary ring-primary/15";
  if (p === "low") return "bg-white/50 text-muted-foreground ring-white/60";
  return "bg-warning/10 text-warning ring-warning/15";
}

/** @deprecated Use GlassSectionCard from glass-ui */
export const glassCardClass = cn(
  "rf-glass-panel vgo-glass-panel rounded-2xl p-6 md:p-8"
);
