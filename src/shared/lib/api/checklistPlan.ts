import { apiRequestJson, apiUrl } from "@/shared/lib/api/apiRequest";
import { plannerFetch } from "@/shared/lib/api/plannerHttp";
import { parseApiError } from "@/shared/lib/api/parseApiError";

export interface ChecklistPreviewTask {
  templateIndex: number;
  title: string;
  startDate: string;
  dueDate: string;
  includedByDefault: boolean;
  excludedByAi: boolean;
}

export interface ChecklistPlanPreview {
  eventId: string;
  eventName: string;
  weddingDate: string;
  taskPlanPhase: string;
  isBriefComplete: boolean;
  briefCompletionPercent: number;
  discoveryTaskCount: number;
  existingTaskCount: number;
  canGenerateFullChecklist: boolean;
  templateTasks: ChecklistPreviewTask[];
  brief: {
    estimatedGuestCount: number | null;
    guestCountMax: number | null;
    weddingStyle: string | null;
    venuePreference: string | null;
    mustHavesNotes: string | null;
    servicesAlreadyBooked: string | null;
    culturalOrReligiousNotes: string | null;
  };
}

export interface PersonalizedChecklistPlan {
  executiveSummary: string;
  excludeTemplateTitles: string[];
  additionalTasks: {
    title: string;
    description: string | null;
    priority: string;
  }[];
  templatePreview: {
    templateIndex: number;
    title: string;
    includedByDefault: boolean;
    excludedByPlan: boolean;
  }[];
  isSimulated: boolean;
}

function mapPreview(raw: Record<string, unknown>): ChecklistPlanPreview {
  const brief = (raw.brief ?? raw.Brief ?? {}) as Record<string, unknown>;
  const tasks = (raw.templateTasks ?? raw.TemplateTasks ?? []) as Record<string, unknown>[];
  return {
    eventId: String(raw.eventId ?? raw.EventId ?? ""),
    eventName: String(raw.eventName ?? raw.EventName ?? ""),
    weddingDate: String(raw.weddingDate ?? raw.WeddingDate ?? ""),
    taskPlanPhase: String(raw.taskPlanPhase ?? raw.TaskPlanPhase ?? "None"),
    isBriefComplete: Boolean(raw.isBriefComplete ?? raw.IsBriefComplete),
    briefCompletionPercent: Number(raw.briefCompletionPercent ?? raw.BriefCompletionPercent ?? 0),
    discoveryTaskCount: Number(raw.discoveryTaskCount ?? raw.DiscoveryTaskCount ?? 0),
    existingTaskCount: Number(raw.existingTaskCount ?? raw.ExistingTaskCount ?? 0),
    canGenerateFullChecklist: Boolean(raw.canGenerateFullChecklist ?? raw.CanGenerateFullChecklist),
    templateTasks: tasks.map((t) => ({
      templateIndex: Number(t.templateIndex ?? t.TemplateIndex ?? 0),
      title: String(t.title ?? t.Title ?? ""),
      startDate: String(t.startDate ?? t.StartDate ?? ""),
      dueDate: String(t.dueDate ?? t.DueDate ?? ""),
      includedByDefault: Boolean(t.includedByDefault ?? t.IncludedByDefault ?? true),
      excludedByAi: Boolean(t.excludedByAi ?? t.ExcludedByAi ?? false),
    })),
    brief: {
      estimatedGuestCount:
        brief.estimatedGuestCount != null ? Number(brief.estimatedGuestCount) : null,
      guestCountMax: brief.guestCountMax != null ? Number(brief.guestCountMax) : null,
      weddingStyle: brief.weddingStyle != null ? String(brief.weddingStyle) : null,
      venuePreference: brief.venuePreference != null ? String(brief.venuePreference) : null,
      mustHavesNotes: brief.mustHavesNotes != null ? String(brief.mustHavesNotes) : null,
      servicesAlreadyBooked:
        brief.servicesAlreadyBooked != null ? String(brief.servicesAlreadyBooked) : null,
      culturalOrReligiousNotes:
        brief.culturalOrReligiousNotes != null ? String(brief.culturalOrReligiousNotes) : null,
    },
  };
}

export async function getChecklistPreview(
  token: string,
  eventId: string
): Promise<ChecklistPlanPreview> {
  const data = await apiRequestJson<Record<string, unknown>>(
    token,
    `/api/events/${eventId}/checklist-preview`,
    { method: "GET" },
    { fallbackError: "Failed to load checklist preview." }
  );
  return mapPreview(data);
}

export async function generatePersonalizedChecklistPlan(
  token: string,
  eventId: string,
  meetingNotesOrTranscript?: string
): Promise<PersonalizedChecklistPlan> {
  const response = await plannerFetch(token, apiUrl("/api/planner/ai/personalize-checklist-plan"), {
    method: "POST",
    body: JSON.stringify({ eventId, meetingNotesOrTranscript }),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to generate checklist plan."));
  }
  const data = (await response.json()) as Record<string, unknown>;
  const additional = (data.additionalTasks ?? data.AdditionalTasks ?? []) as Record<string, unknown>[];
  const lines = (data.templatePreview ?? data.TemplatePreview ?? []) as Record<string, unknown>[];
  return {
    executiveSummary: String(data.executiveSummary ?? data.ExecutiveSummary ?? ""),
    excludeTemplateTitles: (data.excludeTemplateTitles ?? data.ExcludeTemplateTitles ?? []) as string[],
    additionalTasks: additional.map((t) => ({
      title: String(t.title ?? t.Title ?? ""),
      description:
        t.description != null || t.Description != null
          ? String(t.description ?? t.Description)
          : null,
      priority: String(t.priority ?? t.Priority ?? "Medium"),
    })),
    templatePreview: lines.map((l) => ({
      templateIndex: Number(l.templateIndex ?? l.TemplateIndex ?? 0),
      title: String(l.title ?? l.Title ?? ""),
      includedByDefault: Boolean(l.includedByDefault ?? l.IncludedByDefault ?? true),
      excludedByPlan: Boolean(l.excludedByPlan ?? l.ExcludedByPlan ?? false),
    })),
    isSimulated: Boolean(data.isSimulated ?? data.IsSimulated),
  };
}

export async function applyChecklistPlan(
  token: string,
  eventId: string,
  payload: {
    excludeTemplateTitles: string[];
    additionalTasks: { title: string; description?: string | null }[];
    markBriefComplete?: boolean;
  }
): Promise<{ message: string; tasksCreated: number; taskPlanPhase: string }> {
  return apiRequestJson(
    token,
    `/api/events/${eventId}/tasks/generate-checklist`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { fallbackError: "Failed to apply checklist plan." }
  );
}
