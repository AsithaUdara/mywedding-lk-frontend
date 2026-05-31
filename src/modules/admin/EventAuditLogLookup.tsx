"use client";

import { FormEvent, useState } from "react";
import { Loader2, Search, ScrollText, User } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getEventAuditLog, type AuditLogItem } from "@/shared/lib/api/admin";
import {
  GlassButton,
  GlassSectionCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import {
  EmptyState,
  ErrorBanner,
  inputClass,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

const glassRow =
  "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm transition-all hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55 sm:p-5";

function formatTimestamp(utc: string): string {
  const d = new Date(utc);
  if (Number.isNaN(d.getTime())) return utc;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function shortId(value: string): string {
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

type EventAuditLogLookupProps = {
  onSearchResult?: (stats: { eventId: string; count: number } | null) => void;
};

export function EventAuditLogLookup({ onSearchResult }: EventAuditLogLookupProps) {
  const { user } = useAuth();
  const [eventIdInput, setEventIdInput] = useState("");
  const [searchedEventId, setSearchedEventId] = useState<string | null>(null);
  const [rows, setRows] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = eventIdInput.trim();
    if (!GUID_RE.test(trimmed)) {
      setValidationError("Enter a valid event ID (GUID), e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6.");
      onSearchResult?.(null);
      return;
    }
    if (!user) return;

    setValidationError(null);
    setError(null);
    setLoading(true);
    setSearchedEventId(trimmed);

    try {
      const token = await user.getIdToken();
      const data = await getEventAuditLog(token, trimmed);
      setRows(data);
      onSearchResult?.({ eventId: trimmed, count: data.length });
    } catch (err) {
      setRows([]);
      onSearchResult?.(null);
      setError(err instanceof Error ? err.message : "Failed to load audit log.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassSectionCard
        title="Search by event"
        subtitle="Enter a wedding event GUID to load its append-only audit trail"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="audit-event-id" className={cn("mb-1.5 block", rf.linkLabel)}>
              Event ID
            </label>
            <input
              id="audit-event-id"
              type="text"
              value={eventIdInput}
              onChange={(e) => {
                setEventIdInput(e.target.value);
                setValidationError(null);
              }}
              placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
              className={glassInput}
              spellCheck={false}
              autoComplete="off"
            />
            {validationError && (
              <p className="mt-1.5 text-sm text-destructive">{validationError}</p>
            )}
          </div>
          <GlassButton
            type="submit"
            variant="primary"
            className="gap-2 sm:shrink-0"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" aria-hidden />
            ) : (
              <Search size={18} aria-hidden />
            )}
            {loading ? "Loading…" : "Search"}
          </GlassButton>
        </form>
      </GlassSectionCard>

      {error && <ErrorBanner message={error} />}

      {searchedEventId && !loading && !error && (
        <GlassSectionCard
          title="Audit entries"
          subtitle={`Immutable records for event ${searchedEventId}`}
        >
          {rows.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="No audit entries"
              description="This event has no recorded audit log items yet."
              className="rounded-2xl border border-dashed border-white/55 bg-white/25 backdrop-blur-sm"
            />
          ) : (
            <ul className="space-y-3" role="list">
              {rows.map((row) => (
                <li key={row.id}>
                  <article className={glassRow}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
                      <div className="shrink-0 lg:w-44">
                        <p className={rf.label}>When (UTC)</p>
                        <time
                          dateTime={row.timestampUtc}
                          className={cn("mt-0.5 block text-sm", vg.subtitle)}
                        >
                          {formatTimestamp(row.timestampUtc)}
                        </time>
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn(rf.badge, "normal-case tracking-normal text-foreground")}>
                            {row.actionType}
                          </span>
                          <span
                            className={cn("font-mono text-xs", vg.subtitle)}
                            title={row.id}
                          >
                            {shortId(row.id)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">{row.content}</p>
                        {row.metadataJson && (
                          <pre className="overflow-x-auto rounded-lg border border-white/40 bg-white/30 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur-sm">
                            {row.metadataJson}
                          </pre>
                        )}
                      </div>

                      <div className="shrink-0 lg:w-40">
                        <p className={rf.label}>Actor</p>
                        <div className="mt-1 flex items-start gap-2">
                          <User size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {row.actorFirstName} {row.actorLastName}
                            </p>
                            <p
                              className={cn("font-mono text-xs", vg.subtitle)}
                              title={row.actorId}
                            >
                              {shortId(row.actorId)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </GlassSectionCard>
      )}

      {!searchedEventId && !loading && (
        <EmptyState
          icon={ScrollText}
          title="Search by event ID"
          description="Enter a wedding event GUID to load its append-only audit trail."
          className="rounded-2xl border border-dashed border-white/55 bg-white/25 backdrop-blur-sm"
        />
      )}
    </div>
  );
}
