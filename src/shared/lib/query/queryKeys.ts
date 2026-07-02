export const queryKeys = {
  planner: {
    all: ["planner"] as const,
    dashboard: () => [...queryKeys.planner.all, "dashboard"] as const,
    overview: () => [...queryKeys.planner.all, "overview"] as const,
    events: (status?: string) =>
      [...queryKeys.planner.all, "events", status ?? "all"] as const,
    clients: () => [...queryKeys.planner.all, "clients"] as const,
    bookings: () => [...queryKeys.planner.all, "bookings"] as const,
    taskTemplates: () => [...queryKeys.planner.all, "task-templates"] as const,
    eventInsights: (eventId: string) =>
      [...queryKeys.planner.all, "event-insights", eventId] as const,
  },
  events: {
    all: ["events"] as const,
    list: () => [...queryKeys.events.all, "list"] as const,
    detail: (eventId: string) => [...queryKeys.events.all, "detail", eventId] as const,
    tasks: (eventId: string) => [...queryKeys.events.all, eventId, "tasks"] as const,
    brief: (eventId: string) => [...queryKeys.events.all, eventId, "brief"] as const,
    shortlist: (eventId: string) => [...queryKeys.events.all, eventId, "shortlist"] as const,
    budget: (eventId: string) => [...queryKeys.events.all, eventId, "budget"] as const,
    expenses: (eventId: string) => [...queryKeys.events.all, eventId, "expenses"] as const,
  },
  admin: {
    all: ["admin"] as const,
    payoutDue: () => [...queryKeys.admin.all, "payout-due"] as const,
    platformAnalytics: () => [...queryKeys.admin.all, "platform-analytics"] as const,
  },
  vendor: {
    all: ["vendor"] as const,
    bookings: () => [...queryKeys.vendor.all, "bookings"] as const,
    services: () => [...queryKeys.vendor.all, "services"] as const,
    profile: () => [...queryKeys.vendor.all, "profile"] as const,
    subscription: () => [...queryKeys.vendor.all, "subscription"] as const,
    billingProfile: () => [...queryKeys.vendor.all, "billing-profile"] as const,
    analytics: () => [...queryKeys.vendor.all, "analytics"] as const,
    inquiries: () => [...queryKeys.vendor.all, "inquiries"] as const,
    availability: (month: string) => [...queryKeys.vendor.all, "availability", month] as const,
    profileViews: (weeks: number) => [...queryKeys.vendor.all, "profile-views", weeks] as const,
    inquiryTrend: (months: number) => [...queryKeys.vendor.all, "inquiry-trend", months] as const,
    winRate: () => [...queryKeys.vendor.all, "win-rate"] as const,
  },
} as const;
