export interface Conversation {
    id: string;
    name: string;
}

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    createdAt: string;
    senderId: string;
    senderFirstName: string;
    senderLastName: string;
    attachment: unknown | null;
}

export const getConversations = async (token: string, eventId: string): Promise<Conversation[]> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/conversations`;
    const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch conversations.');
    return response.json();
};

export const getMessages = async (token: string, conversationId: string): Promise<Message[]> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/conversations/${conversationId}/messages`;
    const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch messages.');
    return response.json();
};

export const postMessage = async (token: string, conversationId: string, content: string) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/conversations/${conversationId}/messages`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to post message.');
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return { success: true };
};

