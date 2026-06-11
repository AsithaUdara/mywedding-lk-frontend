"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ClipboardList, Loader2, Save } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getEventBrief,
  updateEventBrief,
  WEDDING_STYLE_OPTIONS,
  type EventBrief,
} from "@/shared/lib/api/eventBrief";
import { ErrorBanner, inputClass } from "@/modules/planner/components/ui";
import { GlassButton, GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

interface EventBriefPanelProps {
  eventId: string;
  eventName?: string;
  onBriefUpdated?: (brief: EventBrief) => void;
  onMarkedComplete?: () => void;
  onContinue?: () => void;
  embedded?: boolean;
}

export function EventBriefPanel({
  eventId,
  eventName,
  onBriefUpdated,
  onMarkedComplete,
  onContinue,
  embedded,
}: EventBriefPanelProps) {
  const { user } = useAuth();
  const [brief, setBrief] = useState<EventBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const [estimatedGuestCount, setEstimatedGuestCount] = useState("");
  const [guestCountMax, setGuestCountMax] = useState("");
  const [weddingStyle, setWeddingStyle] = useState("");
  const [venuePreference, setVenuePreference] = useState("");
  const [mustHavesNotes, setMustHavesNotes] = useState("");
  const [servicesAlreadyBooked, setServicesAlreadyBooked] = useState("");
  const [culturalOrReligiousNotes, setCulturalOrReligiousNotes] = useState("");

  const hydrateForm = useCallback((data: EventBrief) => {
    setEstimatedGuestCount(data.estimatedGuestCount?.toString() ?? "");
    setGuestCountMax(data.guestCountMax?.toString() ?? "");
    setWeddingStyle(data.weddingStyle ?? "");
    setVenuePreference(data.venuePreference ?? "");
    setMustHavesNotes(data.mustHavesNotes ?? "");
    setServicesAlreadyBooked(data.servicesAlreadyBooked ?? "");
    setCulturalOrReligiousNotes(data.culturalOrReligiousNotes ?? "");
  }, []);

  const loadBrief = useCallback(async () => {
    if (!user || !eventId) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const data = await getEventBrief(token, eventId);
      setBrief(data);
      hydrateForm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load brief.");
    } finally {
      setLoading(false);
    }
  }, [user, eventId, hydrateForm]);

  useEffect(() => {
    void loadBrief();
  }, [loadBrief]);

  const isComplete = brief?.isBriefComplete ?? false;

  useEffect(() => {
    if (!success || !feedbackRef.current) return;
    feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [success]);

  const handleSave = async (markComplete = false) => {
    if (!user || !eventId) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = await user.getIdToken();
      const updated = await updateEventBrief(token, eventId, {
        estimatedGuestCount: estimatedGuestCount ? Number(estimatedGuestCount) : null,
        guestCountMax: guestCountMax ? Number(guestCountMax) : null,
        weddingStyle: weddingStyle || null,
        venuePreference: venuePreference || null,
        mustHavesNotes: mustHavesNotes || null,
        servicesAlreadyBooked: servicesAlreadyBooked || null,
        culturalOrReligiousNotes: culturalOrReligiousNotes || null,
        markBriefComplete: markComplete,
      });
      setBrief(updated);
      hydrateForm(updated);
      onBriefUpdated?.(updated);
      if (markComplete && updated.isBriefComplete) {
        setSuccess("Brief complete. Open “Full wedding checklist” below when you’re ready.");
        onMarkedComplete?.();
      } else {
        setSuccess(updated.isBriefComplete ? "Changes saved." : "Draft saved.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save brief.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    if (embedded) {
      return (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin" aria-hidden />
          Loading brief…
        </div>
      );
    }
    return (
      <GlassSectionCard title="Event brief" subtitle="Loading requirements…">
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin" aria-hidden />
          Loading brief…
        </div>
      </GlassSectionCard>
    );
  }

  const displayName = eventName ?? brief?.eventName ?? "this event";

  const clearFeedbackOnEdit = () => {
    if (success) setSuccess(null);
  };

  const formBody = (
    <>
      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className={vg.label}>Estimated guests</span>
          <input
            type="number"
            min={1}
            className={glassInput}
            value={estimatedGuestCount}
            onChange={(e) => {
              clearFeedbackOnEdit();
              setEstimatedGuestCount(e.target.value);
            }}
            placeholder="e.g. 250"
          />
        </label>
        <label className="block space-y-1.5">
          <span className={vg.label}>Guest cap (max)</span>
          <input
            type="number"
            min={1}
            className={glassInput}
            value={guestCountMax}
            onChange={(e) => {
              clearFeedbackOnEdit();
              setGuestCountMax(e.target.value);
            }}
            placeholder="e.g. 300"
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className={vg.label}>Wedding style</span>
          <select
            className={glassInput}
            value={weddingStyle}
            onChange={(e) => {
              clearFeedbackOnEdit();
              setWeddingStyle(e.target.value);
            }}
          >
            <option value="">Select style…</option>
            {WEDDING_STYLE_OPTIONS.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className={vg.label}>Venue preference</span>
          <input
            className={glassInput}
            value={venuePreference}
            onChange={(e) => {
              clearFeedbackOnEdit();
              setVenuePreference(e.target.value);
            }}
            placeholder="Hotel ballroom, garden estate, beach…"
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className={vg.label}>Must-haves & priorities</span>
          <textarea
            className={cn(glassInput, "min-h-[88px] resize-y")}
            value={mustHavesNotes}
            onChange={(e) => {
              clearFeedbackOnEdit();
              setMustHavesNotes(e.target.value);
            }}
            placeholder="Live band, drone photography, vegan menu…"
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className={vg.label}>Services already booked</span>
          <textarea
            className={cn(glassInput, "min-h-[72px] resize-y")}
            value={servicesAlreadyBooked}
            onChange={(e) => {
              clearFeedbackOnEdit();
              setServicesAlreadyBooked(e.target.value);
            }}
            placeholder="Venue deposit paid, photographer confirmed…"
          />
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className={vg.label}>Cultural / religious notes</span>
          <textarea
            className={cn(glassInput, "min-h-[72px] resize-y")}
            value={culturalOrReligiousNotes}
            onChange={(e) => {
              clearFeedbackOnEdit();
              setCulturalOrReligiousNotes(e.target.value);
            }}
            placeholder="Poruwa ceremony timing, dress code for clergy…"
          />
        </label>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <GlassButton
            type="button"
            variant="ghost"
            className="gap-1.5"
            disabled={saving}
            onClick={() => void handleSave(false)}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Save size={16} aria-hidden />
            )}
            {isComplete ? "Save changes" : "Save draft"}
          </GlassButton>
          {!isComplete && (
            <GlassButton
              type="button"
              variant="primary"
              className="gap-1.5"
              disabled={saving}
              onClick={() => void handleSave(true)}
            >
              <CheckCircle2 size={16} aria-hidden />
              Mark brief complete
            </GlassButton>
          )}
        </div>

        {isComplete && !success && onContinue && (
          <GlassButton type="button" variant="primary" className="gap-1.5" onClick={onContinue}>
            Continue to full checklist
            <CheckCircle2 size={16} aria-hidden />
          </GlassButton>
        )}

        {isComplete && !success && !onContinue && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />
            <p>Brief complete. Continue to the next step when you&apos;re ready.</p>
          </div>
        )}

        {success && (
          <div
            ref={feedbackRef}
            role="status"
            className="flex items-start gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />
            <p>{success}</p>
          </div>
        )}
      </div>
    </>
  );

  if (embedded) {
    return formBody;
  }

  return (
    <GlassSectionCard
      title="Event brief"
      subtitle={`Capture couple requirements for ${displayName} before generating the master checklist`}
      action={
        brief && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              brief.isBriefComplete
                ? "bg-emerald-500/10 text-emerald-800 ring-1 ring-emerald-500/20"
                : "bg-amber-500/10 text-amber-900 ring-1 ring-amber-500/20"
            )}
          >
            {brief.isBriefComplete ? (
              <>
                <CheckCircle2 size={14} aria-hidden />
                Complete
              </>
            ) : (
              <>
                <ClipboardList size={14} aria-hidden />
                {brief.briefCompletionPercent}% filled
              </>
            )}
          </span>
        )
      }
    >
      {formBody}
    </GlassSectionCard>
  );
}
