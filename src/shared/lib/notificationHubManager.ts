import * as signalR from "@microsoft/signalr";
import {
  createHubConnection,
  isBenignSignalRError,
  startHubConnection,
  waitForHubDisconnected,
} from "@/shared/lib/signalRHub";

/** Delay stop so React Strict Mode remount can cancel it before negotiate is aborted. */
const STOP_DELAY_MS = 800;

let sharedConnection: signalR.HubConnection | null = null;
let sharedUserId: string | null = null;
let retainCount = 0;
let startPromise: Promise<boolean> | null = null;
let pendingStopTimer: ReturnType<typeof setTimeout> | null = null;

function cancelPendingStop(): void {
  if (pendingStopTimer !== null) {
    clearTimeout(pendingStopTimer);
    pendingStopTimer = null;
  }
}

function scheduleStopIfIdle(): void {
  cancelPendingStop();
  pendingStopTimer = setTimeout(() => {
    pendingStopTimer = null;
    if (retainCount > 0) return;

    const conn = sharedConnection;
    sharedConnection = null;
    sharedUserId = null;
    startPromise = null;

    if (conn && conn.state !== signalR.HubConnectionState.Disconnected) {
      void conn.stop().catch(() => {});
    }
  }, STOP_DELAY_MS);
}

async function ensureStarted(connection: signalR.HubConnection): Promise<boolean> {
  let state = connection.state;
  if (state === signalR.HubConnectionState.Connected) {
    return true;
  }

  if (state === signalR.HubConnectionState.Connecting) {
    await new Promise((r) => setTimeout(r, 350));
    state = connection.state;
    if (state === signalR.HubConnectionState.Connected) {
      return true;
    }
  }

  if (!startPromise) {
    startPromise = startHubConnection(connection).finally(() => {
      startPromise = null;
    });
  }

  try {
    return await startPromise;
  } catch (err) {
    if (isBenignSignalRError(err)) {
      await waitForHubDisconnected(connection, 2000);
      return startHubConnection(connection, { maxAttempts: 3 });
    }
    return false;
  }
}

/** Reference-counted hub; deferred stop avoids stop-during-negotiate in Strict Mode. */
export async function retainNotificationHub(
  userId: string,
  getToken: () => Promise<string>
): Promise<signalR.HubConnection | null> {
  cancelPendingStop();
  retainCount += 1;

  if (sharedConnection && sharedUserId !== userId) {
    cancelPendingStop();
    const previous = sharedConnection;
    sharedConnection = null;
    sharedUserId = null;
    startPromise = null;
    await previous.stop().catch(() => {});
  }

  if (!sharedConnection) {
    sharedConnection = createHubConnection("/hubs/notifications", getToken);
    sharedUserId = userId;
  }

  await ensureStarted(sharedConnection);
  return sharedConnection;
}

export function releaseNotificationHub(): void {
  retainCount = Math.max(0, retainCount - 1);
  if (retainCount > 0) {
    cancelPendingStop();
    return;
  }
  scheduleStopIfIdle();
}
