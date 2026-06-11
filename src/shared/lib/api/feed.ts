import { parseApiError } from "@/shared/lib/api/parseApiError";

export interface ActivityFeedItem {
    id: string;
    itemType: 'SystemLog' | 'UserComment';
    content: string;
    createdAt: string;
    userId: string;
    userFirstName: string;
    userLastName: string;
    actorDisplayName?: string;
    userEmail?: string;
}

function mapActivityFeedItem(raw: Record<string, unknown>): ActivityFeedItem {
    const itemTypeRaw = String(raw.itemType ?? raw.ItemType ?? "SystemLog");
    const itemType: ActivityFeedItem["itemType"] =
        itemTypeRaw === "UserComment" ? "UserComment" : "SystemLog";

    return {
        id: String(raw.id ?? raw.Id ?? ""),
        itemType,
        content: String(raw.content ?? raw.Content ?? ""),
        createdAt: String(raw.createdAt ?? raw.CreatedAt ?? raw.timestampUtc ?? raw.TimestampUtc ?? ""),
        userId: String(raw.userId ?? raw.UserId ?? raw.actorId ?? raw.ActorId ?? ""),
        userFirstName: String(raw.userFirstName ?? raw.UserFirstName ?? raw.actorFirstName ?? raw.ActorFirstName ?? ""),
        userLastName: String(raw.userLastName ?? raw.UserLastName ?? raw.actorLastName ?? raw.ActorLastName ?? ""),
        actorDisplayName: String(
            raw.actorDisplayName ?? raw.ActorDisplayName ?? ""
        ) || undefined,
        userEmail: String(raw.userEmail ?? raw.UserEmail ?? raw.actorEmail ?? raw.ActorEmail ?? "") || undefined,
    };
}

export const getActivityFeed = async (token: string, eventId: string): Promise<ActivityFeedItem[]> => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/activity`;
    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error(await parseApiError(response, 'Failed to fetch activity feed.'));
    }
    const data = await response.json();
    return (Array.isArray(data) ? data : []).map((row) =>
        mapActivityFeedItem(row as Record<string, unknown>)
    );
};

/** Optional user comment — not required for task updates (server writes audit log). */
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
        throw new Error(await parseApiError(response, 'Failed to post comment.'));
    }
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json();
    }
    return { success: true };
};
