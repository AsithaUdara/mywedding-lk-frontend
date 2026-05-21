"use client";

import React, { useEffect, useState } from 'react';
import MyStyleSection from '@/modules/events/MyStyleSection';
import StyleQuizModal from '@/modules/events/StyleQuizModal';
import { useAuth } from '@/shared/context/AuthContext';
import { getEventById } from '@/shared/lib/api/events';

export default function StylePage({ params }: { params: { eventId: string } }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Record<string, string> | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user || !params.eventId) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const event = await getEventById(token, params.eventId);
      
      if (event?.stylePreferences) {
        try {
          const parsed = JSON.parse(event.stylePreferences);
          setPreferences(parsed);
        } catch (e) {
          console.error("Failed to parse style preferences JSON string", e);
          setPreferences(null);
        }
      } else {
        setPreferences(null);
      }
    } catch (error) {
      console.error("Failed to fetch event style preferences", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user, params.eventId]);

  const handleQuizClose = () => {
    setIsQuizOpen(false);
    fetchPreferences(); // Reload preferences after quiz completes
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <MyStyleSection 
        preferences={preferences} 
        onOpenQuiz={() => setIsQuizOpen(true)} 
      />

      <StyleQuizModal
        isOpen={isQuizOpen}
        onClose={handleQuizClose}
        eventId={params.eventId}
      />
    </div>
  );
}

