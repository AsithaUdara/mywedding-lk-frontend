"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Organizer, getOrganizers } from '@/lib/api/events';
import { UserPlus, Users } from 'lucide-react';
import InviteMemberModal from './InviteMemberModal';
import TeamMemberCard from './TeamMemberCard';

interface TeamSectionProps {
  eventId: string;
}

const TeamSection: React.FC<TeamSectionProps> = ({ eventId }) => {
  const { user } = useAuth();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const fetchOrganizers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const list = await getOrganizers(token, eventId);
      setOrganizers(list);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to load team.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, eventId]);

  const handleInviteSuccess = () => {
    setInviteSuccess('Invitation sent successfully.');
    setIsInviteOpen(false);
    void fetchOrganizers();
  };

  const sortedOrganizers = useMemo(() => {
    return [...organizers].sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [organizers]);

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
        <p className="text-gray-600">Loading team...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="space-y-3 mb-2">
          {sortedOrganizers.length === 0 ? (
            <p className="text-gray-600">No collaborators yet.</p>
          ) : (
            sortedOrganizers.map((organizer) => (
              <TeamMemberCard key={organizer.userId} organizer={organizer} />
            ))
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
