"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { sendInquiry } from "@/shared/lib/api/vendors";
import { X, Send, MessageCircle } from "lucide-react";
import { inputClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(rf.panel, "w-full max-w-lg overflow-hidden")}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
      >
        <div className={cn("flex items-center justify-between gap-3", rf.panelHeader)}>
          <div className="flex min-w-0 items-center gap-2">
            <MessageCircle size={20} className="shrink-0 text-primary" aria-hidden />
            <h2 id="inquiry-title" className={cn(rf.sectionTitle, "truncate text-lg")}>
              Message {vendorName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(rf.navBtn)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 ring-1 ring-success/15">
              <Send size={24} className="text-success" aria-hidden />
            </div>
            <h3 className={rf.sectionTitle}>Message sent</h3>
            <p className={cn("mt-2", rf.subtitle)}>
              {vendorName} will reply to your registered email address.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={rf.panelBody}>
            <p className={cn("mb-4", rf.subtitle)}>
              Ask about availability, packages, or pricing. Your message is sent securely through
              MyWedding.lk.
            </p>
            <label className={cn("mb-1.5 block", rf.label)}>Your message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm planning a wedding in [month] and interested in your services. Could you share availability and pricing?"
              rows={5}
              required
              className={cn(glassInput, "resize-none")}
            />

            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <GlassButton
              type="submit"
              variant="primary"
              disabled={isSubmitting || !message.trim()}
              className="mt-5 w-full justify-center"
            >
              {isSubmitting ? "Sending…" : "Send message"}
            </GlassButton>
          </form>
        )}
      </div>
    </div>
  );
};

export default InquiryModal;
