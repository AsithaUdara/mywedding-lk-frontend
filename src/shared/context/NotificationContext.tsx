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
import { dispatchVendorProposalsUpdated } from "@/shared/lib/vendorProposalEvents";
import { dispatchVendorBookingsUpdated } from "@/shared/lib/vendorBookingEvents";
import Link from "next/link";

export type ToastNotification = {
  id: string;
  title: string;
  message: string;
  variant?: "info" | "success" | "warning";
  actionHref?: string;
  actionLabel?: string;
  actionOnClick?: () => void;
};

type NotifyOptions = {
  variant?: ToastNotification["variant"];
  action?: { href?: string; label: string; onClick?: () => void };
};

type NotificationContextType = {
  isConnected: boolean;
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  notify: (title: string, message: string, options?: NotifyOptions) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  isConnected: false,
  toasts: [],
  dismissToast: () => {},
  notify: () => {},
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

  const pushToast = useCallback(
    (
      title: string,
      message: string,
      variant: ToastNotification["variant"] = "info",
      action?: { href?: string; label: string; onClick?: () => void }
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [
        ...prev,
        {
          id,
          title,
          message,
          variant,
          actionHref: action?.href,
          actionLabel: action?.label,
          actionOnClick: action?.onClick,
        },
      ]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 12000);
    },
    []
  );

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

        const registerProposalReceived = (eventName: string) => {
          connection.off(eventName);
          connection.on(eventName, (payload: unknown) => {
            const p =
              payload && typeof payload === "object"
                ? (payload as Record<string, unknown>)
                : {};
            const eventId = String(p.eventId ?? p.EventId ?? "");
            const eventNameLabel = String(p.eventName ?? p.EventName ?? "your wedding");
            const itemCount = Number(p.itemCount ?? p.ItemCount ?? 1);
            const message = String(
              p.message ??
                p.Message ??
                `Your planner sent ${itemCount} vendor proposal${itemCount === 1 ? "" : "s"} for ${eventNameLabel}.`
            );

            if (eventId) {
              dispatchVendorProposalsUpdated(eventId);
            }

            pushToast(
              "Vendor proposals ready",
              message,
              "info",
              eventId
                ? {
                    href: `/events/${eventId}/vendors`,
                    label: "Review now",
                  }
                : undefined
            );
          });
        };

        const registerNewInquiry = (eventName: string) => {
          connection.off(eventName);
          connection.on(eventName, (payload: unknown) => {
            const p =
              payload && typeof payload === "object"
                ? (payload as Record<string, unknown>)
                : {};
            const bookingId = String(p.bookingId ?? p.BookingId ?? "");
            const eventNameLabel = String(p.eventName ?? p.EventName ?? "a wedding event");
            const serviceName = String(p.serviceName ?? p.ServiceName ?? "a service");
            const message = String(
              p.message ??
                p.Message ??
                (bookingId
                  ? `New booking request for ${serviceName} — ${eventNameLabel}.`
                  : "You have a new inquiry.")
            );

            if (bookingId) {
              dispatchVendorBookingsUpdated();
            }

            pushToast(
              bookingId ? "New booking request" : "New inquiry",
              message,
              bookingId ? "warning" : "info",
              bookingId
                ? {
                    href: "/vendor/dashboard/bookings",
                    label: "Review booking",
                  }
                : {
                    href: "/vendor/dashboard/inquiries",
                    label: "View inquiry",
                  }
            );
          });
        };

        const registerBookingConfirmed = (eventName: string) => {
          connection.off(eventName);
          connection.on(eventName, (payload: unknown) => {
            const p =
              payload && typeof payload === "object"
                ? (payload as Record<string, unknown>)
                : {};
            const eventId = String(p.eventId ?? p.EventId ?? "");
            const bookingId = String(p.bookingId ?? p.BookingId ?? "");
            const action = String(p.action ?? p.Action ?? "");
            const message = String(
              p.message ??
                p.Message ??
                "You have a booking update from your vendor."
            );

            if (eventId) {
              dispatchVendorProposalsUpdated(eventId);
            }

            const actionLink =
              action === "signContract" && bookingId
                ? {
                    href: eventId
                      ? `/contracts/sign/${bookingId}?eventId=${eventId}`
                      : `/contracts/sign/${bookingId}`,
                    label: "Sign contract",
                  }
                : action === "payDeposit" && eventId
                ? {
                    href: `/events/${eventId}/vendors`,
                    label: "Pay deposit",
                  }
                : eventId
                ? {
                    href: `/events/${eventId}/vendors`,
                    label: "Review vendors",
                  }
                : undefined;

            const title =
              action === "signContract"
                ? "Contract ready to sign"
                : action === "payDeposit"
                ? "Deposit ready"
                : action === "awaitContract"
                ? "Booking accepted"
                : "Vendor booking update";

            pushToast(title, message, action === "payDeposit" ? "success" : "info", actionLink);
          });
        };

        const registerContractSigned = (eventName: string) => {
          connection.off(eventName);
          connection.on(eventName, (payload: unknown) => {
            const p =
              payload && typeof payload === "object"
                ? (payload as Record<string, unknown>)
                : {};
            const eventId = String(p.eventId ?? p.EventId ?? "");
            const action = String(p.action ?? p.Action ?? "");
            const message = String(
              p.message ?? p.Message ?? "Vendor contract signed successfully."
            );

            if (eventId) {
              dispatchVendorProposalsUpdated(eventId);
            }

            pushToast(
              "Contract signed",
              message,
              "success",
              action === "payDeposit" && eventId
                ? {
                    href: `/events/${eventId}/vendors`,
                    label: "Pay deposit",
                  }
                : undefined
            );
          });
        };

        register("NotifyBookingApproved", "Booking approved", "success");
        register("notifyBookingApproved", "Booking approved", "success");
        registerBookingConfirmed("NotifyBookingConfirmed");
        registerBookingConfirmed("notifyBookingConfirmed");
        registerNewInquiry("NotifyNewInquiry");
        registerNewInquiry("notifyNewInquiry");
        registerProposalReceived("NotifyProposalReceived");
        registerProposalReceived("notifyProposalReceived");
        registerContractSigned("NotifyContractSigned");
        registerContractSigned("notifyContractSigned");
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

  const notify = useCallback(
    (title: string, message: string, options?: NotifyOptions) => {
      pushToast(title, message, options?.variant ?? "info", options?.action);
    },
    [pushToast]
  );

  return (
    <NotificationContext.Provider value={{ isConnected, toasts, dismissToast, notify }}>
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
            {toast.actionLabel ? (
              toast.actionOnClick ? (
                <button
                  type="button"
                  onClick={() => {
                    toast.actionOnClick?.();
                    dismissToast(toast.id);
                  }}
                  className="mt-2 inline-flex text-xs font-semibold underline"
                >
                  {toast.actionLabel}
                </button>
              ) : toast.actionHref ? (
                <Link
                  href={toast.actionHref}
                  onClick={() => dismissToast(toast.id)}
                  className="mt-2 inline-flex text-xs font-semibold underline"
                >
                  {toast.actionLabel}
                </Link>
              ) : null
            ) : null}
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
