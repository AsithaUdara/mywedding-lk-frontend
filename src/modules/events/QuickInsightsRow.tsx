"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getBudgetOverview } from "@/shared/lib/api/budget";
import { getTasksForEvent } from "@/shared/lib/api/tasks";
import { getOrganizers } from "@/shared/lib/api/events";
import { budgetUsagePercent, formatPercentDisplay } from "@/shared/lib/format";
import { Wallet, CheckSquare, Users } from "lucide-react";
import { StatGridSkeleton } from "@/shared/components/ui";
import { useRealTime } from "@/shared/context/RealTimeContext";
import { EventStatCard } from "./EventStatCard";
import { eventWorkspace } from "./event-workspace";

interface QuickInsightsRowProps {
  eventId: string;
}

const QuickInsightsRow = ({ eventId }: QuickInsightsRowProps) => {
  const { user } = useAuth();
  const { budgetVersion, checklistVersion, invitationsVersion } = useRealTime();
  const [loading, setLoading] = useState(true);

  const [budgetUsage, setBudgetUsage] = useState<number>(0);
  const [taskProgress, setTaskProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 0,
  });
  const [teamSize, setTeamSize] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    const fetchInsights = async () => {
      try {
        const token = await user.getIdToken();

        const [budget, tasks, organizers] = await Promise.all([
          getBudgetOverview(token, eventId).catch(() => null),
          getTasksForEvent(token, eventId).catch(() => []),
          getOrganizers(token, eventId).catch(() => []),
        ]);

        if (budget && budget.totalBudget > 0) {
          setBudgetUsage(budgetUsagePercent(budget.totalSpent, budget.totalBudget));
        }

        if (tasks) {
          const completed = tasks.filter((t) => t.status === "Completed").length;
          setTaskProgress({ completed, total: tasks.length });
        }

        if (organizers) {
          setTeamSize(organizers.length);
        }
      } catch (error) {
        console.error("Failed to fetch quick insights:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchInsights();
  }, [user, eventId, budgetVersion, checklistVersion, invitationsVersion]);

  if (loading) {
    return (
      <div>
        <StatGridSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className={eventWorkspace.statGrid}>
      <EventStatCard
        label="Budget usage"
        value={formatPercentDisplay(budgetUsage)}
        sub="of planned budget spent"
        icon={Wallet}
      />
      <EventStatCard
        label="Tasks done"
        value={taskProgress.completed}
        sub={`${taskProgress.total} total tasks`}
        icon={CheckSquare}
      />
      <EventStatCard
        label="Team size"
        value={teamSize}
        sub={teamSize === 1 ? "active member" : "active members"}
        icon={Users}
      />
    </div>
  );
};

export default QuickInsightsRow;
