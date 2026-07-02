"use client";

import { Bookmark, Building2, ImageIcon } from "lucide-react";
import type { SettingsTab } from "@/modules/planner/settings/plannerSettingsHelpers";
import { cn } from "@/shared/lib/cn";

const TAB_OPTIONS: { value: SettingsTab; label: string; icon: typeof Building2 }[] = [
  { value: "profile", label: "Studio profile", icon: Building2 },
  { value: "branding", label: "Agency branding", icon: ImageIcon },
  { value: "templates", label: "Task templates", icon: Bookmark },
];

type SettingsToolbarProps = {
  tab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
};

export function SettingsToolbar({ tab, onTabChange }: SettingsToolbarProps) {
  return (
    <div className="mb-5 space-y-2 border-b border-[#EBECF0] pb-4">
      <div
        role="tablist"
        aria-label="Settings sections"
        className="inline-flex w-full flex-wrap rounded-lg border border-[#DFE1E6] bg-[#F4F5F7] p-1 lg:w-auto"
      >
        {TAB_OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = tab === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(option.value)}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors lg:flex-initial lg:px-4",
                active
                  ? "bg-white text-[#172B4D] shadow-sm"
                  : "text-[#5E6C84] hover:text-[#172B4D]"
              )}
            >
              <Icon size={14} aria-hidden />
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[#5E6C84]">
        {tab === "profile"
          ? "Update your studio name, description, and contact details."
          : tab === "branding"
            ? "Upload your agency logo for white-label client materials on Planner Pro."
            : "Manage reusable task checklists saved from your weddings."}
      </p>
    </div>
  );
}
