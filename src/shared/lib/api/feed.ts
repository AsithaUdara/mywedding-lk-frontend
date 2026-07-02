import { apiRequest, apiRequestJson } from "@/shared/lib/api/apiRequest";

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
    const data = await apiRequestJson<unknown[]>(
        token,
        `/api/events/${eventId}/activity`,
        { method: "GET" },
        { fallbackError: "Failed to fetch activity feed." }
    );
    return (Array.isArray(data) ? data : []).map((row) =>
        mapActivityFeedItem(row as Record<string, unknown>)
    );
};

/** Optional user comment — not required for task updates (server writes audit log). */
export const postComment = async (token: string, eventId: string, content: string) => {
    const response = await apiRequest(
        token,
        `/api/events/${eventId}/activity/comments`,
        {
            method: "POST",
            body: JSON.stringify({ content }),
        },
        { fallbackError: "Failed to post comment." }
    );
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        return response.json();
    }
    return { success: true };
};
