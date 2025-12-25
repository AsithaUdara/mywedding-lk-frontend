// File: src/lib/api/events.ts

// --- Define the data structures (Types) for our API calls ---

// Represents the data for a single event organizer
export interface Organizer {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissionLevel: string;
}

// Represents the data we need to send when inviting a new member
export interface InviteData {
  email: string;
  role: string;
  permissionLevel: string;
}


// --- API Functions ---

// This function fetches all events for the logged-in user
export const getEvents = async (token: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events`;
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch events.');
  }
  return response.json();
};

// This function creates a new event
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

// This function fetches a single event by its ID
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


// --- NEW FUNCTION: Get all organizers for a specific event ---
export const getOrganizers = async (token: string, eventId: string): Promise<Organizer[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/organizers`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch event organizers.');
  }
  return response.json();
};


// --- NEW FUNCTION: Invite a new organizer to an event ---
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
