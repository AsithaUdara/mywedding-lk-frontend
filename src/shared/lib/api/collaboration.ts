import { parseApiError } from "@/shared/lib/api/parseApiError";

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
  senderEmail: string;
  attachment: unknown | null;
}

function mapConversation(raw: Record<string, unknown>): Conversation {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    name: String(raw.name ?? raw.Name ?? ""),
  };
}

export function mapMessage(raw: Record<string, unknown>, conversationId?: string): Message {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    conversationId: String(raw.conversationId ?? raw.ConversationId ?? conversationId ?? ""),
    content: String(raw.content ?? raw.Content ?? ""),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
    senderId: String(raw.senderId ?? raw.SenderId ?? ""),
    senderFirstName: String(raw.senderFirstName ?? raw.SenderFirstName ?? ""),
    senderLastName: String(raw.senderLastName ?? raw.SenderLastName ?? ""),
    senderEmail: String(raw.senderEmail ?? raw.SenderEmail ?? ""),
    attachment: raw.attachment ?? raw.Attachment ?? null,
  };
}

export const getConversations = async (token: string, eventId: string): Promise<Conversation[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/events/${eventId}/conversations`;
  const response = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error("Failed to fetch conversations.");
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapConversation(row as Record<string, unknown>)
  );
};

export const getMessages = async (token: string, conversationId: string): Promise<Message[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/conversations/${conversationId}/messages`;
  const response = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error("Failed to fetch messages.");
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((row) =>
    mapMessage(row as Record<string, unknown>, conversationId)
  );
};

export const postMessage = async (token: string, conversationId: string, content: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/conversations/${conversationId}/messages`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Failed to post message."));
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return { success: true };
};
