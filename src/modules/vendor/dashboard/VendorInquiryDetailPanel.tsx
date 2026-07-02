"use client";

import { Calendar, FileText, Loader2, Send, Sparkles } from "lucide-react";
import type { InquiryQuoteResult, VendorInquiryItem } from "@/shared/lib/api/vendors";
import {
  formatInquiryDate,
  formatInquiryTimestamp,
} from "@/modules/vendor/dashboard/vendorInquiryHelpers";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { formatLKR } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

export function VendorInquiryDetailPanel({
  inquiry,
  quoteResult,
  replyDraft,
  onReplyChange,
  generating,
  onGenerateQuote,
  onSendReply,
}: {
  inquiry: VendorInquiryItem;
  quoteResult: InquiryQuoteResult | null;
  replyDraft: string;
  onReplyChange: (value: string) => void;
  generating: boolean;
  onGenerateQuote: () => void;
  onSendReply: () => void;
}) {
  return (
    <div className="space-y-4">
      <article className={vd.cardPad}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/40 pb-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {inquiry.from === "planner" ? (
                <span className={vd.badgePlanner}>Planner</span>
              ) : (
                <span className={vd.badgeClient}>Client</span>
              )}
              <span className={vg.caption}>{formatInquiryTimestamp(inquiry.sentAt)}</span>
            </div>
            <h2 className={cn("mt-2", rf.sectionTitle)}>{inquiry.subject ?? "Inquiry"}</h2>
            <p className={cn("mt-1", vg.subtitle)}>
              {inquiry.senderName} · {inquiry.senderOrg}
            </p>
            <p className={cn("mt-1", vg.caption)}>{inquiry.senderEmail}</p>
          </div>
          <GlassButton
            variant="primary"
            onClick={onGenerateQuote}
            disabled={generating}
            className="gap-1.5"
          >
            {generating ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <FileText size={16} aria-hidden />
            )}
            Generate quote
          </GlassButton>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className={vd.metaBox}>
            <dt className={vg.label}>Event</dt>
            <dd className={cn("mt-1 font-medium", vg.body)}>{inquiry.eventName ?? "—"}</dd>
          </div>
          <div className={vd.metaBox}>
            <dt className={vg.label}>Wedding date</dt>
            <dd className={cn("mt-1 flex items-center gap-1 font-medium", vg.body)}>
              <Calendar size={14} className="text-muted-foreground" aria-hidden />
              {formatInquiryDate(inquiry.weddingDate)}
            </dd>
          </div>
          <div className={vd.metaBox}>
            <dt className={vg.label}>Budget hint</dt>
            <dd className={cn("mt-1 font-medium", vg.body)}>{inquiry.budgetHint ?? "—"}</dd>
          </div>
        </dl>

        <div className={cn("mt-6 whitespace-pre-wrap", vd.messageBox)}>{inquiry.message}</div>

        {quoteResult ? (
          <div className={cn("mt-4 space-y-2", vd.successBanner)}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} aria-hidden />
              <span className="font-medium">Quote ready</span>
            </div>
            <p className="text-sm">
              {formatLKR(quoteResult.amount)} ({quoteResult.currency}) · Ref{" "}
              {quoteResult.quoteReference}
            </p>
            <p className="text-xs opacity-90">Review the reply below, then send via email.</p>
          </div>
        ) : null}
      </article>

      <article className={vd.cardPad}>
        <label htmlFor="vendor-inquiry-reply" className={vg.label}>
          Reply
        </label>
        <textarea
          id="vendor-inquiry-reply"
          value={replyDraft}
          onChange={(event) => onReplyChange(event.target.value)}
          rows={6}
          placeholder="Write your response or generate a quote to prefill…"
          className={cn("mt-3", vd.input)}
        />
        <div className="mt-4 flex justify-end">
          <GlassButton
            variant="primary"
            onClick={onSendReply}
            disabled={!replyDraft.trim()}
            className="gap-1.5"
            title={
              replyDraft.trim()
                ? `Open email to ${inquiry.senderEmail}`
                : "Write a reply first"
            }
          >
            <Send size={16} aria-hidden />
            Send via email
          </GlassButton>
        </div>
      </article>
    </div>
  );
}
