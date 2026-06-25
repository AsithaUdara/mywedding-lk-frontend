import { plannerFetch } from "@/shared/lib/api/plannerHttp";
import { parseApiError } from "@/shared/lib/api/parseApiError";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export type PlannerTaskTemplateScheduleMode = "DaysBeforeWedding" | "DaysFromPlanStart";

export interface PlannerTaskTemplateListItem {
  id: string;
  name: string;
  description: string | null;
  scheduleMode: PlannerTaskTemplateScheduleMode;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

function mapTemplate(raw: Record<string, unknown>): PlannerTaskTemplateListItem {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    name: String(raw.name ?? raw.Name ?? ""),
    description:
      raw.description != null || raw.Description != null
        ? String(raw.description ?? raw.Description)
        : null,
    scheduleMode: String(
      raw.scheduleMode ?? raw.ScheduleMode ?? "DaysBeforeWedding"
    ) as PlannerTaskTemplateScheduleMode,
    taskCount: Number(raw.taskCount ?? raw.TaskCount ?? 0),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.UpdatedAt ?? ""),
  };
}

export async function getPlannerTaskTemplates(
  token: string
): Promise<PlannerTaskTemplateListItem[]> {
  const res = await plannerFetch(token, `${BASE}/api/planner/task-templates`);
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load your templates."));
  }
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapTemplate(row as Record<string, unknown>)
  );
}

export async function savePlannerTaskTemplateFromEvent(
  token: string,
  eventId: string,
  payload: { name: string; description?: string }
): Promise<{ templateId: string; taskCount: number; message: string }> {
  const res = await plannerFetch(
    token,
    `${BASE}/api/planner/task-templates/from-event/${eventId}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to save template."));
  }
  const data = (await res.json()) as Record<string, unknown>;
  return {
    templateId: String(data.templateId ?? data.TemplateId ?? ""),
    taskCount: Number(data.taskCount ?? data.TaskCount ?? 0),
    message: String(data.message ?? "Template saved."),
  };
}

export async function applyPlannerTaskTemplate(
  token: string,
  templateId: string,
  eventId: string,
  replaceExisting = false
): Promise<{ tasksCreated: number; taskPlanPhase: string; message: string }> {
  const res = await plannerFetch(
    token,
    `${BASE}/api/planner/task-templates/${templateId}/apply/${eventId}`,
    {
      method: "POST",
      body: JSON.stringify({ replaceExisting }),
    }
  );
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to apply template."));
  }
  const data = (await res.json()) as Record<string, unknown>;
  return {
    tasksCreated: Number(data.tasksCreated ?? data.TasksCreated ?? 0),
    taskPlanPhase: String(data.taskPlanPhase ?? data.TaskPlanPhase ?? ""),
    message: String(data.message ?? "Template applied."),
  };
}

export async function deletePlannerTaskTemplate(
  token: string,
  templateId: string
): Promise<void> {
  const res = await plannerFetch(token, `${BASE}/api/planner/task-templates/${templateId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to delete template."));
  }
}
