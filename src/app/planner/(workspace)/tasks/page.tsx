"use client";

import { CalendarDays, Clock3, Link2, Sparkles } from "lucide-react";

type GanttTask = {
  id: string;
  title: string;
  owner: string;
  stage: "Onboarding" | "Planning" | "Execution";
  startWeek: number;
  duration: number;
  completion: number;
  dependency?: string;
};

const WEEKS = Array.from({ length: 16 }, (_, i) => `W${i + 1}`);
const MOCK_GANTT_TASKS: GanttTask[] = [
  { id: "t1", title: "Client Discovery & Scope", owner: "Aisha", stage: "Onboarding", startWeek: 0, duration: 3, completion: 100 },
  { id: "t2", title: "Venue Shortlist & Site Visits", owner: "Rasheed", stage: "Planning", startWeek: 2, duration: 4, completion: 70, dependency: "t1" },
  { id: "t3", title: "Vendor Proposal Pack", owner: "Aisha", stage: "Planning", startWeek: 5, duration: 3, completion: 55, dependency: "t2" },
  { id: "t4", title: "Contract Finalization", owner: "Finance", stage: "Planning", startWeek: 7, duration: 2, completion: 38, dependency: "t3" },
  { id: "t5", title: "Production + Decor Build", owner: "Ops", stage: "Execution", startWeek: 9, duration: 4, completion: 22, dependency: "t4" },
  { id: "t6", title: "Day-of Run Sheet Lock", owner: "Aisha", stage: "Execution", startWeek: 13, duration: 2, completion: 10, dependency: "t5" },
];

const stageStyle: Record<GanttTask["stage"], string> = {
  Onboarding: "bg-fuchsia-100 text-fuchsia-700",
  Planning: "bg-orange-100 text-orange-700",
  Execution: "bg-emerald-100 text-emerald-700",
};

export default function PlannerTasksPage() {
  const totalProgress = Math.round(
    MOCK_GANTT_TASKS.reduce((sum, task) => sum + task.completion, 0) / MOCK_GANTT_TASKS.length
  );

  return (
    <section className="space-y-6">
      <header className="rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Timeline Workspace</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Master Gantt (Mock)</h1>
            <p className="mt-1 text-sm text-slate-500">
              Visual critical path with dependencies before wiring live API data.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-black">
            <Sparkles size={16} />
            Auto-Schedule Timeline
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <article className="col-span-12 rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Critical Tasks</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{MOCK_GANTT_TASKS.length}</p>
        </article>
        <article className="col-span-12 rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Completion</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{totalProgress}%</p>
        </article>
        <article className="col-span-12 rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Window</p>
          <p className="mt-2 inline-flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <CalendarDays size={18} className="text-slate-400" />
            16 Weeks
          </p>
        </article>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <div className="grid grid-cols-[320px_repeat(16,minmax(52px,1fr))] border-b border-slate-200/70 bg-slate-50/70 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Task / Owner</div>
              {WEEKS.map((week) => (
                <div key={week} className="text-center text-[11px] font-semibold text-slate-500">
                  {week}
                </div>
              ))}
            </div>

            <div className="space-y-2 p-4">
              {MOCK_GANTT_TASKS.map((task) => (
                <div key={task.id} className="grid grid-cols-[320px_repeat(16,minmax(52px,1fr))] items-center gap-y-2 rounded-2xl border border-slate-100 p-3">
                  <div className="pr-4">
                    <p className="text-sm font-semibold tracking-tight text-slate-900">{task.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${stageStyle[task.stage]}`}>{task.stage}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock3 size={12} />
                        {task.owner}
                      </span>
                      {task.dependency && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <Link2 size={12} />
                          Depends on {task.dependency.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-16 relative h-9 rounded-full bg-slate-100">
                    <div
                      className="absolute top-1/2 h-7 -translate-y-1/2 rounded-full bg-[#111111] px-3 text-[11px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                      style={{
                        left: `calc(${(task.startWeek / 16) * 100}% + 4px)`,
                        width: `calc(${(task.duration / 16) * 100}% - 8px)`,
                        minWidth: "84px",
                      }}
                    >
                      <div className="flex h-full items-center justify-between gap-2">
                        <span>{task.id.toUpperCase()}</span>
                        <span className="text-white/80">{task.completion}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
