// File: src/features/event-planning/CreateEventModal.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/lib/api/events';
import { X } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateEventModal = ({ isOpen, onClose }: CreateEventModalProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create an event.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const newEvent = await createEvent(token, { eventName, eventDate });
      
      onClose(); // Close the modal
      router.push(`/events/${newEvent.eventId}`); // Redirect to the new event's page

    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg p-8 rounded-xl shadow-2xl bg-cream" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors"><X size={24} /></button>
        <h2 className="text-3xl font-bold font-playfair text-charcoal text-center mb-6">Create a New Event</h2>
        
        {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-charcoal mb-2">Event Name</label>
            <input
              id="eventName"
              type="text"
              placeholder="e.g., Ananya & Sameera's Wedding"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-charcoal mb-2">Event Date</label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-white font-semibold shadow-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--color-primary)' }}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
