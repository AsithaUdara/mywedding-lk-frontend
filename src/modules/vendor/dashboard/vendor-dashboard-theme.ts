/** @deprecated Use `rf` from `@/modules/design-system/regal-frost` */
import { rf } from "@/modules/design-system/regal-frost/tokens";

export const vd = {
  card: rf.panel,
  cardPad: `${rf.panel} p-5 sm:p-6`,
  cardCompact: `${rf.glass} rounded-2xl p-4`,
  label: rf.label,
  title: rf.heroTitle,
  subtitle: rf.subtitle,
  metaBox: `${rf.glassSubtle} rounded-2xl px-4 py-3`,
  messageBox: `${rf.glassSubtle} whitespace-pre-wrap rounded-2xl p-5 text-sm leading-relaxed text-foreground`,
  listDivide: "divide-y divide-border/60",
  rowHover: "transition hover:bg-white/50",
  rowActive: "bg-primary/5",
  iconPlanner: rf.iconPrimary,
  iconClient: "bg-[hsl(42_48%_52%/0.15)] text-[hsl(42_35%_38%)]",
  badgePlanner:
    "rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary",
  badgeClient:
    "rounded-full bg-[hsl(42_48%_52%/0.15)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(42_35%_38%)]",
  badgeNew: "rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary",
  successBanner: "rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success",
  input:
    "w-full resize-none rounded-2xl border border-border/80 bg-white/60 px-4 py-3 text-sm text-foreground outline-none backdrop-blur-sm placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
  navBtn: rf.navBtn,
} as const;

export { glassCalendarDayClass as calendarDayClass } from "@/modules/design-system/regal-frost/tokens";
