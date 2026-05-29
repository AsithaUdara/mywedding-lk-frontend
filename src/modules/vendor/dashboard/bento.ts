/**
 * @deprecated Use `vd` from `vendor-dashboard-theme.ts` instead.
 * Kept as a thin alias for any legacy imports.
 */
import { vd } from "./vendor-dashboard-theme";

export const bento = {
  page: "space-y-8 lg:space-y-10",
  card: vd.cardPad,
  cardCompact: vd.cardCompact,
  glassPanel: vd.card,
  label: vd.label,
  title: `font-playfair ${vd.title}`,
  sectionTitle: `font-playfair text-xl font-bold tracking-tight text-foreground`,
  subtitle: vd.subtitle,
  pillBtn:
    "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  pillBtnOutline:
    "inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-300 hover:border-primary/30 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  iconWrap: (color: string) =>
    `flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${color}`,
} as const;
