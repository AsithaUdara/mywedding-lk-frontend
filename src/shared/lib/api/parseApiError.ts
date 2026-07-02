/** Extract user-facing text from API error bodies (ProblemDetails or legacy `{ message }`). */
export async function parseApiError(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as {
      detail?: string;
      message?: string;
      title?: string;
      errors?: Record<string, string[]>;
    };
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (first) return first;
    }
    if (data.title && data.title !== 'Forbidden' && data.title !== 'Bad Request') {
      return data.title;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}
