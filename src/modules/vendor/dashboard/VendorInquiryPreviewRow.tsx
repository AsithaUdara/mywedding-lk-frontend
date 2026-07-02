"use client";

import Link from "next/link";
import { ArrowRight, Building2, UserCircle2 } from "lucide-react";
import type { VendorInquiryItem } from "@/shared/lib/api/vendors";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const glassRow =
  "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55";

function formatInquiryTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function VendorInquiryPreviewRow({ inquiry }: { inquiry: VendorInquiryItem }) {
  return (
    <li>
      <Link href="/vendor/dashboard/inquiries" className={cn(glassRow, "flex items-start gap-3")}>
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            inquiry.from === "planner" ? vd.iconPlanner : vd.iconClient
          )}
        >
          {inquiry.from === "planner" ? (
            <Building2 size={16} aria-hidden />
          ) : (
            <UserCircle2 size={16} aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("font-medium", vg.body)}>{inquiry.senderName}</p>
            {!inquiry.isRead ? <span className={vd.badgeNew}>New</span> : null}
            <span className={cn(vg.caption)}>{formatInquiryTime(inquiry.sentAt)}</span>
          </div>
          <p className={cn("mt-0.5 truncate", vg.subtitle)}>
            {inquiry.subject ?? inquiry.message}
          </p>
          {inquiry.eventName ? (
            <p className={cn("mt-1 truncate", vg.caption)}>{inquiry.eventName}</p>
          ) : null}
        </div>
        <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  );
}
