/** @deprecated Use `rf` from `@/modules/design-system/regal-frost` */
import { rf, REGAL_FROST_COLORS } from "@/modules/design-system/regal-frost/tokens";

export const mk = {
  shell: "regal-frost-shell marketing-page",
  glass: rf.glass,
  glassSubtle: rf.glassSubtle,
  section: rf.section,
  sectionAlt: rf.sectionAlt,
  container: rf.container,
  eyebrow: rf.eyebrow,
  sectionTitle: rf.marketingSectionTitle,
  sectionSubtitle: rf.sectionSubtitle,
  body: rf.subtitle,
  card: rf.card,
  statValue: rf.marketingStatValue,
  iconWrap: rf.iconWrap,
  iconWrapLg: rf.iconWrapLg,
  btnPrimary: rf.btnPrimary,
  btnGold: rf.btnGold,
  btnGhost:
    "font-glass-body inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white/60 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-white/80",
} as const;

export const MARKETING_COLORS = REGAL_FROST_COLORS;
