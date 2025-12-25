// File: src/features/event-planning/components/TeamSection.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOrganizers } from '@/lib/api/events';
import { Organizer } from '@/lib/api/events'; // Import the type
import { PlusCircle, Users } from 'lucide-react';
import TeamMemberCard from './TeamMemberCard'; // We will create this next
import InviteMemberModal from './InviteMemberModal'; // We will create this next

interface TeamSectionProps {
  eventId: string;
}

const TeamSection = ({ eventId }: TeamSectionProps) => {
  const { user } = useAuth();
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  // We wrap fetchOrganizers in useCallback to prevent re-creating it on every render
  const fetchOrganizers = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      const data = await getOrganizers(token, eventId);
      setOrganizers(data);
    } catch (error) {
      console.error("Failed to fetch organizers:", error);
      // Here you could show a toast error message to the user
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId]);

  // Fetch the data when the component first loads
  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  const handleInviteSuccess = () => {
    setModalOpen(false); // Close the modal
    fetchOrganizers();   // Re-fetch the list to show the new member
  };

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div className="flex items-center gap-3">
            <Users className="text-primary" size={24} />
            <h2 className="text-2xl font-semibold text-charcoal">Family & Team</h2>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 bg-primary hover:bg-opacity-90"
          >
            <PlusCircle size={16} />
            <span>Invite Member</span>
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading team members...</p>
        ) : organizers.length === 0 ? (
          <p className="text-center text-gray-500">No team members have been invited yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizers.map((organizer) => (
              <TeamMemberCard key={organizer.userId} organizer={organizer} />
            ))}
          </div>
        )}
      </div>

      <InviteMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        eventId={eventId}
        onInviteSuccess={handleInviteSuccess}
      />
    </>
  );
};

export default TeamSection;
