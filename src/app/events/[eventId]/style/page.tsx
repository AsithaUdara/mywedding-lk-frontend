"use client";

import React, { use } from "react";
import { EmptyState } from "@/shared/components/ui";
import { Palette } from "lucide-react";
import { cp } from "@/modules/client/client-theme";
import { cn } from "@/shared/lib/cn";

export default function DesignBoardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  void eventId;

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={cn(cp.panel)}>
        <EmptyState
          title="Design board coming soon"
          description="Your planner will share inspiration boards and mood imagery here. Upload Pinterest saves and photos when this feature launches."
          icon={Palette}
        />
      </div>
    </div>
  );
}
