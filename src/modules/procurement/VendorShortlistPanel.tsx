"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Loader2, Send, Store, X } from "lucide-react";
import Link from "next/link";
import {
  approveShortlistItem,
  getVendorShortlist,
  requestBookingFromShortlist,
  sendShortlistToClient,
  type VendorShortlistItem,
} from "@/shared/lib/api/vendorShortlist";
import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  formatLKR,
} from "@/shared/components/ui";
import {
  shortlistStatusBadgeKey,
  shortlistStatusLabel,
} from "@/modules/procurement/shortlist-utils";
import { AddShortlistProposalModal } from "@/modules/procurement/AddShortlistProposalModal";
import { useAuth } from "@/shared/context/AuthContext";
import { createDepositCheckout } from "@/shared/lib/api/vendors";
import { submitPayHereCheckout } from "@/shared/lib/payhereCheckout";

type Mode = "planner" | "client";

type Props = {
  eventId: string;
  mode: Mode;
};

export function VendorShortlistPanel({ eventId, mode }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<VendorShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} />}

      {mode === "planner" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="primary" onClick={() => setAddOpen(true)} className="gap-2">
            <Store size={16} aria-hidden />
            Add proposal
          </Button>
          {draftIds.length > 0 && (
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              disabled={actionId === "send-all"}
              onClick={() => void handleSendToClient()}
            >
              <Send size={16} aria-hidden />
              {actionId === "send-all" ? "Sending…" : `Send ${draftIds.length} draft(s) to client`}
            </Button>
          )}
          <Link
            href="/vendors"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Browse vendor directory
          </Link>
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
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {item.vendorBusinessName ?? "Vendor"}
                    </h3>
                    <Badge variant="status" status={shortlistStatusBadgeKey(item.status)}>
                      {shortlistStatusLabel(item.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.serviceName ?? "Service"}
                    {item.categoryLabel ? ` · ${item.categoryLabel}` : ""}
                  </p>
                  <p className="mt-2 text-lg font-bold text-primary">
                    {formatLKR(item.proposedAmount)}
                  </p>
                  {item.serviceDate && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Service date:{" "}
                      {new Date(item.serviceDate).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </p>
                  )}
                  {item.plannerNotes && (
                    <p className="mt-3 rounded-xl bg-muted/40 px-3 py-2 text-sm text-foreground">
                      {item.plannerNotes}
                    </p>
                  )}
                </div>

                <div className="flex flex-shrink-0 flex-wrap gap-2">
                  {mode === "client" && item.status === "SentToClient" && (
                    <>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="gap-1"
                        disabled={actionId === item.id}
                        onClick={() => void handleApprove(item.id, false)}
                      >
                        <Check size={14} aria-hidden />
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-1 !text-destructive"
                        disabled={actionId === item.id}
                        onClick={() => void handleApprove(item.id, true)}
                      >
                        <X size={14} aria-hidden />
                        Decline
                      </Button>
                    </>
                  )}
                  {mode === "client" && item.status === "ClientApproved" && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={actionId === item.id}
                      onClick={() => void handleRequestBooking(item.id)}
                    >
                      {actionId === item.id ? "Requesting…" : "Request booking"}
                    </Button>
                  )}
                  {mode === "client" &&
                    item.vendorBookingId &&
                    item.status === "BookingAccepted" && (
                      <Button
                        type="button"
                        variant="accent"
                        size="sm"
                        className="gap-1"
                        disabled={actionId === `pay-${item.vendorBookingId}`}
                        onClick={() => void handlePayDeposit(item.vendorBookingId!)}
                      >
                        <CreditCard size={14} aria-hidden />
                        {actionId === `pay-${item.vendorBookingId}`
                          ? "Opening checkout…"
                          : "Pay deposit"}
                      </Button>
                    )}
                  {mode === "client" && item.status === "BookingRequested" && item.vendorBookingId && (
                    <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                      Awaiting vendor response
                    </span>
                  )}
                  {item.vendorBookingId && item.status !== "BookingRequested" && (
                    <Link
                      href={`/contracts/sign/${item.vendorBookingId}`}
                      className="inline-flex items-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      View contract
                    </Link>
                  )}
                </div>
              </div>
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
