"use client";

import React, { useState } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { postComment } from "@/shared/lib/api/feed";
import { inputClass } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

const PostCommentForm = ({
  eventId,
  onCommentPosted,
}: {
  eventId: string;
  onCommentPosted: () => void;
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      await postComment(token, eventId, content);
      setContent("");
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
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
        {user?.displayName?.charAt(0).toUpperCase() || "U"}
      </div>
      <div className="flex-grow">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Start a conversation, ask a question..."
          rows={isFocused ? 3 : 1}
          className={cn(inputClass, "resize-none transition-all duration-300")}
        />
        {isFocused && (
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsFocused(false);
                setContent("");
              }}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default PostCommentForm;
