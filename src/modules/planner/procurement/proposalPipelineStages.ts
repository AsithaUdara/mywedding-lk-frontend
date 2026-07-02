import type { VendorShortlistItem } from "@/shared/lib/api/vendorShortlist";

export type PipelineStageId = "draft" | "client" | "booking" | "confirmed" | "closed";

export type PipelineFilter = "all" | PipelineStageId;

export const PIPELINE_STEPS: {
  id: PipelineStageId;
  label: string;
  description: string;
}[] = [
  { id: "draft", label: "Draft", description: "Not sent yet" },
  { id: "client", label: "With client", description: "Awaiting approval" },
  { id: "booking", label: "Booking", description: "Vendor & contract" },
  { id: "confirmed", label: "Confirmed", description: "Deposit paid" },
];

export function pipelineStageForItem(item: VendorShortlistItem): PipelineStageId {
  switch (item.status) {
    case "Draft":
      return "draft";
    case "SentToClient":
    case "ClientRejected":
      return "client";
    case "ClientApproved":
    case "BookingRequested":
    case "BookingAccepted":
    case "ContractSigned":
      return "booking";
    case "DepositPaid":
      return "confirmed";
    case "Declined":
      return "closed";
    default:
      return "booking";
  }
}

export function countByPipelineStage(items: VendorShortlistItem[]): Record<PipelineStageId, number> {
  const counts: Record<PipelineStageId, number> = {
    draft: 0,
    client: 0,
    booking: 0,
    confirmed: 0,
    closed: 0,
  };
  for (const item of items) {
    counts[pipelineStageForItem(item)] += 1;
  }
  return counts;
}

export function filterByPipeline(items: VendorShortlistItem[], filter: PipelineFilter): VendorShortlistItem[] {
  if (filter === "all") return items;
  if (filter === "closed") {
    return items.filter((item) => pipelineStageForItem(item) === "closed");
  }
  return items.filter((item) => pipelineStageForItem(item) === filter);
}

export function groupByPipelineStage(
  items: VendorShortlistItem[]
): Map<PipelineStageId, VendorShortlistItem[]> {
  const groups = new Map<PipelineStageId, VendorShortlistItem[]>(
    PIPELINE_STEPS.map((step) => [step.id, [] as VendorShortlistItem[]])
  );
  groups.set("closed", []);

  for (const item of items) {
    const stage = pipelineStageForItem(item);
    groups.get(stage)!.push(item);
  }

  return groups;
}

export function formatProposalKey(id: string): string {
  return `PRP-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}
