// File: src/features/event-planning/components/StyleQuizModal.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { setEventPreferences } from '@/lib/api/events';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface StyleQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

const quizQuestions = [
  {
    key: 'style',
    question: 'Which style best represents your dream wedding?',
    options: [
      { value: 'traditional', label: 'Classic & Traditional', imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80' },
      { value: 'modern', label: 'Modern & Minimalist', imageUrl: 'https://images.unsplash.com/photo-1522159344217-133b8a531b26?auto=format&fit=crop&w=800&q=80' },
    ],
  },
  {
    key: 'photography',
    question: 'Which photo style do you prefer?',
    options: [
      { value: 'candid', label: 'Candid & Natural', imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80' },
      { value: 'posed', label: 'Posed & Editorial', imageUrl: 'https://images.unsplash.com/photo-1597861405922-24d85a5d0a6c?auto=format&fit=crop&w=800&q=80' },
    ],
  },
  {
    key: 'priority',
    question: "What's more important for your reception?",
    options: [
      { value: 'food', label: 'Exquisite Food', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80' },
      { value: 'music', label: 'Unforgettable Music', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' },
    ],
  },
];

const StyleQuizModal = ({ isOpen, onClose, eventId }: StyleQuizModalProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectOption = async (key: string, value: string) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // This is the final step, submit the preferences
      setLoading(true);
      setError(null);
      try {
        if (!user) throw new Error("User not found");
        const token = await user.getIdToken();
        await setEventPreferences(token, eventId, newPreferences);
        onClose(); // Close modal on success
      } catch (err: any) {
        setError(err.message || "Failed to save preferences.");
      } finally {
        setLoading(false);
      }
    }
  };

  const progressPercentage = ((currentStep + 1) / quizQuestions.length) * 100;
  const currentQuestion = quizQuestions[currentStep];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm modal-container">
      <div className="relative w-full max-w-3xl p-8 rounded-xl shadow-2xl bg-cream">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold font-playfair text-charcoal text-center mb-8">{currentQuestion.question}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelectOption(currentQuestion.key, option.value)}
                  disabled={loading}
                  className="group relative h-64 rounded-lg overflow-hidden border-4 border-transparent hover:border-primary focus:border-primary focus:outline-none transition-all duration-300"
                >
                  <Image 
                    src={option.imageUrl} 
                    alt={option.label} 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">{option.label}</h3>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {error && <p className="text-red-500 text-center mt-6 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default StyleQuizModal;
