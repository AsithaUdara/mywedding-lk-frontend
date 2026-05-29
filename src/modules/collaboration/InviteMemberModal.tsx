"use client";

import React, { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { sendInvitation } from "@/shared/lib/api/invitations";
import { X, Mail, ChevronDown } from "lucide-react";
import { Button, ErrorBanner, inputClass } from "@/shared/components/ui";
import { pv } from "@/modules/vendors/public-theme";
import { cn } from "@/shared/lib/cn";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onInviteSuccess: () => void;
}

const InviteMemberModal = ({ isOpen, onClose, eventId, onInviteSuccess }: InviteMemberModalProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [permissionLevel, setPermissionLevel] = useState("Viewer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      await sendInvitation(token, { eventId, email, permissionLevel });
      onInviteSuccess();
    } catch (err: unknown) {
      const firebaseErr = err as { message?: string };
      setError(firebaseErr.message || "An unexpected error occurred.");
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
          Invite a team member
        </h2>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          <div>
            <label htmlFor="inviteEmail" className={cn("mb-1.5 block", pv.label)}>
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
                className={cn(inputClass, "pl-10")}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              We will send an invitation email with a link to join this event.
            </p>
          </div>

          <div>
            <label htmlFor="invitePermission" className={cn("mb-1.5 block", pv.label)}>
              Permission
            </label>
            <div className="relative">
              <select
                id="invitePermission"
                value={permissionLevel}
                onChange={(e) => setPermissionLevel(e.target.value)}
                className={cn(inputClass, "appearance-none pr-10")}
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

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Sending invite…" : "Send invitation"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
