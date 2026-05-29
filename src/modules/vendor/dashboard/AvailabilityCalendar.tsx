"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { blockVendorDate, getVendorAvailability, unblockVendorDate } from "@/shared/lib/api/vendors";
import { bento } from "./bento";

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
};

export function AvailabilityCalendar({ embedded = false }: AvailabilityCalendarProps) {
  const { user } = useAuth();
  const [cursor, setCursor] = useState(() => new Date());
  const [booked, setBooked] = useState<number[]>([]);
  const [blocked, setBlocked] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getVendorAvailability(token, monthKey(cursor));
      setBooked(data.bookedDates);
      setBlocked(data.blockedDates);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load availability.");
    } finally {
      setLoading(false);
    }
  }, [user, cursor]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const dayClass = (state: DayState) => {
    switch (state) {
      case "booked":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 cursor-default";
      case "blocked":
        return "bg-slate-800 text-white border-slate-800";
      case "available":
        return "bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50";
      default:
        return "bg-slate-50/50 text-slate-300 border-transparent";
    }
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className={embedded ? "space-y-4" : "space-y-6"}>
      {!embedded && (
        <header className={bento.card}>
          <p className={bento.label}>Scheduling</p>
          <h2 className={`mt-2 ${bento.title}`}>Availability Calendar</h2>
          <p className={`mt-1 ${bento.subtitle}`}>
            Block dates you cannot serve. Booked days come from confirmed vendor bookings.
          </p>
        </header>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <article className={bento.card}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={bento.label}>Month view</p>
            <p className="text-xl font-bold tracking-tight text-slate-900">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            {loading && <Loader2 size={18} className="animate-spin text-slate-400" />}
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {wd}
            </div>
          ))}
          {grid.map((day, idx) => (
            <button
              key={`${day.date.toISOString()}-${idx}`}
              type="button"
              disabled={day.state === "outside" || day.state === "booked" || saving}
              onClick={() => void toggleBlock(day)}
              className={`relative flex min-h-[72px] flex-col items-center justify-center rounded-2xl border p-2 text-sm font-semibold transition ${dayClass(
                day.state
              )}`}
            >
              <span>{day.state === "outside" ? "" : day.date.getDate()}</span>
              {day.label && (
                <span className="mt-1 text-[9px] font-bold uppercase tracking-wide opacity-80">{day.label}</span>
              )}
              {day.state === "blocked" && (
                <Lock size={12} className="absolute right-2 top-2 opacity-70" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5 text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-white border border-slate-300" /> Available (click to block)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-400" /> Booked — confirmed
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-800" /> Blocked by you
          </span>
        </div>
      </article>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`${bento.cardCompact} text-center`}>
          <p className={bento.label}>Booked days</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{booked.length}</p>
        </div>
        <div className={`${bento.cardCompact} text-center`}>
          <p className={bento.label}>Blocked days</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{blocked.length}</p>
        </div>
        <div className={`${bento.cardCompact} text-center`}>
          <p className={bento.label}>Open days</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">
            {Math.max(0, daysInMonth - booked.length - blocked.length)}
          </p>
        </div>
      </div>
    </div>
  );
}
