export const getPollsForEvent = async (token: string, eventId: string) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/polls/event/${eventId}`;
    const response = await fetch(apiUrl, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error('Failed to fetch polls.');
    return response.json();
};

export const createPoll = async (token: string, pollData: { eventId: string; title: string; options: string[] }) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/polls`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(pollData),
    });
    if (!response.ok) throw new Error('Failed to create poll.');
    return response.json();
};

export const voteInPoll = async (token: string, pollId: string, optionId: string) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/polls/${pollId}/vote`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to vote.');
    }
    return response;
};

