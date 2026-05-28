"use client";

import React, { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { sendInquiry } from "@/shared/lib/api/vendors";
import { X, Send, MessageCircle } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="inquiry-title"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-primary" />
            <h2 id="inquiry-title" className="text-lg font-semibold text-charcoal">
              Message {vendorName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-charcoal"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <Send size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal">Message sent</h3>
            <p className="mt-2 text-sm text-slate-500">
              {vendorName} will reply to your registered email address.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <p className="mb-4 text-sm text-slate-600">
              Ask about availability, packages, or pricing. Your message is sent securely through
              MyWedding.lk.
            </p>
            <label className="mb-1.5 block text-sm font-semibold text-charcoal">Your message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm planning a wedding in [month] and interested in your services. Could you share availability and pricing?"
              rows={5}
              required
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InquiryModal;
