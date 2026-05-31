"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getBookingPaymentStatus } from "@/shared/lib/api/vendors";
import { cn } from "@/shared/lib/cn";
import { rf } from "@/modules/design-system/regal-frost/tokens";

interface SyncPaymentStatusButtonProps {
  bookingId: string;
  onSynced?: () => void | Promise<void>;
  className?: string;
  variant?: "default" | "glass";
}

export function SyncPaymentStatusButton({
  bookingId,
  onSynced,
  className,
  variant = "default",
}: SyncPaymentStatusButtonProps) {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!user || syncing) return;
    setSyncing(true);
    try {
      const token = await user.getIdToken();
      await getBookingPaymentStatus(token, bookingId);
      await onSynced?.();
    } catch (err) {
      console.error("Failed to sync payment status:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleSync()}
      disabled={syncing}
      title="Sync payment status"
      aria-label="Sync payment status"
      className={cn(
        variant === "glass"
          ? cn(rf.navBtn, "disabled:cursor-not-allowed disabled:opacity-50")
          : cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors duration-200",
              "hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50"
            ),
        className
      )}
    >
      <RefreshCw size={14} className={syncing ? "animate-spin" : undefined} aria-hidden />
    </button>
  );
}
