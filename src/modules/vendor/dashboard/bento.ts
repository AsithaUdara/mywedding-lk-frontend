/** Bento-box design tokens — aligned with 14_Design_System_and_Tailwind_Config.md */
export const bento = {
  page: "space-y-6",
  card: "rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
  cardCompact: "rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
  label: "text-xs font-semibold uppercase tracking-[0.14em] text-slate-400",
  title: "text-2xl font-bold tracking-tight text-slate-900",
  subtitle: "text-sm text-slate-500",
  pillBtn:
    "inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black",
  pillBtnOutline:
    "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300",
  iconWrap: (color: string) =>
    `flex h-10 w-10 items-center justify-center rounded-full ${color}`,
} as const;
