/** Royal Kandyan tokens for couple-facing vendor pages */
export const pv = {
  page: "bg-background font-roboto text-foreground",
  card: "rounded-3xl border border-border bg-card shadow-sm",
  cardPad: "rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6",
  sectionTitle: "text-xl font-semibold text-foreground",
  sectionDivide: "border-b border-border pb-10",
  muted: "text-muted-foreground",
  label: "text-[11px] font-bold uppercase tracking-widest text-muted-foreground",
  chip: "inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground",
  linkBtn:
    "inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary",
  primaryBtn:
    "rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
  outlineBtn:
    "rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/5",
  modalOverlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm",
  modalPanel:
    "relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8",
} as const;
