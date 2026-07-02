/** Semantic lifecycle / workflow badge styles — palette-derived, WCAG-friendly pairs. */
export const STATUS_BADGE_STYLES: Record<string, string> = {
  Active: "bg-primary/10 text-primary border border-primary/20",
  OnHold: "bg-warning/15 text-warning border border-warning/25",
  Completed: "bg-muted text-muted-foreground border border-border",
  ToDo: "bg-warning/15 text-warning border border-warning/25",
  Archived: "bg-muted/60 text-muted-foreground border border-border",
  Pending: "bg-warning/15 text-warning border border-warning/25",
  Approved: "bg-primary/10 text-primary border border-primary/20",
  Rejected: "bg-destructive/10 text-destructive border border-destructive/20",
  Paid: "bg-accent/20 text-[hsl(42_40%_32%)] border border-accent/40",
  Draft: "bg-muted text-muted-foreground border border-border",
  Confirmed: "bg-success/10 text-success border border-success/25",
  Cancelled: "bg-destructive/10 text-destructive border border-destructive/20",
  Requested: "bg-warning/15 text-warning border border-warning/25",
  AwaitingPayment: "bg-accent/20 text-[hsl(42_40%_32%)] border border-accent/40",
  ContractSigned: "bg-primary/10 text-primary border border-primary/20",
};

export type StatusKey = keyof typeof STATUS_BADGE_STYLES;

export function getStatusBadgeClass(status: string): string {
  return (
    STATUS_BADGE_STYLES[status] ??
    "bg-muted text-muted-foreground border border-border"
  );
}
