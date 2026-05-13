export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: 'ToDo' | 'InProgress' | 'Completed';
    dueDate: string | null;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    dueDate?: string;
}

export const getTasksForEvent = async (token: string, eventId: string): Promise<Task[]> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/tasks`;
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch tasks.');
    return response.json();
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task.');
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task status.');
    }
    return response;
};

