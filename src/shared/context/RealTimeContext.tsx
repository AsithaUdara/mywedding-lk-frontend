"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { mapMessage, type Message } from '@/shared/lib/api/collaboration';

interface RealTimeContextType {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
    // We can add specific "last updated" timestamps to trigger re-fetches in child components
    checklistVersion: number;
    budgetVersion: number;
    pollsVersion: number;
    activityVersion: number;
    invitationsVersion: number;
    lastMessage: Message | null;
    messageVersion: number;
}

const RealTimeContext = createContext<RealTimeContextType>({
    connection: null,
    isConnected: false,
    checklistVersion: 0,
    budgetVersion: 0,
    pollsVersion: 0,
    activityVersion: 0,
    invitationsVersion: 0,
    lastMessage: null,
    messageVersion: 0,
});

export const useRealTime = () => useContext(RealTimeContext);

export const RealTimeProvider: React.FC<{ children: React.ReactNode; eventId: string }> = ({ children, eventId }) => {
    const { user } = useAuth();
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const [checklistVersion, setChecklistVersion] = useState(0);
    const [budgetVersion, setBudgetVersion] = useState(0);
    const [pollsVersion, setPollsVersion] = useState(0);
    const [activityVersion, setActivityVersion] = useState(0);
    const [invitationsVersion, setInvitationsVersion] = useState(0);
    const [lastMessage, setLastMessage] = useState<Message | null>(null);
    const [messageVersion, setMessageVersion] = useState(0);

    const incrementChecklist = useCallback(() => setChecklistVersion(v => v + 1), []);
    const incrementBudget = useCallback(() => setBudgetVersion(v => v + 1), []);
    const incrementPolls = useCallback(() => setPollsVersion(v => v + 1), []);
    const incrementActivity = useCallback(() => setActivityVersion(v => v + 1), []);
    const incrementInvitations = useCallback(() => setInvitationsVersion(v => v + 1), []);

    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        if (!user || !eventId) return;

        let isMounted = true;

        // Custom logger to suppress the annoying "stop() was called" error produced by React StrictMode
        const customLogger = {
            log: (logLevel: signalR.LogLevel, message: string) => {
                if (message.includes("Failed to start the HttpConnection before stop() was called")) {
                    return; // Suppress this specific harmless error
                }
                if (logLevel >= signalR.LogLevel.Information) {
                    console.log(`📡 SignalR [${signalR.LogLevel[logLevel]}]: ${message}`);
                }
            }
        };

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hubs/collaboration`, {
                accessTokenFactory: () => user.getIdToken(),
            })
            .configureLogging(customLogger)
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .build();

        connectionRef.current = newConnection;

        const startConnection = async () => {
            try {
                if (newConnection.state === signalR.HubConnectionState.Disconnected) {
                    await newConnection.start();

                    if (isMounted) {
                        setIsConnected(true);
                        await newConnection.invoke('JoinEventGroup', eventId);

                        // Register listeners
                        newConnection.on('ReceiveMessage', (payload: unknown) => {
                            if (!isMounted) return;
                            const mapped = mapMessage(
                                payload && typeof payload === 'object'
                                    ? (payload as Record<string, unknown>)
                                    : {}
                            );
                            setLastMessage(mapped);
                            setMessageVersion((version) => version + 1);
                        });

                        newConnection.on('ReceiveActivity', () => {
                            if (isMounted) incrementActivity();
                        });

                        newConnection.on('ChecklistUpdated', () => {
                            if (isMounted) incrementChecklist();
                        });

                        newConnection.on('BudgetUpdated', () => {
                            if (isMounted) incrementBudget();
                        });

                        newConnection.on('PollsUpdated', () => {
                            if (isMounted) incrementPolls();
                        });

                        newConnection.on('InvitationAccepted', () => {
                            if (isMounted) incrementInvitations();
                        });
                    }
                }
            } catch (err: unknown) {
                if (isMounted && (err as { name?: string }).name !== 'AbortError') {
                    if (process.env.NODE_ENV === 'development') {
                        console.warn('Collaboration hub unavailable — page works without live sync.', err);
                    }
                    setIsConnected(false);
                }
            }
        };

        setConnection(newConnection);
        startConnection();

        return () => {
            isMounted = false;
            if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
                newConnection.stop().catch(() => { });
            }
            connectionRef.current = null;
        };
    }, [user, eventId, incrementChecklist, incrementBudget, incrementPolls, incrementActivity, incrementInvitations]);

    return (
        <RealTimeContext.Provider value={{
            connection,
            isConnected,
            checklistVersion,
            budgetVersion,
            pollsVersion,
            activityVersion,
            invitationsVersion,
            lastMessage,
            messageVersion,
        }}>
            {children}
        </RealTimeContext.Provider>
    );
};

