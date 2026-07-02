"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  generateInquiryQuote,
  type InquiryQuoteResult,
  markInquiryAsRead,
  type VendorInquiryItem,
} from "@/shared/lib/api/vendors";
import { useVendorInquiriesQuery } from "@/shared/hooks/query/useVendorQueries";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import {
  computeInquiryStats,
  filterInquiries,
  findFirstUnread,
  type InboxFilter,
  resolveSelectedInquiry,
} from "@/modules/vendor/dashboard/vendorInquiryHelpers";

export function useVendorInquiriesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: inquiries,
    isLoading: loading,
    isFetching,
    error: queryError,
  } = useVendorInquiriesQuery();

  const resolvedInquiries = inquiries ?? [];

  const [selectedId, setSelectedId] = useState("");
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quoteResult, setQuoteResult] = useState<InquiryQuoteResult | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [generating, setGenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const stats = useMemo(() => computeInquiryStats(resolvedInquiries), [resolvedInquiries]);
  const filteredInquiries = useMemo(
    () => filterInquiries(resolvedInquiries, inboxFilter, searchQuery),
    [resolvedInquiries, inboxFilter, searchQuery]
  );
  const selected = useMemo(
    () => resolveSelectedInquiry(resolvedInquiries, filteredInquiries, selectedId),
    [resolvedInquiries, filteredInquiries, selectedId]
  );
  const firstUnread = useMemo(() => findFirstUnread(resolvedInquiries), [resolvedInquiries]);

  useEffect(() => {
    if (!selected && filteredInquiries[0]) {
      setSelectedId(filteredInquiries[0].id);
    }
  }, [selected, filteredInquiries]);

  useEffect(() => {
    if (queryError) setActionError(queryError.message);
  }, [queryError]);

  const refreshing = isFetching && !loading;
  const showInitialSkeleton = loading && inquiries === undefined;

  const reload = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.vendor.inquiries() });
  }, [queryClient]);

  const selectInquiry = useCallback(
    async (inquiry: VendorInquiryItem) => {
      setSelectedId(inquiry.id);
      setQuoteResult(null);
      setReplyDraft("");
      setActionError(null);

      if (!inquiry.isRead && user) {
        try {
          const token = await user.getIdToken();
          await markInquiryAsRead(token, inquiry.id);
          void queryClient.invalidateQueries({ queryKey: queryKeys.vendor.inquiries() });
          void queryClient.invalidateQueries({ queryKey: queryKeys.vendor.analytics() });
        } catch {
          /* non-blocking */
        }
      }
    },
    [user, queryClient]
  );

  const openFirstUnread = useCallback(async () => {
    if (!firstUnread) return;
    await selectInquiry(firstUnread);
    setInboxFilter("unread");
  }, [firstUnread, selectInquiry]);

  const generateQuote = useCallback(async () => {
    if (!user || !selected) return;
    try {
      setGenerating(true);
      const token = await user.getIdToken();
      const result = await generateInquiryQuote(token, selected.id);
      setQuoteResult(result);
      setReplyDraft(result.suggestedReply);
      setActionError(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to generate quote.");
    } finally {
      setGenerating(false);
    }
  }, [user, selected]);

  const sendReply = useCallback(() => {
    if (!selected || !replyDraft.trim()) return;
    const subject = encodeURIComponent(`Re: ${selected.subject ?? "Your inquiry"}`);
    const body = encodeURIComponent(replyDraft);
    window.location.href = `mailto:${selected.senderEmail}?subject=${subject}&body=${body}`;
  }, [selected, replyDraft]);

  return {
    inquiries: resolvedInquiries,
    filteredInquiries,
    selected,
    stats,
    firstUnread,
    inboxFilter,
    setInboxFilter,
    searchQuery,
    setSearchQuery,
    quoteResult,
    replyDraft,
    setReplyDraft,
    generating,
    showInitialSkeleton,
    refreshing,
    error: actionError,
    reload,
    selectInquiry,
    openFirstUnread,
    generateQuote,
    sendReply,
  };
}
