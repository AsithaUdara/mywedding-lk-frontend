import { apiFetch } from "@/shared/lib/api/apiClient";
import { apiUrl } from "@/shared/lib/api/apiRequest";

export type SendInvitationResult = {
  invitationId: string;
  emailSent: boolean;
  acceptUrl: string;
  emailError?: string | null;
  message: string;
};

export async function sendInvitation(
  token: string,
  inviteData: { eventId: string; email: string; role?: string; permissionLevel?: string }
): Promise<SendInvitationResult> {
  const response = await apiFetch(token, apiUrl("/api/invitations/invite"), {
    method: "POST",
    body: JSON.stringify(inviteData),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (data as { message?: string }).message ||
      (data as { title?: string }).title ||
      "Failed to send invitation.";
    throw new Error(message);
  }

  return {
    invitationId: String((data as { invitationId?: string }).invitationId ?? ""),
    emailSent: Boolean((data as { emailSent?: boolean }).emailSent),
    acceptUrl: String((data as { acceptUrl?: string }).acceptUrl ?? ""),
    emailError: (data as { emailError?: string | null }).emailError ?? null,
    message: String((data as { message?: string }).message ?? "Invitation sent."),
  };
}

export async function acceptInvitation(token: string, acceptData: { token: string }) {
  const response = await apiFetch(token, apiUrl("/api/invitations/accept"), {
    method: "POST",
    body: JSON.stringify(acceptData),
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.indexOf("application/json") !== -1;

  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to accept invitation.");
    }
    const errorText = await response.text();
    throw new Error(errorText || "Failed to accept invitation.");
  }

  if (isJson) {
    return response.json();
  }
  return response;
}
