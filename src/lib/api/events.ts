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

// --- NEW TYPES FOR BUDGET & EXPENSE ---
export interface BudgetOverview {
  eventId: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
}

export interface AddExpenseData {
  title: string;
  amount: number;
  expenseDate: string;
  budgetCategoryId: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  expenseDate: string;
  budgetCategoryId: string;
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


// --- NEW FUNCTIONS FOR BUDGET MANAGEMENT ---

// 1. Get the budget overview for a specific event
export const getBudgetOverview = async (token: string, eventId: string): Promise<BudgetOverview> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/budget`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch budget overview.');
  return response.json();
};

// 2. Set the total budget for an event
export const setTotalBudget = async (token: string, eventId: string, totalBudget: number) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/budget`;
  console.log('🌐 API Call:', {
    method: 'PUT',
    url: apiUrl,
    body: { totalBudget },
    eventId
  });
  
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ totalBudget }),
  });
  
  console.log('📡 API Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ API Error:', errorData);
    throw new Error(errorData.message || 'Failed to set total budget.');
  }
  return response;
};

// 3. Add a new expense to an event
export const addExpense = async (token: string, eventId: string, expenseData: AddExpenseData) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/expenses`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expenseData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add expense.');
  }
  return response.json();
};

// 4. Get the list of all available budget categories
export const getBudgetCategories = async (token: string): Promise<BudgetCategory[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/budget-categories`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch budget categories.');
  return response.json();
};

// 5. Get all expenses for a specific event
export const getExpenses = async (token: string, eventId: string): Promise<Expense[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/expenses`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch expenses.');
  return response.json();
};

// --- NEW FUNCTION: Set the style preferences for an event ---
export const setEventPreferences = async (token: string, eventId: string, preferences: Record<string, string>) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/preferences`;
  
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save preferences.');
  }
  // A PUT request that returns 204 No Content will not have a body to parse
  return response;
};
