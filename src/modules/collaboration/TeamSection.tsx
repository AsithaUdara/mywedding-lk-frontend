"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  Organizer,
  getOrganizers,
  getInvitations,
  type Invitation,
  updateOrganizerRole,
} from "@/shared/lib/api/events";
import { UserPlus, Mail, Clock, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { useUI } from "@/shared/context/UIContext";
import InviteMemberModal from "./InviteMemberModal";
import TeamMemberCard from "./TeamMemberCard";
import { Badge } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";
import { cn } from "@/shared/lib/cn";
import { getUserDisplayName } from "@/shared/lib/userDisplay";

interface TeamSectionProps {
  eventId: string;
}

const TeamSection: React.FC<TeamSectionProps> = ({ eventId }) => {
  const { user } = useAuth();
  const { openHub } = useUI();
  const { invitationsVersion } = useRealTime();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const currentUserOrganizer = useMemo(() => {
    if (!user) return null;
    return organizers.find((o) => o.userId === user.uid);
  }, [organizers, user]);

  const isOwner = currentUserOrganizer?.role === "Owner";
  const isViewer = currentUserOrganizer?.permissionLevel === "Viewer";

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const [orgs, invs] = await Promise.all([
        getOrganizers(token, eventId),
        getInvitations(token, eventId),
      ]);
      setOrganizers(orgs);
      setInvitations(invs);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to load team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventId, invitationsVersion]);

  const handleInviteSuccess = (result: { emailSent: boolean; acceptUrl: string; message: string }) => {
    if (result.emailSent) {
      setInviteSuccess("Invitation sent successfully.");
    } else {
      setInviteSuccess(
        `${result.message} Copy this link for ${result.acceptUrl ? "the client" : "them"}: ${result.acceptUrl}`
      );
    }
    setIsInviteOpen(false);
    void fetchData();
  };

  const sortedOrganizers = useMemo(() => {
    return [...organizers].sort((a, b) => {
      if (a.role === "Owner") return -1;
      if (b.role === "Owner") return 1;
      return getUserDisplayName(a).localeCompare(getUserDisplayName(b));
    });
  }, [organizers]);

  const handleUpdateRole = async (
    userId: string,
    targetType: "role" | "permissionLevel",
    newValue: string
  ) => {
    if (!user) return;
    try {
      setUpdatingUserId(userId);
      setError(null);
      const token = await user.getIdToken();
      const targetOrganizer = organizers.find((o) => o.userId === userId);
      if (!targetOrganizer) return;
      await updateOrganizerRole(token, eventId, userId, {
        role: targetType === "role" ? newValue : targetOrganizer.role,
        permissionLevel:
          targetType === "permissionLevel" ? newValue : targetOrganizer.permissionLevel,
      });
      await fetchData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || "Failed to update member role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <section className={rf.panel}>
      <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", rf.panelHeader)}>
        <div className="min-w-0">
          <h2 className={rf.sectionTitle}>Team</h2>
          <p className={cn("mt-0.5", rf.caption)}>
            Manage collaborators, permissions, and invitations
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <GlassButton type="button" variant="ghost" onClick={openHub} className="gap-1.5">
            <MessageSquare size={14} aria-hidden />
            Chat hub
          </GlassButton>
          {!isViewer && (
            <GlassButton type="button" variant="primary" onClick={() => setIsInviteOpen(true)} className="gap-1.5">
              <UserPlus size={14} aria-hidden />
              Invite
            </GlassButton>
          )}
        </div>
      </div>

      <div className={rf.panelBody}>
        {inviteSuccess && (
          <p className="mb-3 text-sm font-medium text-success">{inviteSuccess}</p>
        )}

        {loading ? (
          <p className={cn("animate-pulse text-sm italic", vg.subtitle)}>Loading team…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className={vg.label}>Team members</h3>
              {sortedOrganizers.length === 0 ? (
                <p className={cn("text-sm", vg.subtitle)}>No active team members.</p>
              ) : (
                sortedOrganizers.map((organizer) => (
                  <TeamMemberCard
                    key={organizer.userId}
                    organizer={organizer}
                    isOwner={isOwner}
                    isUpdating={updatingUserId === organizer.userId}
                    onUpdateRole={handleUpdateRole}
                  />
                ))
              )}
            </div>

            {invitations.length > 0 && (
              <div className="space-y-3 border-t border-white/40 pt-6">
                <h3 className={vg.label}>Invitations</h3>
                <div className="grid grid-cols-1 gap-3">
                  {invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-xl border border-white/55 bg-white/40 p-3 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/55 bg-white/50 text-muted-foreground ring-1 ring-white/60">
                          <Mail size={18} aria-hidden />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{inv.email}</p>
                          <p className={cn("text-[10px] italic", vg.caption)}>
                            Invited {new Date(inv.invitedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {inv.isAccepted ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 size={12} aria-hidden />
                            Accepted
                          </Badge>
                        ) : inv.isExpired ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle size={12} aria-hidden />
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="accent" className="gap-1">
                            <Clock size={12} aria-hidden />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        eventId={eventId}
        onInviteSuccess={handleInviteSuccess}
      />
    </section>
  );
};

export default TeamSection;
