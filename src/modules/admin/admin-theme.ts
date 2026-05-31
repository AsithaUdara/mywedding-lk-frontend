/** @deprecated Use `rf` from `@/modules/design-system/regal-frost` */
import { rf } from "@/modules/design-system/regal-frost/tokens";

export const ad = {
  card: rf.panel,
  panel: `${rf.panel} overflow-hidden p-0`,
  panelHeader: rf.panelHeader,
  label: rf.label,
  title: rf.sectionTitle,
  subtitle: rf.subtitle,
  tableShell: `${rf.glassSubtle} overflow-hidden rounded-2xl`,
  table: "w-full min-w-[960px] border-collapse text-left text-sm text-foreground",
  th: "border-b border-border/60 bg-white/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
  td: "border-b border-border/60 px-5 py-4 align-top transition-colors hover:bg-white/40",
  rowHover: "transition-colors hover:bg-white/40",
  chartBar:
    "w-full rounded-t-xl bg-gradient-to-t from-primary to-primary/50 transition-all group-hover:from-primary group-hover:to-accent",
  deltaUp: "rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success",
  deltaDown: "rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive",
  notice: "border-b border-warning/20 bg-warning/10 px-6 py-3 text-sm text-warning sm:px-8",
  demoBanner: "border-b border-border/60 bg-white/40 px-6 py-2.5 text-sm text-muted-foreground sm:px-8",
} as const;
