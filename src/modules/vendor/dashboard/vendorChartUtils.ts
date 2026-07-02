export function seriesHasPositiveValues(values: number[]): boolean {
  return values.some((value) => value > 0);
}

export function filterPositiveEarnings<T extends { amount: number }>(rows: T[]): T[] {
  return rows.filter((row) => row.amount > 0);
}

export function computeChartYMax(peak: number): number {
  if (peak <= 0) return 1;
  return Math.max(Math.ceil(peak * 1.15), peak + 1);
}
