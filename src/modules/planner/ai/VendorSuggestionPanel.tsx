"use client";

import { useCallback, useState } from "react";
import { ClipboardList, Loader2, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { suggestVendors } from "@/shared/lib/api/plannerAi";
import { createVendorShortlist } from "@/shared/lib/api/vendorShortlist";
import {
  AiVendorSuggestionCard,
  type SelectableAiVendor,
} from "@/modules/planner/ai/AiVendorSuggestionCard";
import { AI_JIRA_INPUT, type AiEventContext } from "@/modules/planner/ai/plannerAiHelpers";
import { ErrorBanner } from "@/modules/planner/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { VENDOR_SEARCH_CATEGORIES } from "@/modules/vendors/search/vendorSearchConstants";
import { cn } from "@/shared/lib/cn";

type VendorSuggestionPanelProps = {
  eventContext: AiEventContext | null;
};

export function VendorSuggestionPanel({ eventContext }: VendorSuggestionPanelProps) {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>(VENDOR_SEARCH_CATEGORIES[0]);
  const [suggestions, setSuggestions] = useState<SelectableAiVendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendToClient, setSendToClient] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedEvent = eventContext?.event ?? null;

  const handleSuggest = useCallback(async () => {
    if (!user || !selectedEvent) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = await user.getIdToken();
      const result = await suggestVendors(token, {
        eventId: selectedEvent.eventId,
        category,
        topN: 5,
      });
      setSuggestions(
        result.map((vendor, index) => ({
          ...vendor,
          selected: true,
          key: `${index}-${vendor.vendorServiceId}`,
        }))
      );
      if (result.length === 0) {
        setError("No matching verified vendors found for this category. Try another category.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suggest vendors.");
    } finally {
      setLoading(false);
    }
  }, [user, selectedEvent, category]);

  const toggleVendor = (key: string, selected: boolean) => {
    setSuggestions((prev) => prev.map((vendor) => (vendor.key === key ? { ...vendor, selected } : vendor)));
  };

  const selectedCount = suggestions.filter((vendor) => vendor.selected).length;

  const handleAddToShortlist = useCallback(async () => {
    if (!user || !selectedEvent) return;
    const chosen = suggestions.filter((vendor) => vendor.selected);
    if (chosen.length === 0) {
      setError("Select at least one vendor to add.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const token = await user.getIdToken();
      const serviceDate = selectedEvent.eventDate.includes("T")
        ? selectedEvent.eventDate.split("T")[0]
        : selectedEvent.eventDate.slice(0, 10);

      await createVendorShortlist(token, selectedEvent.eventId, {
        sendToClient,
        items: chosen.map((vendor) => ({
          vendorServiceId: vendor.vendorServiceId,
          categoryLabel: vendor.categoryName,
          plannerNotes: `AI match (${Math.round(vendor.score * 100)}%): ${vendor.reason}`,
          proposedAmount: vendor.basePrice,
          serviceDate,
        })),
      });

      setSuccess(
        sendToClient
          ? `Sent ${chosen.length} vendor proposal${chosen.length === 1 ? "" : "s"} to the couple.`
          : `Added ${chosen.length} vendor${chosen.length === 1 ? "" : "s"} to shortlist as drafts.`
      );
      setSuggestions((prev) => prev.filter((vendor) => !vendor.selected));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add vendors to shortlist.");
    } finally {
      setSubmitting(false);
    }
  }, [user, selectedEvent, suggestions, sendToClient]);

  if (!eventContext) {
    return (
      <p className="py-6 text-center text-sm text-[#5E6C84]">
        Select an active client event to match vendors.
      </p>
    );
  }

  const procurementHref = `/planner/procurement?eventId=${encodeURIComponent(selectedEvent!.eventId)}`;

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {success && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E3FCEF] bg-[#E3FCEF]/60 px-4 py-3">
          <p className="text-sm font-medium text-[#006644]">{success}</p>
          <GlassButton href={procurementHref} variant="ghost" className="gap-1 px-2.5 py-1.5 text-xs">
            <ClipboardList size={13} aria-hidden />
            Open procurement
          </GlassButton>
        </div>
      )}

      <div className="rounded-lg border border-[#EBECF0] bg-[#FAFBFC] px-4 py-3">
        <p className="text-[11px] font-medium text-[#5E6C84]">{eventContext.eventKey}</p>
        <p className="mt-0.5 font-medium text-[#172B4D]">{eventContext.event.eventName}</p>
        <p className="mt-1 text-xs text-[#5E6C84]">
          {eventContext.weddingDateLabel} · {eventContext.daysUntil}d away
        </p>
      </div>

      <div>
        <label htmlFor="vendor-category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#97A0AF]">
          Category
        </label>
        <select
          id="vendor-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={cn(AI_JIRA_INPUT, "max-w-md")}
        >
          {VENDOR_SEARCH_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <GlassButton
        type="button"
        variant="primary"
        className="gap-1.5"
        onClick={() => void handleSuggest()}
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden />
        ) : (
          <Sparkles size={16} aria-hidden />
        )}
        {loading ? "Matching…" : "Find matching vendors"}
      </GlassButton>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#172B4D]">
              Review matches ({selectedCount} selected)
            </p>
            <label className="inline-flex items-center gap-2 text-sm text-[#42526E]">
              <input
                type="checkbox"
                checked={sendToClient}
                onChange={(event) => setSendToClient(event.target.checked)}
                className="h-4 w-4 rounded border-[#DFE1E6]"
              />
              Send to client immediately
            </label>
          </div>

          <ul className="space-y-2" role="list">
            {suggestions.map((vendor, index) => (
              <li key={vendor.key}>
                <AiVendorSuggestionCard
                  vendor={vendor}
                  rank={index + 1}
                  onToggle={(selected) => toggleVendor(vendor.key, selected)}
                />
              </li>
            ))}
          </ul>

          <GlassButton
            type="button"
            variant="primary"
            className="gap-1.5"
            disabled={submitting || selectedCount === 0}
            onClick={() => void handleAddToShortlist()}
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin" aria-hidden />
            ) : (
              <Send size={14} aria-hidden />
            )}
            {sendToClient ? "Add & send to client" : "Add to shortlist"}
          </GlassButton>
        </div>
      )}
    </div>
  );
}
