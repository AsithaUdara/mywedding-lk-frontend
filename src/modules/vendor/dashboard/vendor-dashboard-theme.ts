/** Royal Kandyan tokens for vendor dashboard modules — no slate/indigo bento glass */
export const vd = {
  card: "rounded-3xl border border-border bg-card shadow-sm",
  cardPad: "rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6",
  cardCompact: "rounded-2xl border border-border bg-card p-4 shadow-sm",
  label: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
  title: "text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
  subtitle: "text-sm leading-relaxed text-muted-foreground sm:text-base",
  metaBox: "rounded-2xl border border-border bg-muted/40 px-4 py-3",
  messageBox:
    "whitespace-pre-wrap rounded-2xl border border-border bg-muted/30 p-5 text-sm leading-relaxed text-foreground",
  listDivide: "divide-y divide-border",
  rowHover: "transition hover:bg-muted/50",
  rowActive: "bg-primary/5",
  iconPlanner: "bg-primary/10 text-primary",
  iconClient: "bg-accent/15 text-accent",
  badgePlanner: "rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary",
  badgeClient: "rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent",
  badgeNew: "rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary",
  successBanner: "rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success",
  input:
    "w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
  navBtn:
    "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:bg-muted hover:text-foreground",
} as const;

export const calendarDayClass = {
  booked: "border-success/40 bg-success/15 text-success cursor-default",
  blocked: "border-primary bg-primary text-primary-foreground cursor-pointer",
  available:
    "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/40",
  outside: "border-transparent bg-transparent text-muted-foreground/40",
} as const;
