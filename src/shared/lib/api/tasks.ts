import { parseApiError } from "@/shared/lib/api/parseApiError";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: 'ToDo' | 'InProgress' | 'Completed';
    startDate: string | null;
    dueDate: string | null;
    dependsOnTaskId: string | null;
    assignedToUserId: string | null;
    createdAt: string | null;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    dueDate?: string;
}

function mapTask(raw: Record<string, unknown>): Task {
    const status = String(raw.status ?? raw.Status ?? "ToDo");
    const normalizedStatus =
        status === "InProgress" || status === "Completed" || status === "ToDo"
            ? status
            : ("ToDo" as Task["status"]);
    return {
        id: String(raw.id ?? raw.Id ?? ""),
        title: String(raw.title ?? raw.Title ?? ""),
        description:
            raw.description != null || raw.Description != null
                ? String(raw.description ?? raw.Description)
                : null,
        status: normalizedStatus,
        startDate:
            raw.startDate != null || raw.StartDate != null
                ? String(raw.startDate ?? raw.StartDate)
                : null,
        dueDate:
            raw.dueDate != null || raw.DueDate != null
                ? String(raw.dueDate ?? raw.DueDate)
                : null,
        dependsOnTaskId:
            raw.dependsOnTaskId != null || raw.DependsOnTaskId != null
                ? String(raw.dependsOnTaskId ?? raw.DependsOnTaskId)
                : null,
        assignedToUserId:
            raw.assignedToUserId != null || raw.AssignedToUserId != null
                ? String(raw.assignedToUserId ?? raw.AssignedToUserId)
                : null,
        createdAt:
            raw.createdAt != null || raw.CreatedAt != null
                ? String(raw.createdAt ?? raw.CreatedAt)
                : null,
    };
}

export const getTasksForEvent = async (token: string, eventId: string): Promise<Task[]> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/tasks`;
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch tasks.');
    const data = await response.json();
    return (Array.isArray(data) ? data : []).map((row) => mapTask(row as Record<string, unknown>));
};

export const createTask = async (token: string, eventId: string, taskData: CreateTaskData) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/tasks`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to create task.');
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
        return null;
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
};

export const patchTaskSchedule = async (
    token: string,
    eventId: string,
    taskId: string,
    payload: { startDate?: string; dueDate?: string; dependsOnTaskId?: string | null; updateDependency?: boolean }
) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/tasks/${taskId}`;
    const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to update task schedule.');
    }
};

export const realignEventTaskSchedule = async (
    token: string,
    eventId: string
): Promise<{ tasksUpdated: number; tasksSkipped: number; message: string }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/tasks/realign-schedule`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to realign task schedule.');
    }
    const data = await response.json();
    return {
        tasksUpdated: Number(data.tasksUpdated ?? 0),
        tasksSkipped: Number(data.tasksSkipped ?? 0),
        message: String(data.message ?? 'Schedule realigned.'),
    };
};

export const generateDiscoveryTasks = async (
  token: string,
  eventId: string
): Promise<{ message: string; tasksCreated: number; taskPlanPhase: string }> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/tasks/generate-discovery`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to generate discovery tasks."));
  }
  return response.json();
};

export const generateFullChecklist = async (
    token: string,
    eventId: string
): Promise<{ message: string; tasksCreated: number; taskPlanPhase: string }> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/tasks/generate-checklist`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error(await parseApiError(response, 'Failed to generate master checklist.'));
    }
    return response.json();
};

export const updateTaskStatus = async (token: string, taskId: string, newStatus: 'ToDo' | 'InProgress' | 'Completed') => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tasks/${taskId}/status`;
    const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus }),
    });
    if (!response.ok) {
        throw new Error(await parseApiError(response, "Failed to update task status."));
    }
};

