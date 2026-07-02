"use client";

import { Building2, UserCircle2 } from "lucide-react";
import type { VendorInquiryItem } from "@/shared/lib/api/vendors";
import { formatInquiryTimestamp } from "@/modules/vendor/dashboard/vendorInquiryHelpers";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

export function VendorInquiryAvatar({ inquiry }: { inquiry: VendorInquiryItem }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        inquiry.from === "planner" ? vd.iconPlanner : vd.iconClient
      )}
    >
      {inquiry.from === "planner" ? (
        <Building2 size={18} aria-hidden />
      ) : (
        <UserCircle2 size={18} aria-hidden />
      )}
    </div>
  );
}

export function VendorInquiryListItem({
  inquiry,
  selected,
  onSelect,
}: {
  inquiry: VendorInquiryItem;
  selected: boolean;
  onSelect: (inquiry: VendorInquiryItem) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(inquiry)}
      className={cn(
        "w-full px-4 py-4 text-left transition-colors duration-200 sm:px-5",
        selected
          ? "bg-primary/10 ring-1 ring-inset ring-primary/20"
          : "hover:bg-white/50"
      )}
    >
      <div className="flex items-start gap-3">
        <VendorInquiryAvatar inquiry={inquiry} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("truncate font-medium", vg.body)}>{inquiry.senderName}</p>
            {!inquiry.isRead ? <span className={vd.badgeNew}>New</span> : null}
          </div>
          <p className={cn("mt-0.5 truncate", vg.subtitle)}>
            {inquiry.subject ?? inquiry.message}
          </p>
          <div className={cn("mt-1.5 flex flex-wrap items-center gap-2", vg.caption)}>
            <span>{inquiry.from === "planner" ? "Planner" : "Client"}</span>
            {inquiry.eventName ? <span className="truncate">· {inquiry.eventName}</span> : null}
            <span>· {formatInquiryTimestamp(inquiry.sentAt)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
