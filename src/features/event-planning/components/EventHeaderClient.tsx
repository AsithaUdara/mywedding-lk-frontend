"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getEventById, getOrganizers, type Organizer } from '@/lib/api/events';
import Skeleton from '@/components/ui/Skeleton';
import { useUI } from '@/context/UIContext';
import { Calendar, MessageSquare, Users } from 'lucide-react';

interface EventHeaderClientProps {
  eventId: string;
}

const EventHeaderClient = ({ eventId }: EventHeaderClientProps) => {
  const { user } = useAuth();
  const { openHub } = useUI();
  const [event, setEvent] = useState<{ eventName: string; eventDate: string } | null>(null);
  const [team, setTeam] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchEventHeaderData = async () => {
      try {
        const token = await user.getIdToken();
        const [eventData, teamData] = await Promise.all([
          getEventById(token, eventId),
          getOrganizers(token, eventId)
        ]);

        if (eventData) {
          setEvent(eventData);
          
          // Calculate countdown
          const eventDateObj = new Date(eventData.eventDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          eventDateObj.setHours(0, 0, 0, 0);
          
          const timeDiff = eventDateObj.getTime() - today.getTime();
          const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
          setDaysRemaining(days > 0 ? days : 0);
        }

        if (teamData) {
          setTeam(teamData);
        }
      } catch (error) {
        console.error('Failed to fetch event header', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventHeaderData();
  }, [user, eventId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-50">
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-white/60 backdrop-blur-xl">
      {/* Soft gradient background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold font-playfair text-charcoal mb-3 tracking-tight">
          {event.eventName}
        </h1>
        <div className="flex items-center text-gray-500 font-medium">
          <Calendar size={18} className="mr-2 text-primary/60" />
          <span>
            {new Date(event.eventDate).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-stretch gap-4">
        {/* Team Collaboration Box - Refined for 'Box Type' alignment */}
        <div className="bg-gradient-to-br from-cream to-white border border-gray-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm min-w-[220px] transition-all hover:shadow-md border-white/60">
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <p className="text-[9px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-0.5">Team Hub</p>
              <p className="text-sm font-bold text-charcoal">{team.length} Collaborators</p>
            </div>
            <div className="flex -space-x-2.5 overflow-hidden p-0.5">
              {team.slice(0, 3).map((member, i) => (
                <div 
                  key={member.userId} 
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/5 shadow-sm"
                  title={`${member.firstName} ${member.lastName}`}
                >
                  {member.firstName[0]}{member.lastName[0]}
                </div>
              ))}
              {team.length > 3 && (
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                  +{team.length - 3}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={openHub}
            className="group flex items-center justify-center gap-2 w-full py-2.5 bg-charcoal text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-charcoal/10 active:scale-95"
          >
            <MessageSquare size={13} className="group-hover:scale-110 transition-transform" />
            Open Team Hub
          </button>
        </div>

        {daysRemaining !== null && (
          <div className="bg-gradient-to-br from-cream to-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm min-w-[160px] flex flex-col justify-center transform transition-transform hover:-translate-y-1 duration-300 border-white/60">
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
               Countdown
            </div>
            <div className="flex items-baseline justify-center gap-1.5 text-primary">
              <span className="text-5xl font-playfair font-bold leading-none">{daysRemaining}</span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">days</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventHeaderClient;
