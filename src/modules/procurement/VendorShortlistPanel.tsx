"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, CreditCard, FileSignature, Loader2, Send, Store, X } from "lucide-react";
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
  clientNeedsContractSignature,
  clientCanPayDeposit,
  clientAwaitingVendorContract,
} from "@/modules/procurement/shortlist-utils";
import { AddShortlistProposalModal } from "@/modules/procurement/AddShortlistProposalModal";
import { useAuth } from "@/shared/context/AuthContext";
import { useEventPermission } from "@/shared/hooks/useEventPermission";
import { ViewerReadOnlyNotice } from "@/shared/components/ui/ViewerReadOnlyNotice";
import { createDepositCheckout, getBookingPaymentStatus } from "@/shared/lib/api/vendors";
import { getEventBookings, type EventBooking } from "@/shared/lib/api/bookings";
import { submitPayHereCheckout } from "@/shared/lib/payhereCheckout";
import { EmptyState, getStatusBadgeClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import { dispatchVendorProposalsUpdated } from "@/shared/lib/vendorProposalEvents";
import { VendorInsightLinks } from "@/modules/procurement/VendorInsightLinks";
import { PlannerProposalCard } from "@/modules/planner/procurement/PlannerProposalCard";
import { ProposalPipelineStepper } from "@/modules/planner/procurement/ProposalPipelineStepper";
import {
  filterByPipeline,
  groupByPipelineStage,
  PIPELINE_STEPS,
  type PipelineFilter,
} from "@/modules/planner/procurement/proposalPipelineStages";

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
  const [eventBookings, setEventBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>("all");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const [shortlistData, bookingData] = await Promise.all([
        getVendorShortlist(token, eventId),
        getEventBookings(token, eventId),
      ]);
      setItems(shortlistData);
      setEventBookings(bookingData);
      setError(null);
      dispatchVendorProposalsUpdated(eventId);
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
    setPipelineFilter("all");
  }, [eventId]);

  useEffect(() => {
    if (!pollBookingId || !user || mode !== "client") return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30;
    const pollIntervalMs = 2000;

    const isPaid = (bookingStatus: string, paymentStatus: string) =>
      paymentStatus === "Paid" || bookingStatus === "Confirmed";
    const isFailed = (paymentStatus: string) => paymentStatus === "Failed";

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

        if (isFailed(status.paymentStatus)) {
          setPaymentPolling(false);
          setError(
            "Payment was not completed. Please retry the deposit payment or contact your planner."
          );
          // Prevent repeated 60s polling loops on every browser refresh.
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
          // Remove return query params so subsequent refreshes are fast.
          window.history.replaceState({}, "", `/events/${eventId}/vendors`);
        }
      } catch (err) {
        if (cancelled) return;
        attempts += 1;
        if (attempts < maxAttempts) {
          window.setTimeout(() => void poll(), pollIntervalMs);
        } else {
          setPaymentPolling(false);
          setError(err instanceof Error ? err.message : "Could not verify payment status.");
          // Remove return query params so subsequent refreshes are fast.
          window.history.replaceState({}, "", `/events/${eventId}/vendors`);
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
    };
  }, [pollBookingId, user, mode, eventId, load]);

  const draftIds = items.filter((i) => i.status === "Draft").map((i) => i.id);
  const visibleItems = mode === "planner" ? filterByPipeline(items, pipelineFilter) : items;
  const groupedItems = mode === "planner" ? groupByPipelineStage(items) : null;

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

      {mode === "planner" && items.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <ProposalPipelineStepper
                items={items}
                filter={pipelineFilter}
                onFilterChange={setPipelineFilter}
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pt-6">
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
                  {actionId === "send-all" ? "Sending…" : `Send ${draftIds.length} to client`}
                </GlassButton>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === "planner" && items.length === 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <GlassButton type="button" variant="primary" onClick={() => setAddOpen(true)} className="gap-2">
            <Store size={16} aria-hidden />
            Add proposal
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
      ) : mode === "planner" ? (
        visibleItems.length === 0 ? (
          <EmptyState
            icon={Store}
            title={
              pipelineFilter === "all"
                ? "No vendor proposals yet"
                : "No proposals in this stage"
            }
            description={
              pipelineFilter === "all"
                ? "Add vendors from the directory or use AI match to build a shortlist."
                : "Try another pipeline stage or show all proposals."
            }
            action={
              pipelineFilter !== "all" ? (
                <GlassButton type="button" variant="ghost" onClick={() => setPipelineFilter("all")}>
                  Show all proposals
                </GlassButton>
              ) : undefined
            }
            className="border-0 bg-transparent shadow-none"
          />
        ) : pipelineFilter === "all" && groupedItems ? (
          <div className="space-y-5">
            {PIPELINE_STEPS.map((step) => {
              const stageItems = groupedItems.get(step.id) ?? [];
              if (stageItems.length === 0) return null;
              return (
                <section key={step.id}>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                    {step.label}
                    <span className="ml-1.5 font-normal text-[#97A0AF]">({stageItems.length})</span>
                  </h3>
                  <ul className="space-y-2" role="list">
                    {stageItems.map((item) => (
                      <li key={item.id}>
                        <PlannerProposalCard item={item} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
            {(groupedItems.get("closed")?.length ?? 0) > 0 && (
              <section>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#5E6C84]">
                  Closed
                  <span className="ml-1.5 font-normal text-[#97A0AF]">
                    ({groupedItems.get("closed")!.length})
                  </span>
                </h3>
                <ul className="space-y-2" role="list">
                  {groupedItems.get("closed")!.map((item) => (
                    <li key={item.id}>
                      <PlannerProposalCard item={item} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <PlannerProposalCard item={item} />
              </li>
            ))}
          </ul>
        )
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
                        getStatusBadgeClass(shortlistStatusBadgeKey(item.status, item))
                      )}
                    >
                      {shortlistStatusLabel(item.status, item)}
                    </span>
                  </div>
                  <p className={cn("mt-1", vg.subtitle)}>
                    {item.serviceName ?? "Service"}
                    {item.categoryLabel ? ` · ${item.categoryLabel}` : ""}
                  </p>
                  {item.status === "BookingAccepted" && clientAwaitingVendorContract(item) && mode === "client" && (
                    <p className={cn("mt-2 text-sm text-amber-800", vg.caption)}>
                      The vendor is preparing your contract. You will be notified when it is ready to review and sign.
                    </p>
                  )}
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
                  <VendorInsightLinks
                    vendorUserId={item.vendorUserId}
                    vendorServiceId={item.vendorServiceId}
                    className="mt-3"
                  />
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
                  {canActAsClient && clientNeedsContractSignature(item) && item.vendorBookingId && (
                    <GlassButton
                      href={`/contracts/sign/${item.vendorBookingId}?eventId=${eventId}`}
                      variant="primary"
                      className="gap-1"
                    >
                      <FileSignature size={14} aria-hidden />
                      Sign contract
                    </GlassButton>
                  )}
                  {canActAsClient && clientCanPayDeposit(item) && item.vendorBookingId && (
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
                  {item.vendorBookingId &&
                    (item.status === "ContractSigned" ||
                      item.status === "DepositPaid" ||
                      item.contractSignedAt) && (
                    <GlassButton href={`/contracts/sign/${item.vendorBookingId}?eventId=${eventId}`} variant="ghost">
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

      {mode === "client" && eventBookings.length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className={cn("text-base font-semibold", vg.body)}>Your booked services</h3>
            <p className={cn("text-sm", vg.caption)}>
              Confirmed and in-progress vendor services linked to this event.
            </p>
          </div>
          <ul className="space-y-3" role="list">
            {eventBookings.map((booking) => (
              <li key={booking.bookingId}>
                <article
                  className={cn(
                    "rounded-xl border border-white/55 bg-white/40 p-4 backdrop-blur-sm",
                    "transition-all duration-200 hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className={cn("truncate font-medium", vg.body)}>
                        {booking.serviceName}
                      </p>
                      <p className={cn("mt-0.5 truncate text-sm", vg.subtitle)}>
                        {booking.vendorName || "Vendor"}
                      </p>
                      <p className={cn("mt-1 inline-flex items-center gap-1.5 text-xs", vg.caption)}>
                        <CalendarDays size={12} aria-hidden />
                        Service date{" "}
                        {new Date(booking.serviceDate).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          getStatusBadgeClass(
                            booking.status === "Confirmed" || booking.status === "Completed"
                              ? "success"
                              : "neutral"
                          )
                        )}
                      >
                        {booking.status}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatLKR(booking.finalAmount)}
                      </span>
                    </div>
                  </div>
                  <VendorInsightLinks
                    vendorUserId={booking.vendorUserId}
                    vendorServiceId={booking.serviceId}
                    className="mt-3"
                  />
                </article>
              </li>
            ))}
          </ul>
        </section>
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
