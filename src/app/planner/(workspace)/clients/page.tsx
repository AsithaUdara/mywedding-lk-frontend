"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CalendarClock, CircleDollarSign, GripVertical, UserRoundPlus, Users } from "lucide-react";

type EventLifecycleStage = "Lead" | "Onboarding" | "Planning" | "Execution" | "Archived";

type ClientCard = {
  id: string;
  title: string;
  couple: string;
  email: string;
  weddingDate: string;
  budget: number;
  completion: number;
  stage: EventLifecycleStage;
  priority: "High" | "Medium" | "Low";
};

const STAGES: EventLifecycleStage[] = ["Lead", "Onboarding", "Planning", "Execution", "Archived"];

const MOCK_CLIENTS: ClientCard[] = [
  {
    id: "evt-1",
    title: "Perera Wedding",
    couple: "Kavindu & Naduni",
    email: "perera.family@email.com",
    weddingDate: "2026-09-14",
    budget: 4650000,
    completion: 15,
    stage: "Lead",
    priority: "High",
  },
  {
    id: "evt-2",
    title: "Fernando Garden Reception",
    couple: "Rivon & Shanya",
    email: "rivon.shanya@email.com",
    weddingDate: "2026-11-02",
    budget: 6200000,
    completion: 28,
    stage: "Onboarding",
    priority: "High",
  },
  {
    id: "evt-3",
    title: "Jayasuriya Destination Wedding",
    couple: "Dilan & Minoli",
    email: "jayasuriya@email.com",
    weddingDate: "2027-01-18",
    budget: 8100000,
    completion: 56,
    stage: "Planning",
    priority: "Medium",
  },
  {
    id: "evt-4",
    title: "Silva Temple Ceremony",
    couple: "Hasara & Ramesh",
    email: "hasara.r@email.com",
    weddingDate: "2026-07-29",
    budget: 3850000,
    completion: 78,
    stage: "Execution",
    priority: "High",
  },
  {
    id: "evt-5",
    title: "De Alwis Micro Wedding",
    couple: "Sahan & Dulani",
    email: "sahan.d@email.com",
    weddingDate: "2026-05-03",
    budget: 2450000,
    completion: 100,
    stage: "Archived",
    priority: "Low",
  },
];

const priorityStyles: Record<ClientCard["priority"], string> = {
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-fuchsia-100 text-fuchsia-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export default function PlannerClientsPage() {
  const [clients, setClients] = useState<ClientCard[]>(MOCK_CLIENTS);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const totalValue = useMemo(() => clients.reduce((sum, c) => sum + c.budget, 0), [clients]);
  const activeCount = useMemo(
    () => clients.filter((c) => c.stage !== "Lead" && c.stage !== "Archived").length,
    [clients]
  );
  const weightedProgress = useMemo(() => {
    if (clients.length === 0) return 0;
    return Math.round(clients.reduce((sum, c) => sum + c.completion, 0) / clients.length);
  }, [clients]);

  const moveCard = (cardId: string, targetStage: EventLifecycleStage) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === cardId
          ? {
              ...client,
              stage: targetStage,
              completion:
                targetStage === "Lead"
                  ? 12
                  : targetStage === "Onboarding"
                  ? Math.max(client.completion, 25)
                  : targetStage === "Planning"
                  ? Math.max(client.completion, 45)
                  : targetStage === "Execution"
                  ? Math.max(client.completion, 70)
                  : 100,
            }
          : client
      )
    );
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Planner CRM Board</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Clients Pipeline</h1>
            <p className="mt-1 text-sm text-slate-500">Drag and drop each client event through lifecycle stages.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-black">
            <UserRoundPlus size={16} />
            Add New Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <article className="col-span-12 rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Managed Clients</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{clients.length}</p>
            </div>
          </div>
        </article>
        <article className="col-span-12 rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
              <CircleDollarSign size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Pipeline Value</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                LKR {totalValue.toLocaleString("en-LK")}
              </p>
            </div>
          </div>
        </article>
        <article className="col-span-12 rounded-[1.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CalendarClock size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Active / Progress</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{activeCount} · {weightedProgress}%</p>
            </div>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {STAGES.map((stage) => {
          const stageItems = clients.filter((client) => client.stage === stage);
          return (
            <section
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const cardId = e.dataTransfer.getData("text/plain");
                if (cardId) moveCard(cardId, stage);
                setDraggingId(null);
              }}
              className="rounded-[1.5rem] border border-slate-200/70 bg-white/95 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{stage}</p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {stageItems.length}
                </span>
              </div>

              <div className="space-y-3">
                {stageItems.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-5 text-center text-xs text-slate-400">
                    Drop client here
                  </div>
                )}
                {stageItems.map((client) => (
                  <article
                    key={client.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", client.id);
                      setDraggingId(client.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    className={`cursor-grab rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgb(0,0,0,0.04)] transition active:cursor-grabbing ${
                      draggingId === client.id ? "opacity-60" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold tracking-tight text-slate-900">{client.title}</p>
                        <p className="truncate text-xs text-slate-500">{client.couple}</p>
                      </div>
                      <GripVertical size={14} className="mt-0.5 flex-shrink-0 text-slate-300" />
                    </div>
                    <p className="mt-2 truncate text-[11px] text-slate-400">{client.email}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{ width: `${Math.max(client.completion, 8)}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${priorityStyles[client.priority]}`}>
                        {client.priority}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">{client.completion}%</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{new Date(client.weddingDate).toLocaleDateString()}</span>
                      <span className="inline-flex items-center gap-1">
                        Open <ArrowRight size={12} />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
