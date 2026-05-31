"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  FileText,
  Inbox,
  Loader2,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  generateInquiryQuote,
  getVendorInquiries,
  InquiryQuoteResult,
  markInquiryAsRead,
  VendorInquiryItem,
} from "@/shared/lib/api/vendors";
import {
  EmptyState,
  ErrorBanner,
  PageLoadingSkeleton,
  formatLKR,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "./glass-ui";
import { vd } from "./vendor-dashboard-theme";
import { vg } from "./vendor-glass-theme";

type InboxFilter = "all" | "unread" | "planner" | "client";

const INBOX_FILTERS: { value: InboxFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "planner", label: "Planners" },
  { value: "client", label: "Clients" },
];

type InquiryManagementInboxProps = {
  embedded?: boolean;
  fullPage?: boolean;
};

export function InquiryManagementInbox({ embedded = false, fullPage = false }: InquiryManagementInboxProps) {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<VendorInquiryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quoteResult, setQuoteResult] = useState<InquiryQuoteResult | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const token = await user.getIdToken();
      const data = await getVendorInquiries(token);
      setInquiries(data);
      setSelectedId((current) => {
        if (current && data.some((i) => i.id === current)) return current;
        return data[0]?.id ?? "";
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inquiries.");
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      try {
        setLoading(true);
        await load();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const stats = useMemo(
    () =>
      inquiries.reduce(
        (acc, inq) => {
          if (!inq.isRead) acc.unread += 1;
          if (inq.from === "planner") acc.planner += 1;
          else acc.client += 1;
          return acc;
        },
        { unread: 0, planner: 0, client: 0 }
      ),
    [inquiries]
  );

  const filteredInquiries = useMemo(() => {
    let list = [...inquiries];
    const q = searchQuery.trim().toLowerCase();
    if (inboxFilter === "unread") list = list.filter((i) => !i.isRead);
    else if (inboxFilter === "planner") list = list.filter((i) => i.from === "planner");
    else if (inboxFilter === "client") list = list.filter((i) => i.from === "client");
    if (q) {
      list = list.filter(
        (i) =>
          i.senderName.toLowerCase().includes(q) ||
          i.senderOrg.toLowerCase().includes(q) ||
          (i.subject?.toLowerCase().includes(q) ?? false) ||
          i.message.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }, [inquiries, inboxFilter, searchQuery]);

  const selected =
    filteredInquiries.find((i) => i.id === selectedId) ??
    inquiries.find((i) => i.id === selectedId) ??
    filteredInquiries[0];

  const selectInquiry = useCallback(
    async (inq: VendorInquiryItem) => {
      setSelectedId(inq.id);
      setQuoteResult(null);
      setReplyDraft("");
      if (!inq.isRead && user) {
        try {
          const token = await user.getIdToken();
          await markInquiryAsRead(token, inq.id);
          setInquiries((prev) =>
            prev.map((item) => (item.id === inq.id ? { ...item, isRead: true } : item))
          );
        } catch {
          /* non-blocking */
        }
      }
    },
    [user]
  );

  const handleGenerateQuote = async () => {
    if (!user || !selected) return;
    try {
      setGenerating(true);
      const token = await user.getIdToken();
      const result = await generateInquiryQuote(token, selected.id);
      setQuoteResult(result);
      setReplyDraft(result.suggestedReply);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quote.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSendReply = () => {
    if (!selected || !replyDraft.trim()) return;
    const subject = encodeURIComponent(`Re: ${selected.subject ?? "Your inquiry"}`);
    const body = encodeURIComponent(replyDraft);
    window.location.href = `mailto:${selected.senderEmail}?subject=${subject}&body=${body}`;
  };

  const recentInquiries = useMemo(
    () =>
      [...inquiries].sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      ),
    [inquiries]
  );

  const previewList = embedded ? recentInquiries.slice(0, 5) : filteredInquiries;

  if (loading && !refreshing && !embedded) {
    if (fullPage) return <PageLoadingSkeleton />;
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 animate-spin text-primary" size={20} aria-hidden />
        Loading inbox…
      </div>
    );
  }

  const cardClass = vg.inboxCard;
  const labelClass = vg.label;
  const borderClass = fullPage || embedded ? "border-white/40" : "border-border";

  const inboxList = (
    <aside className={cn("overflow-hidden !p-0", cardClass, embedded ? "" : "lg:col-span-4")}>
      {!embedded && (
        <div className={cn("border-b px-4 py-3", borderClass)}>
          <label className="sr-only" htmlFor="vendor-inbox-search">
            Search inquiries
          </label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="vendor-inbox-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, event, message…"
              className="vgo-search w-full rounded-full border py-2 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}
      <div className={cn("border-b px-5 py-4", borderClass)}>
        <p className={labelClass}>{embedded ? "Latest 5" : "Inbox"}</p>
        <p className={cn(embedded ? cn(vg.body, "font-medium") : "text-sm font-semibold text-foreground")}>
          {embedded
            ? `${Math.min(recentInquiries.length, 5)} recent`
            : `${filteredInquiries.length}${filteredInquiries.length !== inquiries.length ? ` of ${inquiries.length}` : ""} conversations`}
        </p>
      </div>
      <ul
        className={cn(
          "overflow-y-auto",
          vd.listDivide,
          embedded ? "max-h-64" : "max-h-[min(520px,60vh)]"
        )}
      >
        {previewList.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-muted-foreground">
            {searchQuery.trim() ? "No matches for your search." : "No conversations in this filter."}
          </li>
        ) : (
          previewList.map((inq) => (
            <li key={inq.id}>
              {embedded ? (
                <div className={cn("flex items-start gap-3 px-4 py-3", "transition-colors hover:bg-white/50")}>
                  <InquiryListAvatar inq={inq} />
                  <InquiryListBody inq={inq} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void selectInquiry(inq)}
                  className={cn(
                    "w-full px-5 py-4 text-left transition-colors duration-200",
                    selected?.id === inq.id
                      ? "bg-primary/10 ring-1 ring-inset ring-primary/20"
                      : "hover:bg-white/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <InquiryListAvatar inq={inq} />
                    <InquiryListBody inq={inq} />
                  </div>
                </button>
              )}
            </li>
          ))
        )}
      </ul>
      {embedded && recentInquiries.length > 5 && (
        <p className={cn("border-t px-4 py-2 text-center text-xs text-muted-foreground", borderClass)}>
          +{recentInquiries.length - 5} more in full inbox
        </p>
      )}
    </aside>
  );

  const detailPanel = selected ? (
    <section className={cn("space-y-4", embedded ? "" : "lg:col-span-8")}>
      <article className={vd.cardPad}>
        <div className={cn("flex flex-wrap items-start justify-between gap-4 border-b pb-5", borderClass)}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {selected.from === "planner" ? (
                <span className={vd.badgePlanner}>Planner inquiry</span>
              ) : (
                <span className={vd.badgeClient}>Client inquiry</span>
              )}
              <span className={vg.caption}>
                {new Date(selected.sentAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <h3 className="mt-2 font-luxury-section text-lg font-medium tracking-tight text-foreground">
              {selected.subject ?? "Inquiry"}
            </h3>
            <p className={cn("mt-1", vg.subtitle)}>
              {selected.senderName} · {selected.senderOrg}
            </p>
          </div>
          {!embedded && (
            <GlassButton
              variant="primary"
              onClick={() => void handleGenerateQuote()}
              disabled={generating}
              className="gap-1.5"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              Generate quote
            </GlassButton>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className={vd.metaBox}>
            <p className={vg.label}>Event</p>
            <p className={cn("mt-1 font-medium", vg.body)}>{selected.eventName ?? "—"}</p>
          </div>
          <div className={vd.metaBox}>
            <p className={vg.label}>Date</p>
            <p className={cn("mt-1 flex items-center gap-1 font-medium", vg.body)}>
              <Calendar size={14} className="text-muted-foreground" aria-hidden />
              {selected.weddingDate
                ? new Date(selected.weddingDate).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div className={vd.metaBox}>
            <p className={vg.label}>Budget hint</p>
            <p className={cn("mt-1 font-medium", vg.body)}>{selected.budgetHint ?? "—"}</p>
          </div>
        </div>

        <div className={cn("mt-6", vd.messageBox)}>{selected.message}</div>

        {quoteResult && (
          <div className={cn("mt-4 space-y-2", vd.successBanner)}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} aria-hidden />
              <span className="font-medium">Quote generated</span>
            </div>
            <p className="text-sm">
              {formatLKR(quoteResult.amount)} ({quoteResult.currency}) · Ref {quoteResult.quoteReference}
            </p>
            <p className="text-xs opacity-90">Review the suggested reply below, then send via email.</p>
          </div>
        )}
      </article>

      {!embedded && (
        <article className={vd.cardPad}>
          <p className={vg.label}>Reply</p>
          <textarea
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
            rows={5}
            placeholder="Type your response or use Generate quote…"
            className={cn("mt-3", vd.input)}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <GlassButton
              variant="ghost"
              disabled
              className="gap-1.5 opacity-60"
              title="Brochure attachments coming soon"
            >
              <Paperclip size={16} aria-hidden />
              Attach brochure
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleSendReply}
              disabled={!replyDraft.trim()}
              className="gap-1.5"
              title={
                replyDraft.trim()
                  ? `Open email to ${selected.senderEmail}`
                  : "Write a reply first"
              }
            >
              <Send size={16} aria-hidden />
              Send via email
            </GlassButton>
          </div>
        </article>
      )}
    </section>
  ) : null;

  const emptyInboxPlaceholder = (
    <EmptyState
      title="No inquiries yet"
      description="When planners or couples message you from MyWedding.lk, conversations appear here. Keep your profile and services complete to get discovered."
      icon={Inbox}
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <GlassButton href="/vendor/dashboard/profile" variant="primary">
            Improve profile
          </GlassButton>
          <GlassButton href="/vendor/dashboard/services" variant="ghost">
            Manage services
          </GlassButton>
        </div>
      }
      className="border-0 bg-transparent shadow-none"
    />
  );

  const crmBody =
    inquiries.length === 0 ? (
      embedded ? (
        <div className={cn(vg.inboxCard, "px-4 py-8 text-center text-sm text-muted-foreground")}>
          <Inbox className="mx-auto mb-2 text-muted-foreground/50" size={28} strokeWidth={1.5} aria-hidden />
          No inquiries yet — they will appear here when planners or couples message you.
        </div>
      ) : (
        emptyInboxPlaceholder
      )
    ) : embedded ? (
      inboxList
    ) : (
      <div className="grid gap-6 lg:grid-cols-12">
        {inboxList}
        {detailPanel ?? (
          <div
            className={cn(
              vd.cardPad,
              "lg:col-span-8 flex flex-col items-center justify-center border-dashed py-12 text-center"
            )}
          >
            <MessageSquare className="text-muted-foreground/40" size={36} strokeWidth={1.25} />
            <p className={cn("mt-3", vg.subtitle)}>Select a conversation to read and reply.</p>
          </div>
        )}
      </div>
    );

  const statRow = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <GlassStatCard
        label="Total conversations"
        value={inquiries.length}
        icon={Inbox}
        iconTheme="primary"
      />
      <GlassStatCard
        label="Unread"
        value={stats.unread}
        sub={stats.unread > 0 ? "Needs a response" : "All caught up"}
        icon={MessageSquare}
        iconTheme={stats.unread > 0 ? "warning" : "success"}
      />
      <GlassStatCard
        label="From planners"
        value={stats.planner}
        sub="Wedding planner leads"
        icon={Building2}
        iconTheme="accent"
      />
      <GlassStatCard
        label="From clients"
        value={stats.client}
        sub="Direct couple inquiries"
        icon={UserCircle2}
        iconTheme="muted"
      />
    </div>
  );

  const filterPills = (
    <div className="flex flex-wrap gap-1.5">
      {INBOX_FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => setInboxFilter(f.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
            inboxFilter === f.value ? "vgo-nav-active" : "vgo-nav-idle rf-glass-subtle vgo-glass-subtle"
          )}
          aria-pressed={inboxFilter === f.value}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  const content = (
    <>
      {error && <ErrorBanner message={error} />}

      {fullPage && statRow}

      {fullPage ? (
        <GlassSectionCard
          title="Conversations"
          subtitle={
            inquiries.length === 0
              ? "Nothing here yet — complete your storefront so planners and couples can reach you"
              : "Generate official quotes and reply — planners and couples see your responses in their workflow"
          }
          action={inquiries.length > 0 ? filterPills : undefined}
        >
          {refreshing ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Refreshing inbox…</p>
          ) : (
            crmBody
          )}
        </GlassSectionCard>
      ) : (
        crmBody
      )}
    </>
  );

  if (fullPage) {
    return (
      <div className="space-y-6 pb-4 md:space-y-8">
        <GlassPageHeader
          title="Inquiry inbox"
          description="Planner and client messages for your storefront — generate quotes and reply without leaving MyWedding.lk."
          badge="CRM"
          action={
            <GlassButton
              variant="ghost"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
              Refresh
            </GlassButton>
          }
        />
        {content}
      </div>
    );
  }

  return <div className={embedded ? "space-y-3" : "space-y-6"}>{content}</div>;
}

function InquiryListAvatar({ inq }: { inq: VendorInquiryItem }) {
  return (
    <div
      className={cn(
        "mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
        inq.from === "planner" ? vd.iconPlanner : vd.iconClient
      )}
    >
      {inq.from === "planner" ? <Building2 size={16} /> : <UserCircle2 size={16} />}
    </div>
  );
}

function InquiryListBody({ inq }: { inq: VendorInquiryItem }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className={cn("truncate", vg.body, "font-medium")}>{inq.senderName}</p>
        {!inq.isRead && <span className={vd.badgeNew}>New</span>}
      </div>
      <p className={cn("truncate", vg.caption)}>{inq.subject ?? inq.message.slice(0, 48)}</p>
    </div>
  );
}
