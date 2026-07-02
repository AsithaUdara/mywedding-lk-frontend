"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { sendInvitation } from "@/shared/lib/api/invitations";
import { X, Mail, ChevronDown } from "lucide-react";
import { ErrorBanner, inputClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onInviteSuccess: (result: { emailSent: boolean; acceptUrl: string; message: string }) => void;
}

const InviteMemberModal = ({ isOpen, onClose, eventId, onInviteSuccess }: InviteMemberModalProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [permissionLevel, setPermissionLevel] = useState("Viewer");
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
      setError("You must be logged in to send invitations.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const result = await sendInvitation(token, { eventId, email, permissionLevel });
      onInviteSuccess({
        emailSent: result.emailSent,
        acceptUrl: result.acceptUrl,
        message: result.message,
      });
    } catch (err: unknown) {
      const firebaseErr = err as { message?: string };
      setError(firebaseErr.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-member-title"
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

        <h2 id="invite-member-title" className={cn(rf.sectionTitle, "mb-6 pr-8 text-center")}>
          Invite a team member
        </h2>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div>
            <label htmlFor="inviteEmail" className={cn("mb-1.5 block", rf.label)}>
              Member&apos;s email
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="inviteEmail"
                type="email"
                placeholder="e.g., family.member@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(glassInput, "pl-10")}
              />
            </div>
            <p className={cn("mt-2", rf.caption)}>
              We will send an invitation email with a link to join this event.
            </p>
          </div>

          <div>
            <label htmlFor="invitePermission" className={cn("mb-1.5 block", rf.label)}>
              Permission
            </label>
            <div className="relative">
              <select
                id="invitePermission"
                value={permissionLevel}
                onChange={(e) => setPermissionLevel(e.target.value)}
                className={cn(glassInput, "appearance-none pr-10")}
              >
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
          </div>

          <GlassButton
            type="submit"
            variant="primary"
            className="mt-1 min-h-11 w-full justify-center py-3 text-sm font-semibold"
            disabled={loading}
          >
            {loading ? "Sending invite…" : "Send invitation"}
          </GlassButton>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
