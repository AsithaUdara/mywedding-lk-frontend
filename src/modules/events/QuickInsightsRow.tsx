"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/shared/context/AuthContext";
import { getBudgetOverview } from "@/shared/lib/api/budget";
import { getTasksForEvent } from "@/shared/lib/api/tasks";
import { getOrganizers } from "@/shared/lib/api/events";
import { Wallet, CheckSquare, Users } from "lucide-react";
import { StatCard, StatGridSkeleton } from "@/shared/components/ui";
import { useRealTime } from "@/shared/context/RealTimeContext";

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
          setBudgetUsage(Math.min((budget.totalSpent / budget.totalBudget) * 100, 100));
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
      <div className="mb-8">
        <StatGridSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard
        label="Budget usage"
        value={`${budgetUsage.toFixed(0)}%`}
        sub="spent"
        icon={Wallet}
        iconTheme="accent"
        index={0}
      />
      <StatCard
        label="Tasks done"
        value={taskProgress.completed}
        sub={`of ${taskProgress.total}`}
        icon={CheckSquare}
        iconTheme="primary"
        index={1}
      />
      <StatCard
        label="Team size"
        value={teamSize}
        sub="members"
        icon={Users}
        iconTheme="muted"
        index={2}
      />
    </div>
  );
};

export default QuickInsightsRow;
