"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { getEvents, type WeddingEventSummary } from '@/shared/lib/api/events';
import { createBooking, createDepositCheckout } from '@/shared/lib/api/vendors';
import { postComment } from '@/shared/lib/api/feed';
import { X, ChevronDown, Calendar } from 'lucide-react';

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
  const [selectedEventId, setSelectedEventId] = useState('');
  const [serviceDate, setServiceDate] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
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
          setSelectedEventId('');
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

      const bookingId = (bookingResponse as { bookingId?: string; BookingId?: string }).bookingId
        || (bookingResponse as { bookingId?: string; BookingId?: string }).BookingId;
      if (!bookingId) {
        throw new Error('Booking created but booking ID was not returned by API.');
      }

      const checkout = await createDepositCheckout(token, bookingId);
      const payload = checkout?.checkout;
      if (payload?.checkoutUrl) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payload.checkoutUrl;
        form.target = "_blank";

        const toHidden = (name: string, value: unknown) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = String(value ?? "");
          return input;
        };

        Object.entries(payload).forEach(([key, value]) => {
          if (key === "checkoutUrl") return;
          form.appendChild(toHidden(key, value));
        });

        document.body.appendChild(form);
        form.submit();
        form.remove();
      }

      try {
        await postComment(token, selectedEventId, `Requested vendor service and started deposit checkout: "${vendorName}" for LKR ${price}`);
      } catch (feedError) {
        console.error("Failed to post to activity feed", feedError);
      }

      setSuccess(
        "Booking request created. PayHere checkout opened in a new tab — complete the deposit there to confirm. You can close this dialog when done."
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during booking.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 modal-container" onClick={onClose}>
      <div className="relative w-full max-w-lg p-8 rounded-xl shadow-2xl bg-cream max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors"><X size={24} /></button>
        <h2 className="text-3xl font-bold font-playfair text-charcoal text-center mb-2">Confirm Your Booking</h2>
        <p className="text-center text-gray-600 mb-6">You are booking <span className="font-semibold">{vendorName}</span>.</p>
        {error && <p className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg text-center mb-4 text-sm">{error}</p>}
        {success && (
          <p className="text-green-800 bg-green-50 border border-green-200 p-3 rounded-lg text-center mb-4 text-sm">
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="eventSelect" className="block text-sm font-medium text-charcoal mb-2">Select Your Event</label>
            <div className="relative">
              {bookableEvents.length > 0 ? (
                <>
                  <select
                    id="eventSelect"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                    disabled={!!success}
                    className="w-full appearance-none py-3 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none disabled:opacity-70"
                  >
                    {bookableEvents.map((event) => (
                      <option key={event.id} value={event.id}>{event.eventName}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </>
              ) : (
                <p className="text-sm text-gray-600 p-3 bg-white border rounded-lg">
                  No events you can book for. Create an event on your dashboard, or ask the owner to give you <strong>Editor</strong> access (Viewers cannot book vendors).
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="serviceDate" className="block text-sm font-medium text-charcoal mb-2">Service Date</label>
            <div className="relative">
              <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="serviceDate"
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                required
                disabled={!!success}
                className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none disabled:opacity-70"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-300/70 text-center">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-3xl font-bold text-charcoal">LKR {price.toLocaleString()}</p>
          </div>
          {success ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-lg text-white font-semibold shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Close
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || bookableEvents.length === 0}
              className="w-full py-3 rounded-lg text-white font-semibold shadow-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Creating Request...' : 'Request & Pay Deposit'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
