"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { createEvent } from "@/shared/lib/api/events";
import { X } from "lucide-react";
import { ErrorBanner, inputClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

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
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-event-title"
      onClick={onClose}
    >
      <div
        className={cn(rf.panel, "relative w-full max-w-lg overflow-hidden p-6 sm:p-8")}
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

        <h2 id="create-event-title" className={cn(rf.sectionTitle, "mb-6 pr-8 text-center")}>
          Create a new event
        </h2>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div>
            <label htmlFor="eventName" className={cn("mb-1.5 block", rf.label)}>
              Event name
            </label>
            <input
              id="eventName"
              type="text"
              placeholder="e.g., Ananya & Sameera's Wedding"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              className={glassInput}
            />
          </div>
          <div>
            <label htmlFor="eventDate" className={cn("mb-1.5 block", rf.label)}>
              Event date
            </label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className={glassInput}
            />
          </div>

          <GlassButton type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
            {loading ? "Creating…" : "Create event"}
          </GlassButton>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
