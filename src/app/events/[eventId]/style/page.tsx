"use client";

import React, { use } from "react";
import { EmptyState } from "@/shared/components/ui";
import { Palette } from "lucide-react";
import { GlassSectionCard } from "@/modules/vendor/dashboard/glass-ui";
import { eventWorkspace } from "@/modules/events/event-workspace";

export default function DesignBoardPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  void eventId;

  return (
    <div className={eventWorkspace.pageEnter}>
      <GlassSectionCard title="Design board" subtitle="Inspiration and mood boards from your planner">
        <EmptyState
          title="Design board coming soon"
          description="Your planner will share inspiration boards and mood imagery here. Upload Pinterest saves and photos when this feature launches."
          icon={Palette}
        />
      </GlassSectionCard>
    </div>
  );
}
