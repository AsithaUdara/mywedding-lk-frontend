import type { VendorInquiryItem } from "@/shared/lib/api/vendors";

export type InboxFilter = "all" | "unread" | "planner" | "client";

export const INBOX_FILTERS: { value: InboxFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "planner", label: "Planners" },
  { value: "client", label: "Clients" },
];

export type InquiryInboxStats = {
  total: number;
  unread: number;
  planner: number;
  client: number;
};

export function computeInquiryStats(inquiries: VendorInquiryItem[]): InquiryInboxStats {
  return inquiries.reduce(
    (acc, inquiry) => {
      if (!inquiry.isRead) acc.unread += 1;
      if (inquiry.from === "planner") acc.planner += 1;
      else acc.client += 1;
      return acc;
    },
    { total: inquiries.length, unread: 0, planner: 0, client: 0 }
  );
}

export function sortInquiriesByRecent(inquiries: VendorInquiryItem[]): VendorInquiryItem[] {
  return [...inquiries].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
}

export function filterInquiries(
  inquiries: VendorInquiryItem[],
  filter: InboxFilter,
  searchQuery: string
): VendorInquiryItem[] {
  let list = [...inquiries];
  const query = searchQuery.trim().toLowerCase();

  if (filter === "unread") list = list.filter((inquiry) => !inquiry.isRead);
  else if (filter === "planner") list = list.filter((inquiry) => inquiry.from === "planner");
  else if (filter === "client") list = list.filter((inquiry) => inquiry.from === "client");

  if (query) {
    list = list.filter(
      (inquiry) =>
        inquiry.senderName.toLowerCase().includes(query) ||
        inquiry.senderOrg.toLowerCase().includes(query) ||
        (inquiry.subject?.toLowerCase().includes(query) ?? false) ||
        inquiry.message.toLowerCase().includes(query) ||
        (inquiry.eventName?.toLowerCase().includes(query) ?? false)
    );
  }

  return sortInquiriesByRecent(list);
}

export function findFirstUnread(inquiries: VendorInquiryItem[]): VendorInquiryItem | null {
  return sortInquiriesByRecent(inquiries).find((inquiry) => !inquiry.isRead) ?? null;
}

export function resolveSelectedInquiry(
  inquiries: VendorInquiryItem[],
  filtered: VendorInquiryItem[],
  selectedId: string
): VendorInquiryItem | null {
  if (selectedId) {
    const fromFiltered = filtered.find((inquiry) => inquiry.id === selectedId);
    if (fromFiltered) return fromFiltered;
    const fromAll = inquiries.find((inquiry) => inquiry.id === selectedId);
    if (fromAll) return fromAll;
  }
  return filtered[0] ?? null;
}

export function formatInquiryTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function formatInquiryDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
