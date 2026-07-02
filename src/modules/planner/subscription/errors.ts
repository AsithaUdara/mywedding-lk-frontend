export class PlannerSubscriptionLimitError extends Error {
  readonly code = "PLANNER_SUBSCRIPTION_LIMIT";

  constructor(message: string) {
    super(message);
    this.name = "PlannerSubscriptionLimitError";
  }
}

export function isPlannerSubscriptionLimitError(err: unknown): err is PlannerSubscriptionLimitError {
  return err instanceof PlannerSubscriptionLimitError;
}

export function parsePlannerApiError(body: Record<string, unknown>): PlannerSubscriptionLimitError | null {
  const errors = (body.errors ?? body.Errors) as Record<string, string[] | string> | undefined;
  if (!errors) {
    const message = String(body.message ?? body.detail ?? body.title ?? "");
    if (message.toLowerCase().includes("subscription") || message.toLowerCase().includes("upgrade")) {
      return new PlannerSubscriptionLimitError(message);
    }
    return null;
  }

  const codes = errors.code ?? errors.Code;
  const subscription = errors.subscription ?? errors.Subscription;
  const codeList = Array.isArray(codes) ? codes : codes ? [String(codes)] : [];
  const subList = Array.isArray(subscription)
    ? subscription
    : subscription
      ? [String(subscription)]
      : [];

  if (
    codeList.some((c) => c === "PLANNER_SUBSCRIPTION_LIMIT") ||
    subList.length > 0
  ) {
    return new PlannerSubscriptionLimitError(
      subList[0] ?? "Upgrade to Planner Pro to add more weddings."
    );
  }

  return null;
}
