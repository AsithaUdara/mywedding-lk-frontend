// File: src/lib/api/events.ts

// This function fetches all events for the logged-in user
export const getEvents = async (token: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events`;
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
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

// Get a single event by ID
export const getEventById = async (token: string, eventId: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}`;
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null; // Handle not found gracefully
    throw new Error('Failed to fetch event details.');
  }

  return response.json();
};
