"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { sendInvitation } from '@/lib/api/events';
import { X, Mail } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onInviteSuccess: () => void;
}

const InviteMemberModal = ({ isOpen, onClose, eventId, onInviteSuccess }: InviteMemberModalProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
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

      await sendInvitation(token, {
        eventId,
        email,
      });

      onInviteSuccess(); // This calls the function from the parent to refresh the list

    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg p-8 rounded-xl shadow-2xl bg-[#FFFDF9]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors"><X size={24} /></button>
        <h2 className="text-3xl font-bold font-playfair text-charcoal text-center mb-6">Invite a Team Member</h2>

        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg text-center mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="inviteEmail" className="block text-sm font-medium text-charcoal mb-2">Member&apos;s Email</label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="inviteEmail"
                type="email"
                placeholder="e.g., family.member@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              We will send an invitation email with a link for them to join this event.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-3 rounded-lg text-white font-semibold shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed bg-primary"
          >
            {loading ? 'Sending Invite...' : 'Send Invitation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
