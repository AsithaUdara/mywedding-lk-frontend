"use client";

import { Inbox, MessageSquare, RefreshCw } from "lucide-react";
import { useVendorInquiriesPage } from "@/modules/vendor/dashboard/hooks/useVendorInquiriesPage";
import { VendorInquiryDetailPanel } from "@/modules/vendor/dashboard/VendorInquiryDetailPanel";
import { VendorInquiryListItem } from "@/modules/vendor/dashboard/VendorInquiryListItem";
import { VendorInquiryToolbar } from "@/modules/vendor/dashboard/VendorInquiryToolbar";
import {
  EmptyState,
  ErrorBanner,
  PageLoadingSkeleton,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import {
  GlassButton,
  GlassPageHeader,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";

export function VendorInquiriesInbox() {
  const {
    inquiries,
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
    error,
    reload,
    selectInquiry,
    openFirstUnread,
    generateQuote,
    sendReply,
  } = useVendorInquiriesPage();

  if (showInitialSkeleton) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 pb-4 md:space-y-8">
      <GlassPageHeader
        title="Inquiry inbox"
        description="Planner and client messages — reply and send quotes to move bookings forward."
        badge={stats.unread > 0 ? `${stats.unread} unread` : "Inbox"}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {firstUnread ? (
              <GlassButton variant="primary" onClick={() => void openFirstUnread()}>
                Reply to oldest unread
              </GlassButton>
            ) : null}
            <GlassButton
              variant="ghost"
              onClick={() => void reload()}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
              Refresh
            </GlassButton>
          </div>
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      {inquiries.length === 0 ? (
        <EmptyState
          title="No inquiries yet"
          description="When planners or couples message you from the marketplace, conversations appear here."
          icon={Inbox}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <GlassButton href="/vendor/dashboard/services" variant="primary">
                Publish services
              </GlassButton>
              <GlassButton href="/vendor/dashboard/profile" variant="ghost">
                Complete profile
              </GlassButton>
            </div>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <GlassStatCard
              label="Unread"
              value={stats.unread}
              sub={stats.unread > 0 ? "Needs your reply" : "Inbox clear"}
              icon={MessageSquare}
              iconTheme={stats.unread > 0 ? "warning" : "success"}
            />
            <GlassStatCard
              label="Open conversations"
              value={stats.total}
              sub={`${stats.planner} planner · ${stats.client} client`}
              icon={Inbox}
              iconTheme="primary"
            />
          </div>

          <div className={cn(vg.panel, "overflow-hidden !p-0")}>
            <div className="border-b border-white/40 px-4 py-4 sm:px-6">
              <VendorInquiryToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                inboxFilter={inboxFilter}
                onFilterChange={setInboxFilter}
                resultCount={filteredInquiries.length}
                totalCount={inquiries.length}
              />
            </div>

            <div className="grid lg:grid-cols-12">
              <aside className="border-b border-white/40 lg:col-span-4 lg:border-b-0 lg:border-r">
                <ul className="max-h-[min(640px,70vh)] divide-y divide-white/40 overflow-y-auto" role="list">
                  {filteredInquiries.length === 0 ? (
                    <li className="px-5 py-10 text-center text-sm text-muted-foreground">
                      {searchQuery.trim()
                        ? "No matches for your search."
                        : "No conversations in this filter."}
                    </li>
                  ) : (
                    filteredInquiries.map((inquiry) => (
                      <li key={inquiry.id}>
                        <VendorInquiryListItem
                          inquiry={inquiry}
                          selected={selected?.id === inquiry.id}
                          onSelect={(item) => void selectInquiry(item)}
                        />
                      </li>
                    ))
                  )}
                </ul>
              </aside>

              <div className="lg:col-span-8">
                {selected ? (
                  <div className="p-4 sm:p-6">
                    <VendorInquiryDetailPanel
                      inquiry={selected}
                      quoteResult={quoteResult}
                      replyDraft={replyDraft}
                      onReplyChange={setReplyDraft}
                      generating={generating}
                      onGenerateQuote={() => void generateQuote()}
                      onSendReply={sendReply}
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                    <MessageSquare
                      className="text-muted-foreground/40"
                      size={40}
                      strokeWidth={1.25}
                      aria-hidden
                    />
                    <p className={cn("mt-3 max-w-sm", vg.subtitle)}>
                      Select a conversation to read the message and send a reply.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
