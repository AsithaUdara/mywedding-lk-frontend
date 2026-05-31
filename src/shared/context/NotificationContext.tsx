"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "./AuthContext";
import {
  releaseNotificationHub,
  retainNotificationHub,
} from "@/shared/lib/notificationHubManager";

export type ToastNotification = {
  id: string;
  title: string;
  message: string;
  variant?: "info" | "success" | "warning";
};

type NotificationContextType = {
  isConnected: boolean;
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  isConnected: false,
  toasts: [],
  dismissToast: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

function parsePayload(payload: unknown): { title: string; message: string } {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const message = String(p.message ?? p.Message ?? "You have a new update.");
    const titleFromStatus = p.status ? String(p.status) : "";
    return {
      title: titleFromStatus || "MyWedding.lk",
      message,
    };
  }
  return { title: "MyWedding.lk", message: "You have a new update." };
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;
  const userId = user?.uid ?? null;
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const handlersRegisteredRef = useRef(false);

  const pushToast = useCallback((title: string, message: string, variant: ToastNotification["variant"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, title, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 8000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (loading || !userId) {
      if (!userId) {
        setIsConnected(false);
        releaseNotificationHub();
        handlersRegisteredRef.current = false;
      }
      return;
    }

    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      return;
    }

    let cancelled = false;

    const syncConnected = (connection: signalR.HubConnection | null) => {
      if (cancelled || !connection) return;
      setIsConnected(connection.state === signalR.HubConnectionState.Connected);
    };

    void (async () => {
      const firebaseUser = userRef.current;
      if (!firebaseUser) return;

      const connection = await retainNotificationHub(userId, () => firebaseUser.getIdToken());
      if (cancelled || !connection) return;

      if (!handlersRegisteredRef.current) {
        const register = (
          eventName: string,
          title: string,
          variant: ToastNotification["variant"]
        ) => {
          connection.off(eventName);
          connection.on(eventName, (payload: unknown) => {
            const parsed = parsePayload(payload);
            pushToast(title, parsed.message, variant);
          });
        };

        register("NotifyBookingApproved", "Booking approved", "success");
        register("notifyBookingApproved", "Booking approved", "success");
        register("NotifyBookingConfirmed", "Booking confirmed", "success");
        register("notifyBookingConfirmed", "Booking confirmed", "success");
        register("NotifyNewInquiry", "New inquiry", "info");
        register("notifyNewInquiry", "New inquiry", "info");
        register("NotifyProposalReceived", "New proposal", "info");
        register("notifyProposalReceived", "New proposal", "info");
        register("NotifyContractSigned", "Contract signed", "success");
        register("notifyContractSigned", "Contract signed", "success");
        register("NotifyVendorBookingDeclined", "Vendor declined", "warning");
        register("notifyVendorBookingDeclined", "Vendor declined", "warning");

        connection.onreconnected(() => syncConnected(connection));
        connection.onclose(() => {
          if (!cancelled) setIsConnected(false);
        });

        handlersRegisteredRef.current = true;
      }

      syncConnected(connection);
    })();

    return () => {
      cancelled = true;
      releaseNotificationHub();
    };
  }, [loading, userId, pushToast]);

  return (
    <NotificationContext.Provider value={{ isConnected, toasts, dismissToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md ${
              toast.variant === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
                : toast.variant === "warning"
                ? "border-amber-200 bg-amber-50/95 text-amber-900"
                : "border-border bg-card/95 text-foreground"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{toast.title}</p>
            <p className="mt-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="mt-2 text-xs font-semibold underline opacity-70"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
