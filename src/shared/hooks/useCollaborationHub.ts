import { useEffect, useState, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';

export interface CollaborationHubState {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  /** The most recent message pushed by ReceiveMessage — append to local chat state. */
  lastMessage: object | null;
  /** The most recent activity item pushed by ReceiveActivity — append to local feed state. */
  lastActivity: object | null;
  /** Increments each time ChecklistUpdated fires — trigger a task list refetch. */
  checklistVersion: number;
  /** Increments each time PollsUpdated fires — trigger a polls refetch. */
  pollsVersion: number;
  /** Increments each time BudgetUpdated fires — trigger a budget refetch. */
  budgetVersion: number;
  /** Increments each time InvitationAccepted fires — trigger an invitations refetch. */
  invitationsVersion: number;
}

export const useCollaborationHub = (eventId: string, token: string | null): CollaborationHubState => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<object | null>(null);
  const [lastActivity, setLastActivity] = useState<object | null>(null);
  const [checklistVersion, setChecklistVersion] = useState(0);
  const [pollsVersion, setPollsVersion] = useState(0);
  const [budgetVersion, setBudgetVersion] = useState(0);
  const [invitationsVersion, setInvitationsVersion] = useState(0);

  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const incrementChecklist = useCallback(() => setChecklistVersion(v => v + 1), []);
  const incrementPolls = useCallback(() => setPollsVersion(v => v + 1), []);
  const incrementBudget = useCallback(() => setBudgetVersion(v => v + 1), []);
  const incrementInvitations = useCallback(() => setInvitationsVersion(v => v + 1), []);

  useEffect(() => {
    if (!eventId || !token) return;
    if (connectionRef.current) return;

    const hubUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hubs/collaboration`;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = newConnection;
    setConnection(newConnection);

    let isMounted = true;

    const registerListeners = () => {
      newConnection.on('ReceiveMessage', (message: object) => {
        if (isMounted) setLastMessage(message);
      });

      newConnection.on('ReceiveActivity', (activity: object) => {
        if (isMounted) setLastActivity(activity);
      });

      newConnection.on('ChecklistUpdated', () => {
        if (isMounted) incrementChecklist();
      });

      newConnection.on('PollsUpdated', () => {
        if (isMounted) incrementPolls();
      });

      newConnection.on('BudgetUpdated', () => {
        if (isMounted) incrementBudget();
      });

      newConnection.on('InvitationAccepted', () => {
        if (isMounted) incrementInvitations();
      });
    };

    const startConnection = async () => {
      try {
        await newConnection.start();
        if (isMounted) {
          setIsConnected(true);
          await newConnection.invoke('JoinEventGroup', eventId);
          registerListeners();
        }
      } catch (err) {
        console.error('SignalR Connection Error:', err);
      }
    };

    startConnection();

    newConnection.onreconnected(async () => {
      if (isMounted) {
        setIsConnected(true);
        await newConnection.invoke('JoinEventGroup', eventId).catch(console.error);
      }
    });

    newConnection.onclose(() => {
      if (isMounted) setIsConnected(false);
    });

    return () => {
      isMounted = false;
      connectionRef.current?.invoke('LeaveEventGroup', eventId)
        .catch(() => { })
        .finally(() => {
          connectionRef.current?.stop();
          connectionRef.current = null;
          setConnection(null);
          setIsConnected(false);
        });
    };
  }, [eventId, token, incrementChecklist, incrementPolls, incrementBudget, incrementInvitations]);

  return {
    connection,
    isConnected,
    lastMessage,
    lastActivity,
    checklistVersion,
    pollsVersion,
    budgetVersion,
    invitationsVersion,
  };
};
