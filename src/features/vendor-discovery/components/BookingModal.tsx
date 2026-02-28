"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getEvents } from '@/lib/api/events';
import { createBooking } from '@/lib/api/vendors';
import { X, ChevronDown, Calendar } from 'lucide-react';

interface Event {
  id: string;
  eventName: string;
  eventDate: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  serviceId: string;
  price: number;
}

const BookingModal = ({ isOpen, onClose, vendorName, serviceId, price }: BookingModalProps) => {
  const { user } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [serviceDate, setServiceDate] = useState('');

  const [error, setError] = useState<string | null>(null);
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
    if (isOpen && user) {
      const fetchUserEvents = async () => {
        try {
          const token = await user.getIdToken();
          const userEvents = await getEvents(token);
          setEvents(userEvents);
          if (userEvents.length > 0) {
            setSelectedEventId(userEvents[0].id);
          }
        } catch {
          setError("Could not load your events.");
        }
      };
      fetchUserEvents();
    }
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

    try {
      const token = await user.getIdToken();
      await createBooking(token, {
        eventId: selectedEventId,
        serviceId,
        finalAmount: price,
        serviceDate,
      });
      onClose();
      router.push('/dashboard');
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
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg text-center mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="eventSelect" className="block text-sm font-medium text-charcoal mb-2">Select Your Event</label>
            <div className="relative">
              {events.length > 0 ? (
                <>
                  <select
                    id="eventSelect"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    required
                    className="w-full appearance-none py-3 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                  >
                    {events.map(event => (
                      <option key={event.id} value={event.id}>{event.eventName}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </>
              ) : (
                <p className="text-sm text-gray-500 p-3 bg-white border rounded-lg">You don&apos;t have any events. Please create one from your dashboard first.</p>
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
                className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-300/70 text-center">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-3xl font-bold text-charcoal">LKR {price.toLocaleString()}</p>
          </div>
          <button type="submit" disabled={loading || events.length === 0} className="w-full py-3 rounded-lg text-white font-semibold shadow-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--color-primary)' }}>
            {loading ? 'Confirming...' : 'Confirm & Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
