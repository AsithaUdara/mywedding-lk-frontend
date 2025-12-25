// File: src/lib/api/events.ts

// --- Define the data structures (Types) for our API calls ---

export interface Organizer {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissionLevel: string;
}

export interface InviteData {
  email: string;
  role: string;
  permissionLevel: string;
}

// --- NEW TYPES FOR TASKS ---
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


// --- API Functions for Events & Organizers (Existing) ---

export const getEvents = async (token: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch events.');
  return response.json();
};

export const createEvent = async (token: string, eventData: { eventName: string; eventDate: string; }) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create event.');
  }
  return response.json();
};

export const getEventById = async (token: string, eventId: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch event details.');
  }
  return response.json();
};

export const getOrganizers = async (token: string, eventId: string): Promise<Organizer[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/organizers`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch event organizers.');
  return response.json();
};

export const inviteOrganizer = async (token: string, eventId: string, inviteData: InviteData) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/organizers`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inviteData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send invitation.');
  }
  return response.json();
};


// --- NEW FUNCTIONS FOR TASK MANAGEMENT ---

// 1. Get all tasks for a specific event
export const getTasksForEvent = async (token: string, eventId: string): Promise<Task[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/tasks`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch tasks.');
  return response.json();
};

// 2. Create a new task for an event
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

// 3. Update the status of a specific task
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
  // A PUT request that returns 204 No Content will not have a JSON body to parse
  return response;
};
