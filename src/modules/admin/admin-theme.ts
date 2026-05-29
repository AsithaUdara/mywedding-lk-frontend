/** Royal Kandyan tokens for admin operations UI */
export const ad = {
  card: "rounded-3xl border border-border bg-card shadow-sm",
  panel: "overflow-hidden rounded-3xl border border-border bg-card shadow-sm",
  panelHeader: "border-b border-border px-6 py-5 sm:px-8",
  label: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
  title: "font-playfair text-xl font-bold tracking-tight text-foreground sm:text-2xl",
  subtitle: "mt-1 text-sm text-muted-foreground",
  tableShell: "overflow-hidden rounded-2xl border border-border bg-muted/20",
  table: "w-full min-w-[960px] border-collapse text-left text-sm text-foreground",
  th: "border-b border-border bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
  td: "border-b border-border/60 px-5 py-4 align-top transition-colors hover:bg-muted/30",
  rowHover: "transition-colors hover:bg-muted/30",
  chartBar:
    "w-full rounded-t-xl bg-gradient-to-t from-primary to-primary/50 transition-all group-hover:from-primary group-hover:to-accent",
  deltaUp: "rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success",
  deltaDown: "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive",
  notice: "border-b border-warning/20 bg-warning/10 px-6 py-3 text-sm text-warning sm:px-8",
  demoBanner: "border-b border-border bg-muted/40 px-6 py-2.5 text-sm text-muted-foreground sm:px-8",
} as const;
