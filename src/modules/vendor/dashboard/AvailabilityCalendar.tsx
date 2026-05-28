"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
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

const INITIAL_BOOKED = [3, 4, 12, 18, 19, 25, 26];
const INITIAL_BLOCKED = [7, 8, 14, 15, 21, 22];

type AvailabilityCalendarProps = {
  embedded?: boolean;
};

export function AvailabilityCalendar({ embedded = false }: AvailabilityCalendarProps) {
  const [cursor, setCursor] = useState(() => new Date(2026, 5, 1));
  const [booked, setBooked] = useState(INITIAL_BOOKED);
  const [blocked, setBlocked] = useState(INITIAL_BLOCKED);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const grid = useMemo(
    () => buildMonthGrid(year, month, booked, blocked),
    [year, month, booked, blocked]
  );

  const toggleBlock = (day: CalendarDay) => {
    if (day.state === "outside" || day.state === "booked") return;
    const d = day.date.getDate();
    setBlocked((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)));
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

  return (
    <div className={embedded ? "space-y-4" : "space-y-6"}>
      {!embedded && (
        <header className={bento.card}>
          <p className={bento.label}>Scheduling</p>
          <h2 className={`mt-2 ${bento.title}`}>Availability Calendar</h2>
          <p className={`mt-1 ${bento.subtitle}`}>
            Block dates you cannot serve. Planners see availability before shortlisting you (mock UI).
          </p>
        </header>
      )}

      <article className={bento.card}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className={bento.label}>Month view</p>
            <p className="text-xl font-bold tracking-tight text-slate-900">{monthLabel}</p>
          </div>
          <div className="flex items-center gap-2">
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
              disabled={day.state === "outside" || day.state === "booked"}
              onClick={() => toggleBlock(day)}
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
            {new Date(year, month + 1, 0).getDate() - booked.length - blocked.length}
          </p>
        </div>
      </div>
    </div>
  );
}
