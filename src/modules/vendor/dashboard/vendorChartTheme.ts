export const VENDOR_CHART = {
  width: 1000,
  height: 300,
  marginLeft: 64,
  marginRight: 28,
  marginTop: 28,
  marginBottom: 52,
} as const;

export const STATUS_CHART_COLORS: Record<string, string> = {
  Requested: "hsl(42 48% 52%)",
  AwaitingPayment: "hsl(38 70% 50%)",
  ContractSigned: "hsl(345 60% 40%)",
  Confirmed: "hsl(345 100% 25%)",
  Completed: "hsl(152 45% 38%)",
  Cancelled: "hsl(345 8% 55%)",
};

export const FUNNEL_COLORS = {
  won: { fill: "hsl(345 100% 25%)", label: "Won" },
  pending: { fill: "hsl(42 48% 52%)", label: "In progress" },
  lost: { fill: "hsl(345 12% 72%)", label: "Lost" },
} as const;

export const CHART_AXIS = "hsl(345 18% 62%)";
export const CHART_TICK = "hsl(345 12% 42%)";
export const CHART_GRID = "hsl(345 18% 62%)";
