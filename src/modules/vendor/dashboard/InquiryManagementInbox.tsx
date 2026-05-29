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
  Send,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  generateInquiryQuote,
  getVendorInquiries,
  markInquiryAsRead,
  VendorInquiryItem,
} from "@/shared/lib/api/vendors";
import {
  Button,
  EmptyState,
  ErrorBanner,
  PageHeader,
  PageLoadingSkeleton,
  SectionCard,
  StatCard,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import { vd } from "./vendor-dashboard-theme";

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
  const [quoteGenerated, setQuoteGenerated] = useState(false);
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
      setQuoteGenerated(false);
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
      setQuoteGenerated(true);
      setReplyDraft(result.suggestedReply);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quote.");
    } finally {
      setGenerating(false);
    }
  };

  const previewList = embedded ? inquiries.slice(0, 5) : filteredInquiries;

  if (loading && !refreshing && !embedded) {
    if (fullPage) return <PageLoadingSkeleton />;
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 animate-spin text-primary" size={20} aria-hidden />
        Loading inbox…
      </div>
    );
  }

  const inboxList = (
    <aside className={cn("overflow-hidden !p-0", vd.card, embedded ? "" : "lg:col-span-4")}>
      {!embedded && (
        <div className="border-b border-border px-4 py-3">
          <label className="sr-only" htmlFor="vendor-inbox-search">
            Search inquiries
          </label>
          <input
            id="vendor-inbox-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, event, message…"
            className="w-full rounded-full border border-border bg-muted/40 px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
          />
        </div>
      )}
      <div className="border-b border-border px-5 py-4">
        <p className={vd.label}>{embedded ? "Recent" : "Inbox"}</p>
        <p className="text-sm font-semibold text-foreground">
          {embedded ? inquiries.length : filteredInquiries.length}
          {!embedded && filteredInquiries.length !== inquiries.length
            ? ` of ${inquiries.length}`
            : ""}{" "}
          conversations
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
                <div className="flex items-start gap-3 px-4 py-3">
                  <InquiryListAvatar inq={inq} />
                  <InquiryListBody inq={inq} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void selectInquiry(inq)}
                  className={cn(
                    "w-full px-5 py-4 text-left",
                    vd.rowHover,
                    selected?.id === inq.id && vd.rowActive
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
      {embedded && inquiries.length > 5 && (
        <p className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
          +{inquiries.length - 5} more in full inbox
        </p>
      )}
    </aside>
  );

  const detailPanel = selected ? (
    <section className={cn("space-y-4", embedded ? "" : "lg:col-span-8")}>
      <article className={vd.cardPad}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {selected.from === "planner" ? (
                <span className={vd.badgePlanner}>Planner inquiry</span>
              ) : (
                <span className={vd.badgeClient}>Client inquiry</span>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(selected.sentAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-bold tracking-tight text-foreground">
              {selected.subject ?? "Inquiry"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selected.senderName} · {selected.senderOrg}
            </p>
          </div>
          {!embedded && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => void handleGenerateQuote()}
              disabled={generating}
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              Generate quote
            </Button>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className={vd.metaBox}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Event
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{selected.eventName ?? "—"}</p>
          </div>
          <div className={vd.metaBox}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Date
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-foreground">
              <Calendar size={14} className="text-muted-foreground" aria-hidden />
              {selected.weddingDate
                ? new Date(selected.weddingDate).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div className={vd.metaBox}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Budget hint
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{selected.budgetHint ?? "—"}</p>
          </div>
        </div>

        <div className={cn("mt-6", vd.messageBox)}>{selected.message}</div>

        {quoteGenerated && (
          <div className={cn("mt-4 flex items-center gap-2", vd.successBanner)}>
            <Sparkles size={16} aria-hidden />
            Official quote draft generated — review and send below.
          </div>
        )}
      </article>

      {!embedded && (
        <article className={vd.cardPad}>
          <p className={vd.label}>Reply</p>
          <textarea
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
            rows={5}
            placeholder="Type your response or use Generate quote…"
            className={cn("mt-3", vd.input)}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="secondary" size="sm">
              <Paperclip size={16} aria-hidden />
              Attach brochure
            </Button>
            <Button type="button" variant="primary" size="sm">
              <Send size={16} aria-hidden />
              Send reply
            </Button>
          </div>
        </article>
      )}
    </section>
  ) : null;

  const emptyInboxPlaceholder = (
    <div className="space-y-6">
      <EmptyState
        title="No inquiries yet"
        description="When planners or couples message you from MyWedding.lk, conversations appear here. Keep your profile and services complete to get discovered."
        icon={Inbox}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button href="/vendor/dashboard/profile" variant="primary" size="sm">
              Improve profile
            </Button>
            <Button href="/vendor/dashboard/services" variant="secondary" size="sm">
              Manage services
            </Button>
          </div>
        }
      />
      <div
        className="grid gap-4 opacity-90 lg:grid-cols-12"
        aria-hidden
      >
        <div className={cn(vd.card, "lg:col-span-4 overflow-hidden")}>
          <div className="border-b border-border px-5 py-4">
            <p className={vd.label}>Preview</p>
            <p className="text-sm font-semibold text-muted-foreground">Your inbox will look like this</p>
          </div>
          <ul className={vd.listDivide}>
            {[
              { name: "Planner inquiry", sub: "Wedding date & event details", planner: true },
              { name: "Client inquiry", sub: "Package question from couple", planner: false },
            ].map((row) => (
              <li key={row.name} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      row.planner ? vd.iconPlanner : vd.iconClient
                    )}
                  >
                    {row.planner ? <Building2 size={16} /> : <UserCircle2 size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-muted-foreground">{row.name}</p>
                    <p className="truncate text-xs text-muted-foreground/80">{row.sub}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div
          className={cn(
            vd.cardPad,
            "lg:col-span-8 flex flex-col items-center justify-center border-dashed py-12 text-center"
          )}
        >
          <MessageSquare className="text-muted-foreground/40" size={36} strokeWidth={1.25} />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            Select a conversation to read details and send a quote
          </p>
        </div>
      </div>
    </div>
  );

  const crmBody =
    inquiries.length === 0 ? (
      embedded ? (
        <div className={cn(vd.card, "px-4 py-8 text-center text-sm text-muted-foreground")}>
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
          <div className={cn(vd.cardPad, "lg:col-span-8 text-center text-sm text-muted-foreground")}>
            Select a conversation to read and reply.
          </div>
        )}
      </div>
    );

  const statRow = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total conversations"
        value={inquiries.length}
        icon={Inbox}
        iconTheme="primary"
        index={0}
      />
      <StatCard
        label="Unread"
        value={stats.unread}
        sub={stats.unread > 0 ? "Needs a response" : "All caught up"}
        icon={MessageSquare}
        iconTheme={stats.unread > 0 ? "warning" : "success"}
        index={1}
      />
      <StatCard
        label="From planners"
        value={stats.planner}
        sub="Wedding planner leads"
        icon={Building2}
        iconTheme="accent"
        index={2}
      />
      <StatCard
        label="From clients"
        value={stats.client}
        sub="Direct couple inquiries"
        icon={UserCircle2}
        iconTheme="muted"
        index={3}
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
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
            inboxFilter === f.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
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
        <SectionCard
          title="Conversations"
          subtitle={
            inquiries.length === 0
              ? "Nothing here yet — complete your storefront so planners and couples can reach you"
              : "Reply with official quotes — planners and couples see your responses in their workflow"
          }
          action={inquiries.length > 0 ? filterPills : undefined}
        >
          {refreshing ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Refreshing inbox…</p>
          ) : (
            crmBody
          )}
        </SectionCard>
      ) : (
        crmBody
      )}
    </>
  );

  if (fullPage) {
    return (
      <div className="space-y-8 pb-4">
        <PageHeader
          title="Inquiry inbox"
          description="Planner and client messages for your storefront — generate quotes and reply without leaving MyWedding.lk."
          badge="CRM"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={cn(refreshing && "animate-spin")} aria-hidden />
              Refresh
            </Button>
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
        <p className="truncate text-sm font-semibold text-foreground">{inq.senderName}</p>
        {!inq.isRead && <span className={vd.badgeNew}>New</span>}
      </div>
      <p className="truncate text-xs text-muted-foreground">
        {inq.subject ?? inq.message.slice(0, 48)}
      </p>
    </div>
  );
}
