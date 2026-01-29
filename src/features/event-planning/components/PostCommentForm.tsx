// File: src/features/event-planning/components/PostCommentForm.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { postComment } from '@/lib/api/events';

const PostCommentForm = ({ eventId, onCommentPosted }: { eventId: string; onCommentPosted: () => void; }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      await postComment(token, eventId, content);
      setContent('');
      setIsFocused(false);
      onCommentPosted();
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
        {user?.displayName?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div className="flex-grow">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Start a conversation, ask a question..."
          rows={isFocused ? 3 : 1}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none transition-all duration-300"
        />
        {isFocused && (
          <div className="flex justify-end gap-3 mt-2">
            <button 
              type="button" 
              onClick={() => { setIsFocused(false); setContent(''); }} 
              className="px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !content.trim()} 
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default PostCommentForm;
