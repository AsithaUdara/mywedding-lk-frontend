"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';

interface RealTimeContextType {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
    // We can add specific "last updated" timestamps to trigger re-fetches in child components
    checklistVersion: number;
    budgetVersion: number;
    pollsVersion: number;
    activityVersion: number;
    lastMessage: any | null;
}

const RealTimeContext = createContext<RealTimeContextType>({
    connection: null,
    isConnected: false,
    checklistVersion: 0,
    budgetVersion: 0,
    pollsVersion: 0,
    activityVersion: 0,
    lastMessage: null,
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
    const [lastMessage, setLastMessage] = useState<any | null>(null);

    const incrementChecklist = useCallback(() => setChecklistVersion(v => v + 1), []);
    const incrementBudget = useCallback(() => setBudgetVersion(v => v + 1), []);
    const incrementPolls = useCallback(() => setPollsVersion(v => v + 1), []);
    const incrementActivity = useCallback(() => setActivityVersion(v => v + 1), []);

    useEffect(() => {
        if (!user || !eventId) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hubs/collaboration`, {
                accessTokenFactory: () => user.getIdToken(),
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        const startConnection = async () => {
            try {
                await newConnection.start();
                console.log('📡 SignalR Connected to CollaborationHub');
                setIsConnected(true);

                // Join the specific event group
                await newConnection.invoke('JoinEventGroup', eventId);
                console.log(`📡 Joined Event Group: ${eventId}`);

                // Register listeners
                newConnection.on('ReceiveMessage', (message) => {
                    console.log('📩 Real-time Message Received:', message);
                    setLastMessage(message);
                });

                newConnection.on('ReceiveActivity', (activity) => {
                    console.log('⚡ Real-time Activity Received:', activity);
                    incrementActivity();
                });

                newConnection.on('ChecklistUpdated', () => {
                    console.log('✅ Real-time Checklist Update Signal');
                    incrementChecklist();
                });

                newConnection.on('BudgetUpdated', () => {
                    console.log('💰 Real-time Budget Update Signal');
                    incrementBudget();
                });

                newConnection.on('PollsUpdated', () => {
                    console.log('📊 Real-time Polls Update Signal');
                    incrementPolls();
                });

            } catch (err) {
                console.error('❌ SignalR Connection Error:', err);
                setIsConnected(false);
            }
        };

        startConnection();

        return () => {
            if (newConnection) {
                newConnection.stop();
            }
        };
    }, [user, eventId, incrementChecklist, incrementBudget, incrementPolls, incrementActivity]);

    return (
        <RealTimeContext.Provider value={{
            connection,
            isConnected,
            checklistVersion,
            budgetVersion,
            pollsVersion,
            activityVersion,
            lastMessage
        }}>
            {children}
        </RealTimeContext.Provider>
    );
};
