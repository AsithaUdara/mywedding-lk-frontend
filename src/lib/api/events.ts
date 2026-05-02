
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
  return response;
};
export interface Invitation {
  id: string;
  email: string;
  invitedAt: string;
  isAccepted: boolean;
  acceptedAt?: string;
  isExpired: boolean;
}

export const getInvitations = async (token: string, eventId: string): Promise<Invitation[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/invitations`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch invitations.');
  return response.json();
};

export const updateOrganizerRole = async (token: string, eventId: string, userId: string, data: { role: string; permissionLevel: string }) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/organizers/${userId}`;
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update member.');
  }
  return response.json();
};
