"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { blockVendorDate, getVendorAvailability, unblockVendorDate } from "@/shared/lib/api/vendors";
import {
  Button,
  ErrorBanner,
  PageHeader,
  PageLoadingSkeleton,
  SectionCard,
  StatCard,
} from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import { calendarDayClass, vd } from "./vendor-dashboard-theme";

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
  saving,
  onToggle,
}: {
  grid: CalendarDay[];
  embedded: boolean;
  saving: boolean;
  onToggle: (day: CalendarDay) => void;
}) {
  const dayClass = (state: DayState) => calendarDayClass[state];

  return (
    <>
      <div className={cn("grid grid-cols-7 gap-2", embedded ? "mt-2" : "mt-6")}>
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
          >
            {wd}
          </div>
        ))}
        {grid.map((day, idx) => (
          <button
            key={`${day.date.toISOString()}-${idx}`}
            type="button"
            disabled={day.state === "outside" || day.state === "booked" || saving}
            onClick={() => onToggle(day)}
            className={cn(
              "relative flex min-h-[56px] flex-col items-center justify-center rounded-2xl border p-2 text-sm font-semibold transition sm:min-h-[72px]",
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
        ))}
      </div>

      <div className="flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border border-border bg-card" /> Available — click to block
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-success" /> Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-primary" /> Blocked — click to unblock
        </span>
      </div>
    </>
  );
}

export function AvailabilityCalendar({ embedded = false, fullPage = false }: AvailabilityCalendarProps) {
  const { user } = useAuth();
  const [cursor, setCursor] = useState(() => new Date());
  const [booked, setBooked] = useState<number[]>([]);
  const [blocked, setBlocked] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const token = await user.getIdToken();
      const data = await getVendorAvailability(token, monthKey(cursor));
      setBooked(data.bookedDates);
      setBlocked(data.blockedDates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load availability.");
    }
  }, [user, cursor]);

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

  const grid = useMemo(
    () => buildMonthGrid(year, month, booked, blocked),
    [year, month, booked, blocked]
  );

  const toggleBlock = async (day: CalendarDay) => {
    if (!user || day.state === "outside" || day.state === "booked" || saving) return;
    const iso = dateIso(day.date);
    try {
      setSaving(true);
      const token = await user.getIdToken();
      if (day.state === "blocked") {
        await unblockVendorDate(token, iso);
      } else {
        await blockVendorDate(token, iso);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update availability.");
    } finally {
      setSaving(false);
    }
  };

  const prevMonth = () => setCursor(new Date(year, month - 1, 1));
  const nextMonth = () => setCursor(new Date(year, month + 1, 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const openDays = Math.max(0, daysInMonth - booked.length - blocked.length);
  const isMonthEmpty = booked.length === 0 && blocked.length === 0;

  const monthNav = (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className={vd.label}>Month view</p>
        <p className="text-xl font-bold tracking-tight text-foreground">{monthLabel}</p>
        {embedded && (
          <p className="mt-1 text-xs text-muted-foreground">
            {booked.length} booked · {blocked.length} blocked · {openDays} open
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {(loading || saving) && (
          <Loader2 size={18} className="animate-spin text-primary" aria-hidden />
        )}
        <button type="button" onClick={prevMonth} className={vd.navBtn} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <button type="button" onClick={nextMonth} className={vd.navBtn} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const calendarBody = (
    <>
      {monthNav}
      <CalendarGrid
        grid={grid}
        embedded={embedded}
        saving={saving}
        onToggle={(day) => void toggleBlock(day)}
      />
    </>
  );

  if (loading && !refreshing && !embedded) {
    if (fullPage) return <PageLoadingSkeleton />;
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 animate-spin text-primary" size={20} aria-hidden />
        Loading calendar…
      </div>
    );
  }

  const statRow = (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Booked days"
        value={booked.length}
        sub="Confirmed on calendar"
        icon={CalendarDays}
        iconTheme="success"
        index={0}
      />
      <StatCard
        label="Blocked days"
        value={blocked.length}
        sub="Unavailable by you"
        icon={CalendarOff}
        iconTheme="primary"
        index={1}
      />
      <StatCard
        label="Open days"
        value={openDays}
        sub={`of ${daysInMonth} in ${monthLabel.split(" ")[0]}`}
        icon={CalendarDays}
        iconTheme="muted"
        index={2}
      />
    </div>
  );

  const emptyMonthHint =
    fullPage && isMonthEmpty ? (
      <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
        No bookings or blocked dates this month — click any open day to mark yourself unavailable.
      </div>
    ) : null;

  const embeddedBlock = (
    <article className="space-y-4">{calendarBody}</article>
  );

  const fullBlock = (
    <>
      {error && <ErrorBanner message={error} />}
      {statRow}
      <SectionCard
        title="Calendar"
        subtitle="Block dates you cannot serve. Booked days are set automatically from confirmed bookings."
      >
        {refreshing ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Refreshing calendar…</p>
        ) : (
          <>
            {calendarBody}
            {emptyMonthHint}
          </>
        )}
      </SectionCard>
      <SectionCard title="How it works" subtitle="Three states for each day">
        <ol className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <li className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <span className="font-bold text-primary">Available</span> — couples and planners can request
            your services on this date.
          </li>
          <li className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <span className="font-bold text-success">Booked</span> — confirmed booking; cannot be blocked
            manually.
          </li>
          <li className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
            <span className="font-bold text-primary">Blocked</span> — you marked the day unavailable; click
            again to reopen.
          </li>
        </ol>
      </SectionCard>
    </>
  );

  if (fullPage) {
    return (
      <div className="space-y-8 pb-4">
        <PageHeader
          title="Availability"
          description="Manage when you can take weddings — block personal days and see confirmed bookings at a glance."
          badge="Scheduling"
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
        {fullBlock}
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
    </div>
  );
}
