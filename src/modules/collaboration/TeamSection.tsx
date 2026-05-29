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
import { UserPlus, Users, Mail, Clock, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { useUI } from "@/shared/context/UIContext";
import InviteMemberModal from "./InviteMemberModal";
import TeamMemberCard from "./TeamMemberCard";
import { Button, Badge } from "@/shared/components/ui";
import { cp } from "@/modules/client/client-theme";

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

  const handleInviteSuccess = () => {
    setInviteSuccess("Invitation sent successfully.");
    setIsInviteOpen(false);
    void fetchData();
  };

  const sortedOrganizers = useMemo(() => {
    return [...organizers].sort((a, b) => {
      if (a.role === "Owner") return -1;
      if (b.role === "Owner") return 1;
      return a.firstName.localeCompare(b.firstName);
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
    <section className={cp.panel}>
      <div className="mb-5 flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Users size={16} strokeWidth={2} className="text-primary" aria-hidden />
          </div>
          <h2 className={cp.sectionTitle}>Team</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={openHub}>
            <MessageSquare size={14} aria-hidden />
            Chat hub
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={() => setIsInviteOpen(true)}>
            <UserPlus size={14} aria-hidden />
            Invite
          </Button>
        </div>
      </div>

      {inviteSuccess && (
        <p className="mb-3 text-sm font-medium text-success">{inviteSuccess}</p>
      )}

      {loading ? (
        <p className="animate-pulse text-sm italic text-muted-foreground">Loading team…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className={cp.label}>Team members</h3>
            {sortedOrganizers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active team members.</p>
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
            <div className="space-y-3 border-t border-border pt-6">
              <h3 className={cp.label}>Invitations</h3>
              <div className="grid grid-cols-1 gap-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                        <Mail size={18} aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{inv.email}</p>
                        <p className="text-[10px] italic text-muted-foreground">
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
