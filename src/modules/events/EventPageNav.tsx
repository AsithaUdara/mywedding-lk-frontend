"use client";

import React from "react";
import { useUI } from "@/shared/context/UIContext";
import { MessageSquare, LayoutGrid } from "lucide-react";

const EventPageNav = () => {
  const { openHub } = useUI();

  return (
    <div className="mb-8 flex items-center gap-2 rounded-lg border border-border bg-card p-2 shadow-sm">
      <button
        type="button"
        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary/10 px-4 py-2 font-semibold text-primary"
      >
        <LayoutGrid size={18} aria-hidden /> Activity
      </button>
      <button
        type="button"
        onClick={openHub}
        className="group relative flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 font-semibold text-foreground hover:bg-muted"
      >
        <div className="relative">
          <MessageSquare size={18} aria-hidden />
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm transition-transform group-hover:scale-110">
            3
          </span>
        </div>
        Team Chat
      </button>
    </div>
  );
};

export default EventPageNav;
