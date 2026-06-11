/**
 * Regal Frost — system-wide design tokens.
 * Porcelain · Maroon · Antique Gold
 */
export const REGAL_FROST_COLORS = {
  porcelain: "#EEF0F4",
  maroon: "#800020",
  gold: "#B8956B",
} as const;

export const rf = {
  shell: "regal-frost-shell vgo-flex-shell",
  shellMarketing: "regal-frost-shell marketing-page",

  glass: "rf-glass-panel vgo-glass-panel",
  glassSubtle: "rf-glass-subtle vgo-glass-subtle",

  panel: "rf-glass-panel vgo-glass-panel rounded-2xl",
  panelHeader: "border-b border-white/40 px-5 py-4 sm:px-6",
  panelBody: "p-5 sm:p-6",

  statCard:
    "rf-glass-panel vgo-glass-panel flex items-center gap-4 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:border-[hsl(42_48%_52%/0.35)] hover:shadow-[0_8px_32px_hsl(345_100%_25%/0.12)]",

  quickLink:
    "rf-glass-panel vgo-glass-panel group flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200 hover:border-[hsl(42_48%_52%/0.3)] hover:bg-white/70 hover:shadow-[0_6px_24px_hsl(345_100%_25%/0.1)]",

  quickLinkIcon:
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15 transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary/30",

  badge:
    "rf-glass-subtle vgo-glass-subtle inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground",

  storefrontPill: "rf-glass-panel vgo-glass-panel flex items-center gap-3 rounded-xl px-3.5 py-2.5",

  btnGhost:
    "font-glass-body rf-glass-subtle vgo-glass-subtle inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:bg-white/70 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none",

  btnPrimary:
    "font-glass-body inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-[0_4px_16px_hsl(345_100%_25%/0.25)] transition-all duration-200 hover:opacity-90 hover:shadow-[0_6px_20px_hsl(345_100%_25%/0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50 disabled:hover:shadow-[0_4px_16px_hsl(345_100%_25%/0.25)]",

  btnGold:
    "font-glass-body inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(42_48%_52%)] px-6 py-3 text-sm font-medium text-white shadow-[0_4px_16px_hsl(42_48%_52%/0.35)] transition-opacity hover:opacity-90",

  body: "font-glass-body text-sm leading-relaxed text-foreground",
  subtitle: "font-glass-body text-sm leading-relaxed text-muted-foreground",
  caption: "font-glass-body text-xs leading-relaxed text-muted-foreground",
  linkLabel: "font-glass-body text-sm font-medium text-foreground",
  statValue: "font-glass-body text-2xl font-semibold tabular-nums tracking-tight text-primary",
  chartTitle: "font-glass-body text-sm font-semibold text-foreground",
  label: "font-glass-body text-[11px] font-medium uppercase tracking-wide text-muted-foreground",

  heroTitle:
    "font-glass-body text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
  sectionTitle:
    "font-glass-body text-lg font-semibold leading-tight tracking-tight text-foreground sm:text-xl",
  /** In-card / panel headings inside dashboards */
  panelTitle:
    "font-glass-body text-base font-semibold leading-tight tracking-tight text-foreground sm:text-lg",

  /** Marketing section layout */
  section: "py-16 md:py-24",
  sectionAlt: "mk-section-alt py-16 md:py-24",
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  eyebrow: "font-glass-body text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
  sectionSubtitle: "font-glass-body mt-4 text-base leading-relaxed text-muted-foreground md:text-lg",
  marketingSectionTitle:
    "font-playfair mt-3 text-3xl font-normal leading-tight tracking-tight text-foreground md:text-4xl",
  card: "mk-glass-panel rf-glass-panel vgo-glass-panel rounded-2xl p-6 transition-all duration-200 hover:border-[hsl(42_48%_52%/0.25)] hover:shadow-[0_8px_32px_hsl(345_100%_25%/0.08)] md:p-8",
  marketingStatValue: "font-glass-body text-3xl font-semibold tabular-nums text-primary",
  iconWrap:
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10",
  iconWrapLg:
    "flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10",

  iconPrimary: "bg-primary/10 text-primary ring-1 ring-primary/10",
  iconAccent: "bg-white/50 text-foreground ring-1 ring-white/60",
  iconSuccess: "bg-success/10 text-success ring-1 ring-success/15",

  inboxCard: "rf-glass-subtle vgo-glass-subtle overflow-hidden rounded-xl",
  navBtn:
    "rf-glass-subtle vgo-glass-subtle flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-white/70 hover:text-primary",

  chartCard: "rf-glass-panel vgo-glass-panel rounded-2xl p-5 sm:p-6",
  donutCenter:
    "absolute inset-2 flex flex-col items-center justify-center rounded-full bg-white/70 backdrop-blur-sm ring-1 ring-white/60",
} as const;

export const glassCalendarDayClass = {
  booked: "border-success/30 bg-success/10 text-success cursor-default backdrop-blur-sm",
  blocked: "border-primary bg-primary text-primary-foreground cursor-pointer shadow-sm",
  available:
    "border-white/50 bg-white/40 text-foreground backdrop-blur-sm hover:border-primary/30 hover:bg-white/60 cursor-pointer",
  outside: "border-transparent bg-transparent text-muted-foreground/30",
} as const;
