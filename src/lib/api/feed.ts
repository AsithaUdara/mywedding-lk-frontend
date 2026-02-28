export interface ActivityFeedItem {
    id: string;
    itemType: 'SystemLog' | 'UserComment';
    content: string;
    createdAt: string;
    userId: string;
    userFirstName: string;
    userLastName: string;
}

export const getActivityFeed = async (token: string, eventId: string): Promise<ActivityFeedItem[]> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/activity`;
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch activity feed.');
    return response.json();
};

export const postComment = async (token: string, eventId: string, content: string) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/activity/comments`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post comment.');
    }
    return response.json();
};
