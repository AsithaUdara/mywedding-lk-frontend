import { cn } from "@/shared/lib/cn";

/** Royal Kandyan glass panel for planner AI tools */
export const glassCardClass = cn(
  "rounded-3xl border border-border/80 bg-card/75 p-6 shadow-lg shadow-primary/5 backdrop-blur-xl md:p-8"
);

export function priorityBadgeClass(priority: string): string {
  const p = priority.toLowerCase();
  if (p === "high") return "bg-primary/10 text-primary";
  if (p === "low") return "bg-muted text-muted-foreground";
  return "bg-accent/15 text-accent-foreground";
}
