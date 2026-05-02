"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getBudgetOverview } from '@/lib/api/budget';
import { getTasksForEvent } from '@/lib/api/tasks';
import { getOrganizers } from '@/lib/api/events';
import { Wallet, CheckSquare, Users } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import { useRealTime } from '@/context/RealTimeContext';

interface QuickInsightsRowProps {
  eventId: string;
}

const QuickInsightsRow = ({ eventId }: QuickInsightsRowProps) => {
  const { user } = useAuth();
  const { budgetVersion, checklistVersion, invitationsVersion } = useRealTime();
  const [loading, setLoading] = useState(true);
  
  const [budgetUsage, setBudgetUsage] = useState<number>(0);
  const [taskProgress, setTaskProgress] = useState<{ completed: number, total: number }>({ completed: 0, total: 0 });
  const [teamSize, setTeamSize] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    const fetchInsights = async () => {
      try {
        const token = await user.getIdToken();
        
        // Fetch all data in parallel
        const [budget, tasks, organizers] = await Promise.all([
          getBudgetOverview(token, eventId).catch(() => null),
          getTasksForEvent(token, eventId).catch(() => []),
          getOrganizers(token, eventId).catch(() => [])
        ]);

        if (budget && budget.totalBudget > 0) {
          setBudgetUsage(Math.min((budget.totalSpent / budget.totalBudget) * 100, 100));
        }

        if (tasks) {
          const completed = tasks.filter(t => t.status === 'Completed').length;
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

    fetchInsights();
  }, [user, eventId, budgetVersion, checklistVersion, invitationsVersion]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Budget Insight */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
          <Wallet size={20} className="text-green-600" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Budget Usage</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-charcoal">{budgetUsage.toFixed(0)}%</span>
            <span className="text-xs font-medium text-gray-500">spent</span>
          </div>
        </div>
      </div>

      {/* Task Insight */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CheckSquare size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Tasks Done</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-charcoal">{taskProgress.completed}</span>
            <span className="text-xs font-medium text-gray-500">of {taskProgress.total}</span>
          </div>
        </div>
      </div>

      {/* Team Insight */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Users size={20} className="text-blue-600" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Team Size</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-charcoal">{teamSize}</span>
            <span className="text-xs font-medium text-gray-500">members</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickInsightsRow;
