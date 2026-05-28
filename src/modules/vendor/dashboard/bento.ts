/** Luxury SaaS design tokens for vendor workspace dashboards */
export const bento = {
  page: "space-y-8 lg:space-y-10",
  card:
    "rounded-[2rem] border border-white/20 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 sm:p-8",
  cardCompact:
    "rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-primary/10 sm:p-8",
  glassPanel:
    "rounded-[2rem] border border-white/20 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out",
  label: "text-xs font-semibold uppercase tracking-[0.14em] text-slate-500",
  title: "font-playfair text-2xl font-bold tracking-tight text-charcoal sm:text-3xl",
  sectionTitle: "font-playfair text-xl font-bold tracking-tight text-charcoal",
  subtitle: "text-sm leading-relaxed text-slate-500 sm:text-base",
  pillBtn:
    "inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-neutral-900 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30",
  pillBtnOutline:
    "inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-slate-300 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/50",
  iconWrap: (color: string) =>
    `flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${color}`,
} as const;
