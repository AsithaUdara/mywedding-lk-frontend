"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  FileText,
  Loader2,
  Paperclip,
  Send,
  Sparkles,
  UserCircle2,
  Building2,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  generateInquiryQuote,
  getVendorInquiries,
  VendorInquiryItem,
} from "@/shared/lib/api/vendors";
import { bento } from "./bento";

type InquiryManagementInboxProps = {
  embedded?: boolean;
};

export function InquiryManagementInbox({ embedded = false }: InquiryManagementInboxProps) {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<VendorInquiryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [quoteGenerated, setQuoteGenerated] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getVendorInquiries(token);
      setInquiries(data);
      setSelectedId((current) => current || data[0]?.id || "");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = inquiries.find((i) => i.id === selectedId) ?? inquiries[0];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="mr-2 animate-spin" size={20} />
        Loading inbox…
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-4" : "space-y-6"}>
      {!embedded && (
        <header className={bento.card}>
          <p className={bento.label}>CRM Inbox</p>
          <h2 className={`mt-2 ${bento.title}`}>Inquiry Management</h2>
          <p className={`mt-1 ${bento.subtitle}`}>
            Planner and client messages land here. Generate official quotes without leaving the platform.
          </p>
        </header>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {inquiries.length === 0 ? (
        <div className={`${bento.card} text-center text-sm text-slate-500`}>No inquiries yet.</div>
      ) : (
        <div className={`grid gap-6 ${embedded ? "" : "lg:grid-cols-12"}`}>
          <aside className={`${embedded ? "" : "lg:col-span-4"} ${bento.card} !p-0 overflow-hidden`}>
            <div className="border-b border-slate-100 px-5 py-4">
              <p className={bento.label}>Inbox</p>
              <p className="text-sm font-semibold text-slate-800">{inquiries.length} conversations</p>
            </div>
            <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
              {inquiries.map((inq) => (
                <li key={inq.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(inq.id);
                      setQuoteGenerated(false);
                      setReplyDraft("");
                    }}
                    className={`w-full px-5 py-4 text-left transition hover:bg-slate-50 ${
                      selectedId === inq.id ? "bg-slate-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                          inq.from === "planner" ? "bg-indigo-50 text-indigo-600" : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {inq.from === "planner" ? <Building2 size={16} /> : <UserCircle2 size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{inq.senderName}</p>
                          {!inq.isRead && (
                            <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-bold text-fuchsia-700">
                              New
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-500">{inq.subject ?? inq.message.slice(0, 48)}</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {selected && (
            <section className={`${embedded ? "" : "lg:col-span-8"} space-y-4`}>
              <article className={bento.card}>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      {selected.from === "planner" ? (
                        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          Planner inquiry
                        </span>
                      ) : (
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
                          Client inquiry
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(selected.sentAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
                      {selected.subject ?? "Inquiry"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selected.senderName} · {selected.senderOrg}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleGenerateQuote()}
                    disabled={generating}
                    className={bento.pillBtn}
                  >
                    {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                    Generate Quote
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Event</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{selected.eventName ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Date</p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-800">
                      <Calendar size={14} className="text-slate-400" />
                      {selected.weddingDate
                        ? new Date(selected.weddingDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Budget hint</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{selected.budgetHint ?? "—"}</p>
                  </div>
                </div>

                <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-sm leading-relaxed text-slate-700">
                  {selected.message}
                </div>

                {quoteGenerated && (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <Sparkles size={16} />
                    Official quote draft generated — review and send below.
                  </div>
                )}
              </article>

              <article className={bento.card}>
                <p className={bento.label}>Reply</p>
                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  rows={5}
                  placeholder="Type your response or use Generate Quote..."
                  className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <button type="button" className={bento.pillBtnOutline}>
                    <Paperclip size={16} />
                    Attach brochure
                  </button>
                  <button type="button" className={bento.pillBtn}>
                    <Send size={16} />
                    Send reply
                  </button>
                </div>
              </article>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
