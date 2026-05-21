"use client";

import React, { useState } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { sendInquiry } from '@/shared/lib/api/vendors';
import { X, Send } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  vendorName: string;
}

const InquiryModal = ({ isOpen, onClose, vendorId, vendorName }: InquiryModalProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const token = await user.getIdToken();
      await sendInquiry(token, vendorId, message);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMessage('');
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send inquiry.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Contact {vendorName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {success ? (
          <div className="p-8 text-center text-green-600">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={32} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
            <p className="text-gray-600">The vendor will reply to your registered email soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I'm interested in your services for my wedding. Could you please provide more details about your packages and availability?"
                rows={5}
                required
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-none outline-none"
              />
            </div>
            
            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
            
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full py-4 rounded-lg text-white font-semibold flex items-center justify-center disabled:opacity-50 transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InquiryModal;
