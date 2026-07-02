"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  Lock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  blockVendorDate,
  getVendorAvailability,
  unblockVendorDate,
  type VendorAvailabilityMonth,
} from "@/shared/lib/api/vendors";
import { useVendorAvailabilityQuery } from "@/shared/hooks/query/useVendorQueries";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query/queryKeys";
import { ErrorBanner, PageLoadingSkeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import {
  GlassButton,
  GlassPageHeader,
  GlassSectionCard,
  GlassStatCard,
} from "./glass-ui";
import { VendorBlockDateModal } from "./VendorBlockDateModal";
import { vd } from "./vendor-dashboard-theme";
import { glassCalendarDayClass, vg } from "./vendor-glass-theme";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayState = "available" | "booked" | "blocked" | "outside";

type CalendarDay = {
  date: Date;
  state: DayState;
  label?: string;
};

function buildMonthGrid(year: number, month: number, bookedDays: number[], blockedDays: number[]): CalendarDay[] {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarDay[] = [];

  for (let i = 0; i < startPad; i++) {
    const d = new Date(year, month, 1 - (startPad - i));
    cells.push({ date: d, state: "outside" });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    let state: DayState = "available";
    let label: string | undefined;
    if (bookedDays.includes(day)) {
      state = "booked";
      label = "Booked";
    } else if (blockedDays.includes(day)) {
      state = "blocked";
      label = "Blocked";
    }
    cells.push({ date, state, label });
  }

  while (cells.length % 7 !== 0) {
    const next = cells.length - startPad - daysInMonth + 1;
    cells.push({
      date: new Date(year, month + 1, next),
      state: "outside",
    });
  }

  return cells;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type AvailabilityCalendarProps = {
  embedded?: boolean;
  fullPage?: boolean;
};

function CalendarGrid({
  grid,
  embedded,
  fullPage,
  saving,
  blockedReasons,
  onToggle,
}: {
  grid: CalendarDay[];
  embedded: boolean;
  fullPage?: boolean;
  saving: boolean;
  blockedReasons: Map<string, string>;
  onToggle: (day: CalendarDay) => void;
}) {
  const dayClass = (state: DayState) => glassCalendarDayClass[state];
  const legendBorder = fullPage || embedded ? "border-white/40" : "border-border";

  return (
    <>
      <div className={cn("grid grid-cols-7 gap-2", embedded ? "mt-2" : "mt-6")}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} className={cn("py-2 text-center", vg.label)}>
            {wd}
          </div>
        ))}
        {grid.map((day, idx) => {
          const iso = day.state !== "outside" ? dateIso(day.date) : "";
          const blockReason = day.state === "blocked" ? blockedReasons.get(iso) : undefined;

          return (
            <button
              key={`${day.date.toISOString()}-${idx}`}
              type="button"
              disabled={day.state === "outside" || day.state === "booked" || saving}
              onClick={() => onToggle(day)}
              title={blockReason ? `Blocked: ${blockReason}` : undefined}
              className={cn(
                "relative flex min-h-[56px] flex-col items-center justify-center rounded-2xl border p-2 transition sm:min-h-[72px]",
                "font-glass-body text-sm font-medium",
                dayClass(day.state),
                day.state === "available" && !embedded && "cursor-pointer"
              )}
            >
              <span>{day.state === "outside" ? "" : day.date.getDate()}</span>
              {day.label && !embedded && (
                <span className="mt-1 text-[9px] font-bold uppercase tracking-wide opacity-80">{day.label}</span>
              )}
              {day.state === "blocked" && (
                <Lock size={12} className="absolute right-2 top-2 opacity-70" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <div className={cn("flex flex-wrap gap-4 border-t pt-4", legendBorder, vg.caption)}>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-white/50 bg-white/40" />
          Available — click to block
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-success/80 ring-1 ring-success/30" /> Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-primary ring-1 ring-primary/30" /> Blocked — click to unblock
        </span>
      </div>
    </>
  );
}

export function AvailabilityCalendar({ embedded = false, fullPage = false }: AvailabilityCalendarProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [pendingBlockDay, setPendingBlockDay] = useState<CalendarDay | null>(null);
  const [blockReasonDraft, setBlockReasonDraft] = useState("");
  const hasLoadedOnce = useRef(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const monthQueryKey = monthKey(cursor);

  const {
    data: availability,
    isLoading: loading,
    isFetching,
    error: queryError,
  } = useVendorAvailabilityQuery(monthQueryKey);

  useEffect(() => {
    if (availability) hasLoadedOnce.current = true;
  }, [availability]);

  useEffect(() => {
    if (!user) return;

    const prefetchMonth = async (target: Date) => {
      const key = monthKey(target);
      await queryClient.prefetchQuery({
        queryKey: queryKeys.vendor.availability(key),
        queryFn: async () => {
          const token = await user.getIdToken();
          return getVendorAvailability(token, key);
        },
        staleTime: 60_000,
      });
    };

    void prefetchMonth(new Date(year, month - 1, 1));
    void prefetchMonth(new Date(year, month + 1, 1));
  }, [user, year, month, queryClient]);

  const booked = useMemo(() => availability?.bookedDates ?? [], [availability?.bookedDates]);
  const blocked = useMemo(() => availability?.blockedDates ?? [], [availability?.blockedDates]);
  const blockedDetails = useMemo(
    () => availability?.blockedDateDetails ?? [],
    [availability?.blockedDateDetails]
  );

  useEffect(() => {
    if (queryError) setError(queryError.message);
  }, [queryError]);

  const isMonthFetching = isFetching && !availability;
  const showInitialSkeleton = !embedded && fullPage && loading && !hasLoadedOnce.current;
  const isRefreshing = isFetching && hasLoadedOnce.current;

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.vendor.availability(monthQueryKey) });
  };

  const blockedReasons = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of blockedDetails) {
      if (entry.reason?.trim()) {
        map.set(entry.date, entry.reason.trim());
      }
    }
    return map;
  }, [blockedDetails]);

  const grid = useMemo(
    () => buildMonthGrid(year, month, booked, blocked),
    [year, month, booked, blocked]
  );

  const toggleBlock = async (day: CalendarDay, reason?: string): Promise<boolean> => {
    if (!user || day.state === "outside" || day.state === "booked" || saving) return false;

    const iso = dateIso(day.date);
    const dayNum = day.date.getDate();
    const queryKey = queryKeys.vendor.availability(monthQueryKey);
    const trimmedReason = reason?.trim() || undefined;

    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData<VendorAvailabilityMonth>(queryKey);

    if (previous) {
      const optimistic: VendorAvailabilityMonth =
        day.state === "blocked"
          ? {
              bookedDates: previous.bookedDates,
              blockedDates: previous.blockedDates.filter((value) => value !== dayNum),
              blockedDateDetails: previous.blockedDateDetails.filter((entry) => entry.date !== iso),
            }
          : {
              bookedDates: previous.bookedDates,
              blockedDates: [...previous.blockedDates, dayNum].sort((a, b) => a - b),
              blockedDateDetails: [
                ...previous.blockedDateDetails,
                { date: iso, reason: trimmedReason ?? null },
              ],
            };
      queryClient.setQueryData(queryKey, optimistic);
    }

    try {
      setSaving(true);
      const token = await user.getIdToken();
      if (day.state === "blocked") {
        await unblockVendorDate(token, iso);
      } else {
        await blockVendorDate(token, iso, trimmedReason);
      }
      void queryClient.invalidateQueries({ queryKey });
      setError(null);
      return true;
    } catch (err) {
      if (previous) queryClient.setQueryData(queryKey, previous);
      setError(err instanceof Error ? err.message : "Failed to update availability.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openBlockModal = (day: CalendarDay) => {
    setPendingBlockDay(day);
    setBlockReasonDraft("");
    setBlockModalOpen(true);
  };

  const closeBlockModal = () => {
    if (saving) return;
    setBlockModalOpen(false);
    setPendingBlockDay(null);
    setBlockReasonDraft("");
  };

  const confirmBlockDay = async () => {
    if (!pendingBlockDay) return;
    const ok = await toggleBlock(pendingBlockDay, blockReasonDraft);
    if (ok) closeBlockModal();
  };

  const handleDayToggle = (day: CalendarDay) => {
    if (day.state === "blocked") {
      void toggleBlock(day);
      return;
    }
    openBlockModal(day);
  };

  const pendingBlockLabel = pendingBlockDay
    ? pendingBlockDay.date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const prevMonth = () => setCursor(new Date(year, month - 1, 1));
  const nextMonth = () => setCursor(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const openDays = Math.max(0, daysInMonth - booked.length - blocked.length);
  const isMonthEmpty = booked.length === 0 && blocked.length === 0;

  const navBtnClass = vg.navBtn;
  const labelClass = vg.label;

  const monthNav = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className={labelClass}>Month view</p>
        <p className={cn(vg.body, "text-lg font-medium md:text-xl")}>{monthLabel}</p>
        {embedded && (
          <p className={cn("mt-1", vg.caption)}>
            {booked.length} booked · {blocked.length} blocked · {openDays} open
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {(isMonthFetching || saving) && (
          <Loader2 size={18} className="animate-spin text-primary" aria-hidden />
        )}
        <button type="button" onClick={prevMonth} className={navBtnClass} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={nextMonth} className={navBtnClass} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const calendarBody = (
    <>
      {monthNav}
      <div
        className={cn(
          "relative transition-opacity duration-200",
          isMonthFetching && "pointer-events-none opacity-60"
        )}
      >
        <CalendarGrid
          grid={grid}
          embedded={embedded}
          fullPage={fullPage}
          saving={saving}
          blockedReasons={blockedReasons}
          onToggle={(day) => handleDayToggle(day)}
        />
      </div>
    </>
  );

  if (showInitialSkeleton) {
    return <PageLoadingSkeleton />;
  }

  const statRow = (
    <div className="grid gap-4 sm:grid-cols-3">
      <GlassStatCard
        label="Booked days"
        value={booked.length}
        sub="Confirmed on calendar"
        icon={CalendarDays}
        iconTheme="success"
      />
      <GlassStatCard
        label="Blocked days"
        value={blocked.length}
        sub="Unavailable by you"
        icon={CalendarOff}
        iconTheme="primary"
      />
      <GlassStatCard
        label="Open days"
        value={openDays}
        sub={`of ${daysInMonth} in ${monthLabel.split(" ")[0]}`}
        icon={CalendarDays}
        iconTheme="muted"
      />
    </div>
  );

  const emptyMonthHint =
    fullPage && isMonthEmpty ? (
      <div className={cn("mt-6 rounded-2xl border border-dashed px-4 py-3 text-center", vd.metaBox, vg.subtitle)}>
        No bookings or blocked dates this month — click any open day to mark yourself unavailable.
      </div>
    ) : null;

  const blockedList =
    fullPage && blockedDetails.length > 0 ? (
      <ul className="mt-6 space-y-2">
        {blockedDetails.map((entry) => (
          <li key={entry.date} className={cn("flex flex-wrap items-baseline justify-between gap-2 rounded-xl px-4 py-2.5", vd.metaBox)}>
            <span className={cn(vg.body, "font-medium")}>
              {new Date(`${entry.date}T12:00:00`).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className={vg.caption}>{entry.reason?.trim() || "No reason noted"}</span>
          </li>
        ))}
      </ul>
    ) : null;

  const embeddedBlock = <article className="space-y-4">{calendarBody}</article>;

  const fullBlock = (
    <>
      {error && <ErrorBanner message={error} />}
      {statRow}
      <GlassSectionCard
        title="Calendar"
        subtitle="Block dates you cannot serve. Booked days are set automatically from confirmed bookings."
      >
        {calendarBody}
        {emptyMonthHint}
        {blockedList}
      </GlassSectionCard>
      <GlassSectionCard title="How it works" subtitle="Three states for each day">
        <ol className="grid gap-3 sm:grid-cols-3">
          <li className={cn(vd.metaBox, vg.subtitle)}>
            <span className="font-semibold text-primary">Available</span> — couples and planners can request
            your services on this date.
          </li>
          <li className={cn(vd.metaBox, vg.subtitle)}>
            <span className="font-semibold text-success">Booked</span> — confirmed booking; cannot be blocked
            manually.
          </li>
          <li className={cn(vd.metaBox, vg.subtitle)}>
            <span className="font-semibold text-primary">Blocked</span> — you marked the day unavailable; click
            again to reopen.
          </li>
        </ol>
      </GlassSectionCard>
    </>
  );

  const modal = (
    <VendorBlockDateModal
      isOpen={blockModalOpen}
      dateLabel={pendingBlockLabel}
      reason={blockReasonDraft}
      saving={saving}
      onReasonChange={setBlockReasonDraft}
      onClose={closeBlockModal}
      onConfirm={() => void confirmBlockDay()}
    />
  );

  if (fullPage) {
    return (
      <div className="space-y-6 pb-4 md:space-y-8">
        <GlassPageHeader
          title="Availability"
          description="Manage when you can take weddings — block personal days and see confirmed bookings at a glance."
          badge="Scheduling"
          action={
            <GlassButton
              variant="ghost"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
              className="gap-1.5"
            >
              <RefreshCw size={16} className={cn(isRefreshing && "animate-spin")} aria-hidden />
              Refresh
            </GlassButton>
          }
        />
        {fullBlock}
        {modal}
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-3" : "space-y-6"}>
      {!embedded && (
        <header className={vd.cardPad}>
          <p className={vd.label}>Scheduling</p>
          <h2 className={`mt-2 ${vd.title}`}>Availability Calendar</h2>
          <p className={`mt-1 ${vd.subtitle}`}>
            Block dates you cannot serve. Booked days come from confirmed vendor bookings.
          </p>
        </header>
      )}
      {error && <ErrorBanner message={error} />}
      {embedded ? embeddedBlock : <article className={vd.cardPad}>{calendarBody}</article>}
      {!embedded && statRow}
      {modal}
    </div>
  );
}
