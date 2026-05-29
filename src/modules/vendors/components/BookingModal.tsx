"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getEvents, type WeddingEventSummary } from "@/shared/lib/api/events";
import { createBooking, createDepositCheckout } from "@/shared/lib/api/vendors";
import { submitPayHereCheckout } from "@/shared/lib/payhereCheckout";
import { postComment } from "@/shared/lib/api/feed";
import { X, ChevronDown, Calendar } from "lucide-react";
import { formatLKR, inputClass } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import { pv } from "@/modules/vendors/public-theme";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  serviceId: string;
  price: number;
}

const BookingModal = ({ isOpen, onClose, vendorName, serviceId, price }: BookingModalProps) => {
  const { user } = useAuth();

  const [bookableEvents, setBookableEvents] = useState<WeddingEventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [serviceDate, setServiceDate] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSuccess(null);
      setError(null);
      return;
    }

    if (!user) return;

    const fetchUserEvents = async () => {
      try {
        const token = await user.getIdToken();
        const userEvents: WeddingEventSummary[] = await getEvents(token);
        const canBook = userEvents.filter((e) => e.canBook === true);
        setBookableEvents(canBook);
        if (canBook.length > 0) {
          setSelectedEventId(canBook[0].id);
        } else {
          setSelectedEventId("");
        }
      } catch {
        setError("Could not load your events.");
      }
    };
    void fetchUserEvents();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEventId || !serviceDate) {
      setError("Please select an event and a service date.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await user.getIdToken();
      const bookingResponse = await createBooking(token, {
        eventId: selectedEventId,
        serviceId,
        finalAmount: price,
        serviceDate,
      });

      const bookingId =
        (bookingResponse as { bookingId?: string; BookingId?: string }).bookingId ||
        (bookingResponse as { bookingId?: string; BookingId?: string }).BookingId;
      if (!bookingId) {
        throw new Error("Booking created but booking ID was not returned by API.");
      }

      const checkout = await createDepositCheckout(token, bookingId);
      const payload = checkout?.checkout as Record<string, unknown> | undefined;
      if (payload) {
        submitPayHereCheckout(payload);
      }

      try {
        await postComment(
          token,
          selectedEventId,
          `Requested vendor service and started deposit checkout: "${vendorName}" for LKR ${price}`
        );
      } catch (feedError) {
        console.error("Failed to post to activity feed", feedError);
      }

      setSuccess(
        "Booking request created. PayHere checkout opened in a new tab — complete the deposit there to confirm. You can close this dialog when done."
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred during booking.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-container fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative max-h-[85vh] w-full max-w-lg overflow-y-auto p-6 shadow-2xl sm:p-8",
          pv.card
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <h2 className="mb-2 text-center font-playfair text-2xl font-bold text-foreground sm:text-3xl">
          Confirm your booking
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          You are booking <span className="font-semibold text-foreground">{vendorName}</span>.
        </p>
        {error && (
          <p className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-center text-sm text-destructive">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-xl border border-success/20 bg-success/5 p-3 text-center text-sm text-success">
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="eventSelect" className={cn("mb-2 block", pv.label)}>
              Select your event
            </label>
            <div className="relative">
              {bookableEvents.length > 0 ? (
                <>
                  <select
                    id="eventSelect"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                    disabled={!!success}
                    className={cn(inputClass, "appearance-none pr-10 disabled:opacity-70")}
                  >
                    {bookableEvents.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.eventName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                </>
              ) : (
                <p className="rounded-xl border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
                  No events you can book for. Create an event on your dashboard, or ask the owner
                  to give you <strong className="text-foreground">Editor</strong> access (Viewers
                  cannot book vendors).
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="serviceDate" className={cn("mb-2 block", pv.label)}>
              Service date
            </label>
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="serviceDate"
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                required
                disabled={!!success}
                className={cn(inputClass, "pl-11 disabled:opacity-70")}
              />
            </div>
          </div>
          <div className="border-t border-border pt-4 text-center">
            <p className="text-sm text-muted-foreground">Total amount</p>
            <p className="text-3xl font-bold text-primary">{formatLKR(price)}</p>
          </div>
          {success ? (
            <button type="button" onClick={onClose} className={cn("w-full", pv.primaryBtn)}>
              Close
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || bookableEvents.length === 0}
              className={cn("w-full", pv.primaryBtn)}
            >
              {loading ? "Creating request…" : "Request & pay deposit"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
