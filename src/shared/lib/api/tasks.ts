import { apiRequest, apiRequestJson } from "@/shared/lib/api/apiRequest";
import { tasksSchema } from "@/shared/lib/api/schemas/tasks";

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: 'ToDo' | 'InProgress' | 'Completed';
    startDate: string | null;
    dueDate: string | null;
    dependsOnTaskId: string | null;
    assignedToUserId: string | null;
    assignedToName: string | null;
    createdAt: string | null;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    dueDate?: string;
    startDate?: string;
    dependsOnTaskId?: string;
}

export interface UpdateTaskData {
    title: string;
    description?: string | null;
    status?: Task["status"];
    startDate?: string | null;
    dueDate?: string | null;
    dependsOnTaskId?: string | null;
    updateDependency?: boolean;
}

export const getTasksForEvent = async (token: string, eventId: string): Promise<Task[]> => {
    const data = await apiRequestJson<unknown>(
        token,
        `/api/events/${eventId}/tasks`,
        { method: "GET" },
        { fallbackError: "Failed to fetch tasks." }
    );
    return tasksSchema.parse(data);
};

export const createTask = async (token: string, eventId: string, taskData: CreateTaskData) => {
    const response = await apiRequest(
        token,
        `/api/events/${eventId}/tasks`,
        {
            method: "POST",
            body: JSON.stringify(taskData),
        },
        { fallbackError: "Failed to create task." }
    );
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
    await apiRequest(
        token,
        `/api/events/${eventId}/tasks/${taskId}`,
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        },
        { fallbackError: "Failed to update task schedule." }
    );
};

export const realignEventTaskSchedule = async (
    token: string,
    eventId: string
): Promise<{ tasksUpdated: number; tasksSkipped: number; message: string }> => {
    const data = await apiRequestJson<Record<string, unknown>>(
        token,
        `/api/events/${eventId}/tasks/realign-schedule`,
        { method: "POST" },
        { fallbackError: "Failed to realign task schedule." }
    );
    return {
        tasksUpdated: Number(data.tasksUpdated ?? 0),
        tasksSkipped: Number(data.tasksSkipped ?? 0),
        message: String(data.message ?? "Schedule realigned."),
    };
};

export const generateDiscoveryTasks = async (
  token: string,
  eventId: string
): Promise<{ message: string; tasksCreated: number; taskPlanPhase: string }> => {
  return apiRequestJson(
    token,
    `/api/events/${eventId}/tasks/generate-discovery`,
    { method: "POST" },
    { fallbackError: "Failed to generate discovery tasks." }
  );
};

export const generateFullChecklist = async (
    token: string,
    eventId: string
): Promise<{ message: string; tasksCreated: number; taskPlanPhase: string }> => {
    return apiRequestJson(
        token,
        `/api/events/${eventId}/tasks/generate-checklist`,
        { method: "POST" },
        { fallbackError: "Failed to generate master checklist." }
    );
};

export const updateTask = async (
    token: string,
    eventId: string,
    taskId: string,
    payload: UpdateTaskData
) => {
    await apiRequest(
        token,
        `/api/events/${eventId}/tasks/${taskId}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
        },
        { fallbackError: "Failed to update task." }
    );
};

export const deleteTask = async (token: string, eventId: string, taskId: string) => {
    await apiRequest(
        token,
        `/api/events/${eventId}/tasks/${taskId}`,
        { method: "DELETE" },
        { fallbackError: "Failed to delete task." }
    );
};

export const updateTaskStatus = async (token: string, taskId: string, newStatus: 'ToDo' | 'InProgress' | 'Completed') => {
    await apiRequest(
        token,
        `/api/tasks/${taskId}/status`,
        {
            method: "PUT",
            body: JSON.stringify({ newStatus }),
        },
        { fallbackError: "Failed to update task status." }
    );
};

export const assignTask = async (
    token: string,
    taskId: string,
    assignedToUserId: string | null
) => {
    await apiRequest(
        token,
        `/api/tasks/${taskId}/assign`,
        {
            method: "PUT",
            body: JSON.stringify({ assignedToUserId }),
        },
        { fallbackError: "Failed to assign task." }
    );
};

/** @deprecated Import parseApiError from parseApiError.ts if needed */
