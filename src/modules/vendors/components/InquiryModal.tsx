"use client";

import React, { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { sendInquiry } from "@/shared/lib/api/vendors";
import { X, Send, MessageCircle } from "lucide-react";
import { inputClass } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import { pv } from "@/modules/vendors/public-theme";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
}

const InquiryModal = ({ isOpen, onClose, vendorId, vendorName }: InquiryModalProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError("");

    try {
      const token = await user.getIdToken();
      await sendInquiry(token, vendorId, message);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMessage("");
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn("w-full max-w-lg overflow-hidden shadow-xl", pv.card)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="inquiry-title"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-primary" aria-hidden />
            <h2 id="inquiry-title" className="text-lg font-semibold text-foreground">
              Message {vendorName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <Send size={24} className="text-success" aria-hidden />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Message sent</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {vendorName} will reply to your registered email address.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Ask about availability, packages, or pricing. Your message is sent securely through
              MyWedding.lk.
            </p>
            <label className={cn("mb-1.5 block", pv.label)}>Your message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm planning a wedding in [month] and interested in your services. Could you share availability and pricing?"
              rows={5}
              required
              className={cn(inputClass, "resize-none")}
            />

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className={cn("mt-5 w-full", pv.primaryBtn)}
            >
              {isSubmitting ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InquiryModal;
