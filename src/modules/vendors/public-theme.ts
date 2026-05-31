/** @deprecated Use `rf` from `@/modules/design-system/regal-frost` */
import { rf } from "@/modules/design-system/regal-frost/tokens";

export const pv = {
  page: "regal-frost-shell min-h-screen bg-background font-glass-body text-foreground",
  card: rf.panel,
  cardPad: `${rf.panel} p-5 sm:p-6`,
  sectionTitle: rf.sectionTitle,
  sectionDivide: "border-b border-border/60 pb-10",
  muted: "text-muted-foreground",
  label: rf.label,
  chip: `${rf.glassSubtle} inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm text-muted-foreground`,
  linkBtn: rf.btnGhost,
  primaryBtn: rf.btnPrimary,
  outlineBtn: rf.btnGhost,
  modalOverlay:
    "fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm",
  modalPanel: `${rf.panel} relative w-full max-w-lg p-6 shadow-2xl sm:p-8`,
} as const;
