"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/shared/context/AuthContext";
import { createTask } from "@/shared/lib/api/tasks";
import { postComment } from "@/shared/lib/api/feed";
import { inputClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

interface CreateTaskFormProps {
  eventId: string;
  onTaskCreated: () => void;
  onCancel: () => void;
}

const CreateTaskForm = ({ eventId, onTaskCreated, onCancel }: CreateTaskFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const trimmedTitle = title.trim();
      await createTask(token, eventId, { title: trimmedTitle });

      // Optional activity comment: never block or surface errors to the task flow.
      void postComment(token, eventId, `Added a new task: "${trimmedTitle}"`).catch(() => {});

      setTitle("");
      onTaskCreated();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-5 backdrop-blur-sm"
    >
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          autoFocus
          className={cn(glassInput, "font-medium")}
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 pl-1 text-xs font-bold text-destructive"
          >
            ! {error}
          </motion.p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <GlassButton type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="primary" disabled={loading || !title.trim()}>
            {loading ? "Adding task…" : "Add task"}
          </GlassButton>
        </div>
      </div>
    </motion.form>
  );
};

export default CreateTaskForm;
