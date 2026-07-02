"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  RefreshCw,
  ScrollText,
  Search,
} from "lucide-react";
import {
  useEventAuditLog,
  AUDIT_LOG_PAGE_SIZE,
} from "@/modules/admin/hooks/useEventAuditLog";
import {
  auditEventRef,
  formatEventDate,
  isValidEventGuid,
} from "@/modules/admin/dashboard/adminAuditHelpers";
import { AuditLogEntryCard } from "@/modules/admin/components/AuditLogEntryCard";
import { AuditLogToolbar } from "@/modules/admin/components/AuditLogToolbar";
import { AdminPagination } from "@/modules/admin/components/AdminPagination";
import {
  EmptyState,
  ErrorBanner,
  PageLoadingSkeleton,
  inputClass,
} from "@/shared/components/ui";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import { clampPage } from "@/shared/lib/pagination";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

export default function AdminAuditLogPage() {
  const [eventIdInput, setEventIdInput] = useState("");
  const [searchedEventId, setSearchedEventId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionType, setActionType] = useState("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, actionType, searchedEventId]);

  const {
    entries,
    pagination,
    summary,
    loading,
    refreshing,
    error,
    notFound,
    reload,
  } = useEventAuditLog({
    eventId: searchedEventId,
    page,
    search: debouncedSearch,
    actionType,
  });

  const currentPage = clampPage(page, Math.max(pagination.totalPages, 1));

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [page, currentPage]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = eventIdInput.trim();
    if (!isValidEventGuid(trimmed)) {
      setValidationError(
        "Enter a valid event ID (GUID), e.g. 49334c6e-c1b3-4627-8f7a-9bc2ffd68c8a."
      );
      setSearchedEventId(null);
      return;
    }
    setValidationError(null);
    setSearchQuery("");
    setDebouncedSearch("");
    setActionType("All");
    setPage(1);
    setSearchedEventId(trimmed);
  };

  const actionTypeCount = summary
    ? Object.keys(summary.actionTypeCounts).length
    : 0;

  if (loading && searchedEventId && !summary && !notFound) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <GlassPageHeader
        title="Audit log"
        description="Look up immutable activity records for any wedding event. Entries are append-only and cannot be edited or deleted."
        badge={
          <span className={cn(rf.badge, "inline-flex items-center gap-1.5 text-accent")}>
            <ScrollText size={12} aria-hidden />
            Compliance
          </span>
        }
        action={
          searchedEventId && summary ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(rf.badge, "tabular-nums")}>
                {summary.totalEntries} record{summary.totalEntries === 1 ? "" : "s"}
              </span>
              <GlassButton
                type="button"
                variant="ghost"
                disabled={refreshing}
                onClick={() => void reload()}
                className="gap-1.5"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} aria-hidden />
                Refresh
              </GlassButton>
            </div>
          ) : undefined
        }
      />

      <GlassSectionCard
        title="Event lookup"
        subtitle="Enter a wedding event GUID to load its compliance trail"
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
              placeholder="49334c6e-c1b3-4627-8f7a-9bc2ffd68c8a"
              className={glassInput}
              spellCheck={false}
              autoComplete="off"
            />
            {validationError ? (
              <p className="mt-1.5 text-sm text-destructive">{validationError}</p>
            ) : null}
          </div>
          <GlassButton type="submit" variant="primary" className="gap-2 sm:shrink-0">
            <Search size={18} aria-hidden />
            Load audit log
          </GlassButton>
        </form>
      </GlassSectionCard>

      {error && <ErrorBanner message={error} />}

      {notFound && searchedEventId && !loading && (
        <EmptyState
          icon={ScrollText}
          title="Event not found"
          description="No wedding event exists with that ID. Check the GUID and try again."
        />
      )}

      {!searchedEventId && !loading && (
        <EmptyState
          icon={ScrollText}
          title="Search by event ID"
          description="Support and compliance teams use this view to verify contracts, payments, and task changes for a specific wedding event."
        />
      )}

      {summary && searchedEventId && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <GlassStatCard
              label="Event"
              value={summary.eventName}
              sub={auditEventRef(summary.eventId)}
              icon={ScrollText}
              iconTheme="primary"
            />
            <GlassStatCard
              label="Wedding date"
              value={formatEventDate(summary.eventDate)}
              sub={`Stage: ${summary.lifecycleStage}`}
              icon={CalendarDays}
              iconTheme="accent"
            />
            <GlassStatCard
              label="Audit entries"
              value={summary.totalEntries}
              sub="Immutable records"
              icon={ClipboardList}
              iconTheme="primary"
            />
            <GlassStatCard
              label="Action types"
              value={actionTypeCount}
              sub="Distinct activity kinds"
              icon={ScrollText}
              iconTheme="success"
            />
          </div>

          <GlassSectionCard
            title="Activity trail"
            subtitle={`Append-only records for ${summary.eventName}`}
          >
            <div className="space-y-5">
              <AuditLogToolbar
                actionType={actionType}
                onActionTypeChange={setActionType}
                actionTypeCounts={summary.actionTypeCounts}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                resultCount={pagination.totalCount}
                totalEntries={summary.totalEntries}
              />

              {entries.length === 0 ? (
                <EmptyState
                  icon={ScrollText}
                  title={
                    debouncedSearch || actionType !== "All"
                      ? "No entries match your filters"
                      : "No audit entries"
                  }
                  description={
                    debouncedSearch || actionType !== "All"
                      ? "Try a different action type or search term."
                      : "This event has no recorded audit log items yet."
                  }
                />
              ) : (
                <>
                  <ul className="space-y-3" role="list">
                    {entries.map((entry) => (
                      <li key={entry.id}>
                        <AuditLogEntryCard entry={entry} />
                      </li>
                    ))}
                  </ul>
                  <AdminPagination
                    page={currentPage}
                    pageCount={Math.max(pagination.totalPages, 1)}
                    pageSize={AUDIT_LOG_PAGE_SIZE}
                    totalItems={pagination.totalCount}
                    onPageChange={setPage}
                  />
                </>
              )}
            </div>
          </GlassSectionCard>
        </>
      )}
    </div>
  );
}
