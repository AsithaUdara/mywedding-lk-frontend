"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Organizer, getOrganizers, getInvitations, type Invitation, updateOrganizerRole } from '@/lib/api/events';
import { UserPlus, Users, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRealTime } from '@/context/RealTimeContext';
import InviteMemberModal from './InviteMemberModal';
import TeamMemberCard from './TeamMemberCard';

interface TeamSectionProps {
  eventId: string;
}

const TeamSection: React.FC<TeamSectionProps> = ({ eventId }) => {
  const { user } = useAuth();
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
    return organizers.find(o => o.userId === user.uid);
  }, [organizers, user]);

  const isOwner = currentUserOrganizer?.role === 'Owner';

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();

      const [orgs, invs] = await Promise.all([
        getOrganizers(token, eventId),
        getInvitations(token, eventId)
      ]);

      setOrganizers(orgs);
      setInvitations(invs);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to load team data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventId, invitationsVersion]);

  const handleInviteSuccess = () => {
    setInviteSuccess('Invitation sent successfully.');
    setIsInviteOpen(false);
    void fetchData();
  };

  const sortedOrganizers = useMemo(() => {
    return [...organizers].sort((a, b) => {
      if (a.role === 'Owner') return -1;
      if (b.role === 'Owner') return 1;
      return a.firstName.localeCompare(b.firstName);
    });
  }, [organizers]);

  const handleUpdateRole = async (userId: string, targetType: 'role' | 'permissionLevel', newValue: string) => {
    if (!user) return;
    try {
      setUpdatingUserId(userId);
      setError(null);
      const token = await user.getIdToken();

      const targetOrganizer = organizers.find(o => o.userId === userId);
      if (!targetOrganizer) return;

      const dataToSubmit = {
        role: targetType === 'role' ? newValue : targetOrganizer.role,
        permissionLevel: targetType === 'permissionLevel' ? newValue : targetOrganizer.permissionLevel,
      };

      await updateOrganizerRole(token, eventId, userId, dataToSubmit);
      await fetchData(); // Refresh the list
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to update member role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <section className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-charcoal" />
          <h2 className="text-2xl font-bold text-charcoal">Team & Collaborators</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={18} />
          Invite member
        </button>
      </div>

      {inviteSuccess && <p className="text-green-600 text-sm mb-2">{inviteSuccess}</p>}

      {loading ? (
        <p className="text-gray-600 italic animate-pulse">Loading team & invitations...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="space-y-6">
          {/* Active Members */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Team Members</h3>
            {sortedOrganizers.length === 0 ? (
              <p className="text-gray-500 text-sm">No active team members.</p>
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

          {/* Pending/Recent Invitations */}
          {invitations.length > 0 && (
            <div className="space-y-3 border-t border-slate-50 pt-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Invitations</h3>
              <div className="grid grid-cols-1 gap-3">
                {invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-charcoal text-sm">{inv.email}</p>
                        <p className="text-[10px] text-slate-400 italic">Invited {new Date(inv.invitedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {inv.isAccepted ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">
                          <CheckCircle2 size={12} /> Accepted
                        </span>
                      ) : inv.isExpired ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100">
                          <AlertCircle size={12} /> Expired
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-full border border-orange-100">
                          <Clock size={12} /> Pending
                        </span>
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
