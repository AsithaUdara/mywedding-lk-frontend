export function formatVendorResultsCount(count: number, loading = false): string {
  if (loading) return "Searching for vendors…";
  if (count === 1) return "1 vendor found";
  return `${count} vendors found`;
}
