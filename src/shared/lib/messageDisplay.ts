import type { Message } from "@/shared/lib/api/collaboration";
import type { Organizer } from "@/shared/lib/api/events";
import { getUserDisplayName, type UserNameFields } from "@/shared/lib/userDisplay";

export function resolveMessageSender(
  message: Pick<Message, "senderId" | "senderFirstName" | "senderLastName" | "senderEmail">,
  organizers: Organizer[],
  currentUserId?: string | null
): UserNameFields & { label: string } {
  if (currentUserId && message.senderId === currentUserId) {
    return { firstName: "", lastName: "", email: "", label: "You" };
  }

  const organizer = organizers.find((member) => member.userId === message.senderId);
  const email = (message.senderEmail || organizer?.email || "").trim();
  const firstName = organizer?.firstName || message.senderFirstName;
  const lastName = organizer?.lastName || message.senderLastName;
  const label = getUserDisplayName({ firstName, lastName, email });

  return { firstName, lastName, email, label };
}

export function truncateMessagePreview(content: string, maxLength = 80): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1)}…`;
}
