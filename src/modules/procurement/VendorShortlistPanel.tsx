"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Loader2, Send, Store, X } from "lucide-react";
import {
  approveShortlistItem,
  getVendorShortlist,
  requestBookingFromShortlist,
  sendShortlistToClient,
  type VendorShortlistItem,
} from "@/shared/lib/api/vendorShortlist";
import {
  ErrorBanner,
  SuccessBanner,
  formatLKR,
} from "@/modules/planner/components/ui";
import {
  shortlistStatusBadgeKey,
  shortlistStatusLabel,
} from "@/modules/procurement/shortlist-utils";
import { AddShortlistProposalModal } from "@/modules/procurement/AddShortlistProposalModal";
import { useAuth } from "@/shared/context/AuthContext";
import { useEventPermission } from "@/shared/hooks/useEventPermission";
import { ViewerReadOnlyNotice } from "@/shared/components/ui/ViewerReadOnlyNotice";
import { createDepositCheckout, getBookingPaymentStatus } from "@/shared/lib/api/vendors";
import { submitPayHereCheckout } from "@/shared/lib/payhereCheckout";
import { EmptyState, getStatusBadgeClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";

type Mode = "planner" | "client";

type Props = {
  eventId: string;
  mode: Mode;
  /** When set (e.g. after PayHere return), poll payment status until confirmed. */
  pollBookingId?: string | null;
};

export function VendorShortlistPanel({ eventId, mode, pollBookingId }: Props) {
  const { user } = useAuth();
  const { isViewer } = useEventPermission(eventId);
  const canActAsClient = mode === "client" && !isViewer;
  const [items, setItems] = useState<VendorShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getVendorShortlist(token, eventId);
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load proposals.");
    } finally {
      setLoading(false);
    }
  }, [user, eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!pollBookingId || !user || mode !== "client") return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30;
    const pollIntervalMs = 2000;

    const isPaid = (bookingStatus: string, paymentStatus: string) =>
      paymentStatus === "Paid" || bookingStatus === "Confirmed";

    const poll = async () => {
      try {
        setPaymentPolling(true);
        setError(null);
        const token = await user.getIdToken();
        const status = await getBookingPaymentStatus(token, pollBookingId);

        if (cancelled) return;

        if (isPaid(status.bookingStatus, status.paymentStatus)) {
          setPaymentSuccess("Deposit paid successfully. Your vendor booking is confirmed.");
          setPaymentPolling(false);
          await load();
          window.history.replaceState({}, "", `/events/${eventId}/vendors`);
          return;
        }

        attempts += 1;
        if (attempts < maxAttempts) {
          window.setTimeout(() => void poll(), pollIntervalMs);
        } else {
          setPaymentPolling(false);
          setError(
            "Payment is still processing. Please wait a moment and refresh, or contact your planner."
          );
        }
      } catch (err) {
        if (cancelled) return;
        attempts += 1;
        if (attempts < maxAttempts) {
          window.setTimeout(() => void poll(), pollIntervalMs);
        } else {
          setPaymentPolling(false);
          setError(err instanceof Error ? err.message : "Could not verify payment status.");
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
    };
  }, [pollBookingId, user, mode, eventId, load]);

  const draftIds = items.filter((i) => i.status === "Draft").map((i) => i.id);

  const handleSendToClient = async () => {
    if (!draftIds.length || !user) return;
    setActionId("send-all");
    try {
      const token = await user.getIdToken();
      await sendShortlistToClient(token, eventId, draftIds);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send to client.");
    } finally {
      setActionId(null);
    }
  };

  const handleApprove = async (itemId: string, reject: boolean) => {
    if (!user) return;
    setActionId(itemId);
    try {
      const token = await user.getIdToken();
      await approveShortlistItem(token, eventId, itemId, reject);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionId(null);
    }
  };

  const handleRequestBooking = async (itemId: string) => {
    if (!user) return;
    setActionId(itemId);
    try {
      const token = await user.getIdToken();
      await requestBookingFromShortlist(token, eventId, itemId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request booking.");
    } finally {
      setActionId(null);
    }
  };

  const handlePayDeposit = async (bookingId: string) => {
    if (!user) return;
    setActionId(`pay-${bookingId}`);
    try {
      const token = await user.getIdToken();
      const result = await createDepositCheckout(token, bookingId);
      if (result?.alreadyPaid) {
        await load();
        return;
      }
      const checkout = result?.checkout as Record<string, unknown> | undefined;
      if (checkout) {
        submitPayHereCheckout(checkout);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start deposit payment.");
    } finally {
      setActionId(null);
    }
  };

  if (loading && !paymentPolling) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {paymentPolling && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/10 px-4 py-4 backdrop-blur-sm"
          )}
          role="status"
        >
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
          <p className="text-sm font-medium text-foreground">
            Confirming your deposit payment with PayHere…
          </p>
        </div>
      )}
      {paymentSuccess && <SuccessBanner message={paymentSuccess} />}
      {error && <ErrorBanner message={error} />}
      {mode === "client" && isViewer && <ViewerReadOnlyNotice />}

      {mode === "planner" && (
        <div className="flex flex-wrap items-center gap-3">
          <GlassButton type="button" variant="primary" onClick={() => setAddOpen(true)} className="gap-2">
            <Store size={16} aria-hidden />
            Add proposal
          </GlassButton>
          {draftIds.length > 0 && (
            <GlassButton
              type="button"
              variant="ghost"
              className="gap-2"
              disabled={actionId === "send-all"}
              onClick={() => void handleSendToClient()}
            >
              <Send size={16} aria-hidden />
              {actionId === "send-all" ? "Sending…" : `Send ${draftIds.length} draft(s) to client`}
            </GlassButton>
          )}
          <GlassButton href="/vendors" variant="ghost">
            Browse vendor directory
          </GlassButton>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={Store}
          title={mode === "planner" ? "No vendor proposals yet" : "No proposals from your planner"}
          description={
            mode === "planner"
              ? "Add vendors from the directory and send them to your client for approval."
              : "When your planner shares vendor options, they will appear here for you to review."
          }
        />
      ) : (
        <ul className="space-y-4" role="list">
          {items.map((item) => (
            <li key={item.id}>
              <article
                className={cn(
                  "rounded-xl border border-white/55 bg-white/40 p-5 backdrop-blur-sm sm:p-6",
                  "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
                )}
              >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={cn("font-medium", vg.body)}>{item.vendorBusinessName ?? "Vendor"}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        getStatusBadgeClass(shortlistStatusBadgeKey(item.status))
                      )}
                    >
                      {shortlistStatusLabel(item.status)}
                    </span>
                  </div>
                  <p className={cn("mt-1", vg.subtitle)}>
                    {item.serviceName ?? "Service"}
                    {item.categoryLabel ? ` · ${item.categoryLabel}` : ""}
                  </p>
                  <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">
                    {formatLKR(item.proposedAmount)}
                  </p>
                  {item.serviceDate && (
                    <p className={cn("mt-1", vg.caption)}>
                      Service date:{" "}
                      {new Date(item.serviceDate).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </p>
                  )}
                  {item.plannerNotes && (
                    <p className={cn("mt-3 rounded-xl border border-white/55 bg-white/35 px-3 py-2", vg.body)}>
                      {item.plannerNotes}
                    </p>
                  )}
                </div>

                <div className="flex flex-shrink-0 flex-wrap gap-2">
                  {canActAsClient && item.status === "SentToClient" && (
                    <>
                      <GlassButton
                        type="button"
                        variant="primary"
                        className="gap-1"
                        disabled={actionId === item.id}
                        onClick={() => void handleApprove(item.id, false)}
                      >
                        <Check size={14} aria-hidden />
                        Approve
                      </GlassButton>
                      <GlassButton
                        type="button"
                        variant="ghost"
                        className="gap-1 text-destructive"
                        disabled={actionId === item.id}
                        onClick={() => void handleApprove(item.id, true)}
                      >
                        <X size={14} aria-hidden />
                        Decline
                      </GlassButton>
                    </>
                  )}
                  {canActAsClient && item.status === "ClientApproved" && (
                    <GlassButton
                      type="button"
                      variant="primary"
                      disabled={actionId === item.id}
                      onClick={() => void handleRequestBooking(item.id)}
                    >
                      {actionId === item.id ? "Requesting…" : "Request booking"}
                    </GlassButton>
                  )}
                  {mode === "client" && item.status === "DepositPaid" && (
                    <span className="rounded-full bg-success/15 px-3 py-1.5 text-xs font-semibold text-success ring-1 ring-success/20">
                      Deposit paid
                    </span>
                  )}
                  {canActAsClient &&
                    item.vendorBookingId &&
                    item.status === "BookingAccepted" && (
                      <GlassButton
                        type="button"
                        variant="primary"
                        className="gap-1"
                        disabled={actionId === `pay-${item.vendorBookingId}` || paymentPolling}
                        onClick={() => void handlePayDeposit(item.vendorBookingId!)}
                      >
                        <CreditCard size={14} aria-hidden />
                        {actionId === `pay-${item.vendorBookingId}`
                          ? "Opening checkout…"
                          : "Pay deposit"}
                      </GlassButton>
                    )}
                  {item.status === "Declined" && (
                    <span className={cn("rounded-full bg-white/50 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/60", vg.caption)}>
                      Vendor unavailable
                    </span>
                  )}
                  {canActAsClient && item.status === "BookingRequested" && item.vendorBookingId && (
                    <span className={cn("rounded-full bg-white/50 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/60", vg.caption)}>
                      Awaiting vendor response
                    </span>
                  )}
                  {item.vendorBookingId && item.status !== "BookingRequested" && (
                    <GlassButton href={`/contracts/sign/${item.vendorBookingId}`} variant="ghost">
                      View contract
                    </GlassButton>
                  )}
                </div>
              </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {mode === "planner" && (
        <AddShortlistProposalModal
          eventId={eventId}
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onAdded={() => void load()}
        />
      )}
    </div>
  );
}
