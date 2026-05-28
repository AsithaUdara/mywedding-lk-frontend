"use client";

import { useState } from "react";
import {
  Calendar,
  FileText,
  Paperclip,
  Send,
  Sparkles,
  UserCircle2,
  Building2,
} from "lucide-react";
import { bento } from "./bento";

type MockInquiry = {
  id: string;
  from: "planner" | "client";
  senderName: string;
  senderOrg: string;
  subject: string;
  preview: string;
  body: string;
  eventName: string;
  weddingDate: string;
  budgetHint: string;
  sentAt: string;
  unread: boolean;
};

const MOCK_INQUIRIES: MockInquiry[] = [
  {
    id: "inq-1",
    from: "planner",
    senderName: "Aisha Mendis",
    senderOrg: "Luxe Events Colombo",
    subject: "Photography package — Fernando Garden Reception",
    preview: "Hi, we are shortlisting vendors for a November garden wedding...",
    body: `Hi team,

We are planning Rivon & Shanya's garden reception on 2 Nov 2026 and would love your full-day photography coverage.

Could you share:
• Peak season rates for 10 hours
• Second shooter availability
• Delivery timeline for edited gallery

The couple's style is candid documentary with warm tones. Budget envelope is flexible around LKR 350k–420k if deliverables match.

Best,
Aisha Mendis
Lead Planner · Luxe Events Colombo`,
    eventName: "Fernando Garden Reception",
    weddingDate: "2026-11-02",
    budgetHint: "LKR 350,000 – 420,000",
    sentAt: "2026-05-28T09:14:00",
    unread: true,
  },
  {
    id: "inq-2",
    from: "client",
    senderName: "Hasara Silva",
    senderOrg: "Direct inquiry",
    subject: "Temple ceremony quote request",
    preview: "Looking for half-day coverage for July ceremony...",
    body: "Looking for half-day coverage for our temple ceremony in July. Please advise packages.",
    eventName: "Silva Temple Ceremony",
    weddingDate: "2026-07-29",
    budgetHint: "LKR 180,000",
    sentAt: "2026-05-26T14:30:00",
    unread: false,
  },
];

type InquiryManagementInboxProps = {
  embedded?: boolean;
};

export function InquiryManagementInbox({ embedded = false }: InquiryManagementInboxProps) {
  const [selectedId, setSelectedId] = useState(MOCK_INQUIRIES[0].id);
  const [quoteGenerated, setQuoteGenerated] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");

  const selected = MOCK_INQUIRIES.find((i) => i.id === selectedId) ?? MOCK_INQUIRIES[0];

  const handleGenerateQuote = () => {
    setQuoteGenerated(true);
    setReplyDraft(
      `Dear ${selected.senderName},\n\nThank you for your inquiry regarding ${selected.eventName}. Based on your requirements, we propose our Premium Full-Day Photography package at LKR 385,000 including second shooter and online gallery within 6 weeks.\n\nAttached: official quote PDF (mock).\n\nWarm regards,\nYour Studio`
    );
  };

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

      <div className={`grid gap-6 ${embedded ? "" : "lg:grid-cols-12"}`}>
        <aside className={`${embedded ? "" : "lg:col-span-4"} ${bento.card} !p-0 overflow-hidden`}>
          <div className="border-b border-slate-100 px-5 py-4">
            <p className={bento.label}>Inbox</p>
            <p className="text-sm font-semibold text-slate-800">{MOCK_INQUIRIES.length} conversations</p>
          </div>
          <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
            {MOCK_INQUIRIES.map((inq) => (
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
                        {inq.unread && (
                          <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-[10px] font-bold text-fuchsia-700">
                            New
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500">{inq.subject}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

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
                <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900">{selected.subject}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selected.senderName} · {selected.senderOrg}
                </p>
              </div>
              <button type="button" onClick={handleGenerateQuote} className={bento.pillBtn}>
                <FileText size={16} />
                Generate Quote
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Event</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selected.eventName}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Date</p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-800">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(selected.weddingDate).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Budget hint</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selected.budgetHint}</p>
              </div>
            </div>

            <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-sm leading-relaxed text-slate-700">
              {selected.body}
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
      </div>
    </div>
  );
}
