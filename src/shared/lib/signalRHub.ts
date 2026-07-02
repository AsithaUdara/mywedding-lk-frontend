import * as signalR from "@microsoft/signalr";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const BENIGN_LOG_PATTERNS = [
  "stopped during negotiation",
  "Failed to start the HttpConnection before stop()",
  "Failed to start the connection",
  "AbortError",
];

/** Prevents benign Strict Mode races from surfacing as Next.js console errors. */
function createSignalRLogger(): signalR.ILogger {
  return {
    log(logLevel: signalR.LogLevel, message: string) {
      if (BENIGN_LOG_PATTERNS.some((p) => message.includes(p))) {
        return;
      }
      if (logLevel >= signalR.LogLevel.Warning) {
        console.warn(`[SignalR] ${message}`);
      }
    },
  };
}

export function isBenignSignalRError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return BENIGN_LOG_PATTERNS.some((p) => message.includes(p));
}

/**
 * Builds a SignalR hub connection with negotiate + automatic reconnect.
 * Avoid skipNegotiation unless the server is explicitly WebSocket-only.
 */
export function createHubConnection(
  hubPath: string,
  accessTokenFactory: () => string | Promise<string>
): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE}${hubPath}`, {
      accessTokenFactory,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(createSignalRLogger())
    .build();
}

/** Wait until the connection is fully disconnected (e.g. after a deferred stop). */
export async function waitForHubDisconnected(
  connection: signalR.HubConnection,
  timeoutMs = 3000
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (
    connection.state !== signalR.HubConnectionState.Disconnected &&
    Date.now() < deadline
  ) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/** Start hub with retries; returns false if realtime is unavailable (non-fatal). */
export async function startHubConnection(
  connection: signalR.HubConnection,
  options?: { maxAttempts?: number }
): Promise<boolean> {
  const maxAttempts = options?.maxAttempts ?? 4;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (connection.state === signalR.HubConnectionState.Disconnecting) {
        await waitForHubDisconnected(connection);
      }

      if (connection.state === signalR.HubConnectionState.Disconnected) {
        await connection.start();
      } else if (connection.state === signalR.HubConnectionState.Connecting) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      return connection.state === signalR.HubConnectionState.Connected;
    } catch (err) {
      if (isBenignSignalRError(err) && attempt < maxAttempts) {
        if (connection.state === signalR.HubConnectionState.Disconnecting) {
          await waitForHubDisconnected(connection);
        }
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
        continue;
      }

      if (attempt === maxAttempts && !isBenignSignalRError(err)) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "SignalR unavailable — continuing without live notifications. Is the API running on NEXT_PUBLIC_API_BASE_URL?",
            err
          );
        }
      }

      if (attempt === maxAttempts) {
        return false;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(1000 * 2 ** (attempt - 1), 8000))
      );
    }
  }

  return false;
}
