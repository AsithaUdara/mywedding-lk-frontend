export const sendInvitation = async (token: string, inviteData: { eventId: string; email: string; role?: string; permissionLevel?: string }) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/invitations/invite`;
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

export const acceptInvitation = async (token: string, acceptData: { token: string }) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/invitations/accept`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(acceptData),
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.indexOf("application/json") !== -1;

    if (!response.ok) {
        if (isJson) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to accept invitation.');
        } else {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to accept invitation.');
        }
    }

    if (isJson) {
        return response.json();
    }
    return response;
};

