"use client";

import React, { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { createEvent } from "@/shared/lib/api/events";
import { X } from "lucide-react";
import { Button, ErrorBanner, inputClass } from "@/shared/components/ui";
import { pv } from "@/modules/vendors/public-theme";
import { cn } from "@/shared/lib/cn";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: { eventId: string; eventName: string }) => void;
}

const CreateEventModal = ({ isOpen, onClose, onEventCreated }: CreateEventModalProps) => {
  const { user } = useAuth();
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const newEvent = await createEvent(token, { eventName, eventDate });
      setEventName("");
      setEventDate("");
      onEventCreated({ eventId: newEvent.eventId, eventName });
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={pv.modalOverlay} onClick={onClose}>
      <div className={pv.modalPanel} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <h2 className="mb-6 text-center font-playfair text-2xl font-bold text-foreground sm:text-3xl">
          Create a new event
        </h2>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div>
            <label htmlFor="eventName" className={cn("mb-1.5 block", pv.label)}>
              Event name
            </label>
            <input
              id="eventName"
              type="text"
              placeholder="e.g., Ananya & Sameera's Wedding"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="eventDate" className={cn("mb-1.5 block", pv.label)}>
              Event date
            </label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create event"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
