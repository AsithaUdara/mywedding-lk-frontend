/** @deprecated Use `rf` from `@/modules/design-system/regal-frost` */
import { rf } from "@/modules/design-system/regal-frost/tokens";

export const cp = {
  page: "regal-frost-shell min-h-screen bg-background font-glass-body text-foreground",
  card: rf.panel,
  cardPad: `${rf.panel} p-5 sm:p-6`,
  panel: `${rf.panel} p-6 sm:p-8`,
  label: rf.label,
  muted: "text-muted-foreground",
  sectionTitle: rf.sectionTitle,
} as const;
