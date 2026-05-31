"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getEvents, type WeddingEventSummary } from "@/shared/lib/api/events";
import { createBooking, createDepositCheckout } from "@/shared/lib/api/vendors";
import { submitPayHereCheckout } from "@/shared/lib/payhereCheckout";
import { postComment } from "@/shared/lib/api/feed";
import { X, ChevronDown, Calendar } from "lucide-react";
import { formatLKR, inputClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

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
      document.body.classList.add("modal-open-blur");
    } else {
      document.body.classList.remove("modal-open-blur");
    }

    return () => {
      document.body.classList.remove("modal-open-blur");
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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={onClose}
    >
      <div
        className={cn(rf.panel, "relative max-h-[85vh] w-full max-w-lg overflow-y-auto p-6 sm:p-8")}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(rf.navBtn, "absolute right-3 top-3")}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 id="booking-modal-title" className={cn(rf.sectionTitle, "mb-2 pr-8 text-center")}>
          Confirm your booking
        </h2>
        <p className={cn("mb-6 text-center", rf.subtitle)}>
          You are booking <span className="font-semibold text-foreground">{vendorName}</span>.
        </p>

        {error && (
          <p className="mb-4 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-center text-sm text-destructive backdrop-blur-sm">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-xl border border-success/25 bg-success/10 p-3 text-center text-sm text-success backdrop-blur-sm">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="eventSelect" className={cn("mb-2 block", rf.label)}>
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
                    className={cn(glassInput, "appearance-none pr-10 disabled:opacity-70")}
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
                <p className="rounded-xl border border-white/55 bg-white/35 p-3 text-sm text-muted-foreground backdrop-blur-sm">
                  No events you can book for yet. Your wedding planner creates celebrations and
                  invites you by email. After you accept, you need{" "}
                  <strong className="text-foreground">Editor</strong> access to book vendors (Viewers
                  cannot book).
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="serviceDate" className={cn("mb-2 block", rf.label)}>
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
                className={cn(glassInput, "pl-11 disabled:opacity-70")}
              />
            </div>
          </div>
          <div className="border-t border-white/40 pt-4 text-center">
            <p className={rf.caption}>Total amount</p>
            <p className="text-3xl font-bold text-primary">{formatLKR(price)}</p>
          </div>
          {success ? (
            <GlassButton type="button" variant="primary" className="w-full justify-center" onClick={onClose}>
              Close
            </GlassButton>
          ) : (
            <GlassButton
              type="submit"
              variant="primary"
              className="w-full justify-center"
              disabled={loading || bookableEvents.length === 0}
            >
              {loading ? "Creating request…" : "Request & pay deposit"}
            </GlassButton>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
