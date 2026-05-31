export type SendInvitationResult = {
  invitationId: string;
  emailSent: boolean;
  acceptUrl: string;
  emailError?: string | null;
  message: string;
};

export const sendInvitation = async (
  token: string,
  inviteData: { eventId: string; email: string; role?: string; permissionLevel?: string }
): Promise<SendInvitationResult> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/invitations/invite`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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
};

export const acceptInvitation = async (token: string, acceptData: { token: string }) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/invitations/accept`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(acceptData),
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.indexOf("application/json") !== -1;

  if (!response.ok) {
    if (isJson) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to accept invitation.");
    } else {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to accept invitation.");
    }
  }

  if (isJson) {
    return response.json();
  }
  return response;
};
