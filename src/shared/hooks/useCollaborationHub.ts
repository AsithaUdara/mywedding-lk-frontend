import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export const useCollaborationHub = (eventId: string, token: string | null) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!eventId || !token) return;

    // Avoid multiple connections
    if (connectionRef.current) return;

    const hubUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hubs/collaboration`;
    
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = newConnection;
    setConnection(newConnection);

    const startConnection = async () => {
      try {
        await newConnection.start();
        setIsConnected(true);
        console.log(`Connected to CollaborationHub for event: ${eventId}`);

        // Join the event group
        await newConnection.invoke("JoinEventGroup", eventId);
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
      }
    };

    startConnection();

    newConnection.onreconnected(() => {
      setIsConnected(true);
      newConnection.invoke("JoinEventGroup", eventId).catch(console.error);
    });

    newConnection.onclose(() => {
      setIsConnected(false);
    });

    return () => {
      if (connectionRef.current) {
        // Leave the group before stopping
        connectionRef.current.invoke("LeaveEventGroup", eventId).catch(console.error).finally(() => {
          connectionRef.current?.stop();
          connectionRef.current = null;
          setConnection(null);
          setIsConnected(false);
        });
      }
    };
  }, [eventId, token]);

  return { connection, isConnected };
};
