"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { draftInquiryEmail } from "@/shared/lib/api/plannerAi";
import { getVendorCategories, type VendorCategory } from "@/shared/lib/api/vendors";
import type { PlannerEventListItem } from "@/shared/lib/api/planner";
import { ErrorBanner, inputClass } from "@/modules/planner/components/ui";
import { GlassButton, GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

interface DraftInquiryFormProps {
  events: PlannerEventListItem[];
}

function toDateOnly(iso: string): string {
  return iso.includes("T") ? iso.split("T")[0]! : iso.slice(0, 10);
}

export function DraftInquiryForm({ events }: DraftInquiryFormProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [eventId, setEventId] = useState("");
  const [vendorCategory, setVendorCategory] = useState("");
  const [vendorBusinessName, setVendorBusinessName] = useState("");
  const [venue, setVenue] = useState("");
  const [styleNotes, setStyleNotes] = useState("");
  const [draftText, setDraftText] = useState("");
  const [subject, setSubject] = useState("");
  const [isSimulated, setIsSimulated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedEvent = useMemo(
    () => events.find((e) => e.eventId === eventId),
    [events, eventId]
  );

  useEffect(() => {
    setEventId((prev) => prev || events[0]?.eventId || "");
  }, [events]);

  useEffect(() => {
    getVendorCategories()
      .then((cats) => {
        setCategories(cats);
        setVendorCategory((prev) => prev || cats[0]?.name || "");
      })
      .catch(() => setCategories([]));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!user || !selectedEvent) return;
    if (!vendorBusinessName.trim()) {
      setError("Enter the vendor business name.");
      return;
    }
    if (!vendorCategory) {
      setError("Select a vendor category.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const plannerName = user.displayName || user.email?.split("@")[0] || "Planner";
      const result = await draftInquiryEmail(token, {
        plannerName,
        vendorBusinessName: vendorBusinessName.trim(),
        vendorCategory,
        eventName: selectedEvent.eventName,
        weddingDate: toDateOnly(selectedEvent.eventDate),
        venue: venue.trim() || undefined,
        budgetLkr: selectedEvent.totalBudget > 0 ? selectedEvent.totalBudget : undefined,
        styleNotes: styleNotes.trim() || undefined,
      });
      setSubject(result.subject);
      setDraftText(`Subject: ${result.subject}\n\n${result.body}`);
      setIsSimulated(result.isSimulated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate draft.");
    } finally {
      setLoading(false);
    }
  }, [user, selectedEvent, vendorBusinessName, vendorCategory, venue, styleNotes]);

  return (
    <GlassSectionCard
      title="Draft vendor inquiry"
      subtitle="Generate a polished outreach email for a vendor category and client wedding."
      action={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Mail size={18} aria-hidden />
        </div>
      }
    >
      {error && <ErrorBanner message={error} className="mb-4" />}

      {events.length === 0 ? (
        <p className={vg.subtitle}>Create a client event before drafting inquiries.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="draft-event" className={cn("mb-1.5 block font-semibold", vg.body)}>
                Client event
              </label>
              <select
                id="draft-event"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className={glassInput}
              >
                {events.map((ev) => (
                  <option key={ev.eventId} value={ev.eventId}>
                    {ev.eventName} — {toDateOnly(ev.eventDate)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="draft-category" className={cn("mb-1.5 block font-semibold", vg.body)}>
                Vendor category
              </label>
              <select
                id="draft-category"
                value={vendorCategory}
                onChange={(e) => setVendorCategory(e.target.value)}
                className={glassInput}
              >
                {categories.length === 0 ? (
                  <option value="">Loading categories…</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="draft-vendor" className={cn("mb-1.5 block font-semibold", vg.body)}>
              Vendor business name
            </label>
            <input
              id="draft-vendor"
              type="text"
              value={vendorBusinessName}
              onChange={(e) => setVendorBusinessName(e.target.value)}
              placeholder="e.g. Ceylon Lens Studio"
              className={glassInput}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="draft-venue" className={cn("mb-1.5 block font-semibold", vg.body)}>
                Venue <span className={cn("font-normal", vg.subtitle)}>(optional)</span>
              </label>
              <input
                id="draft-venue"
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Galle Face Hotel"
                className={glassInput}
              />
            </div>
            <div>
              <label htmlFor="draft-style" className={cn("mb-1.5 block font-semibold", vg.body)}>
                Style notes <span className={cn("font-normal", vg.subtitle)}>(optional)</span>
              </label>
              <input
                id="draft-style"
                type="text"
                value={styleNotes}
                onChange={(e) => setStyleNotes(e.target.value)}
                placeholder="e.g. candid documentary, warm tones"
                className={glassInput}
              />
            </div>
          </div>

          <GlassButton
            type="button"
            variant="primary"
            className="gap-1.5"
            onClick={() => void handleGenerate()}
            disabled={loading || !selectedEvent}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Sparkles size={16} aria-hidden />
            )}
            {loading ? "Generating…" : "Generate"}
          </GlassButton>

          {draftText && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="draft-output" className={cn("font-semibold", vg.body)}>
                  Email draft
                </label>
                {isSimulated && (
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent ring-1 ring-accent/15">
                    AI mock mode
                  </span>
                )}
              </div>
              {subject && (
                <p className={vg.caption}>
                  Subject line: <span className="font-medium text-foreground">{subject}</span>
                </p>
              )}
              <textarea
                id="draft-output"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={14}
                className={cn(glassInput, "min-h-[280px] resize-y font-mono text-[13px] leading-relaxed")}
              />
            </div>
          )}
        </div>
      )}
    </GlassSectionCard>
  );
}
