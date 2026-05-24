"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerOverview, updatePlannerSubscription } from "@/shared/lib/api/planner";
import {
  ErrorBanner,
  LoadingState,
  PageHeader,
  SuccessBanner,
} from "@/modules/planner/components/ui";

const PRO_FEATURES = [
  "Unlimited concurrent weddings",
  "Priority AI itinerary & vendor match",
  "Team collaboration on every event",
  "Advanced booking & payment tracking",
];

export default function PlannerBillingPage() {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState("Free");
  const [maxConcurrentEvents, setMaxConcurrentEvents] = useState(1);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const overview = await getPlannerOverview(token);
      setActivePlan(overview.activePlanTier);
      setMaxConcurrentEvents(overview.maxConcurrentEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load billing data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const upgrade = async () => {
    if (!user) return;
    try {
      setUpgrading(true);
      setError(null);
      setMessage(null);
      const token = await user.getIdToken();
      await updatePlannerSubscription(token, { tier: "PlannerPro", monthlyFee: 12000 });
      setMessage("PlannerPro activated successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed.");
    } finally {
      setUpgrading(false);
    }
  };

  const isPro = activePlan === "PlannerPro";

  if (loading) {
    return <LoadingState label="Loading billing…" />;
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Billing & Plan"
        description="Manage your planner subscription and event capacity."
        badge={activePlan}
      />

      {error && <ErrorBanner message={error} />}
      {message && <SuccessBanner message={message} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
              <Zap size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current plan</p>
              <p className="font-playfair text-3xl font-bold text-charcoal">{activePlan}</p>
            </div>
          </div>
          <p className="mt-6 text-slate-600">
            You can run{" "}
            <span className="font-bold text-charcoal">{maxConcurrentEvents}</span> concurrent wedding
            {maxConcurrentEvents === 1 ? "" : "s"} on this plan.
          </p>
          {isPro && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              <Check size={16} />
              Active subscription
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-white to-accent/10 p-8 shadow-lg"
        >
          <div className="flex items-center gap-2 text-primary">
            <Crown size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">PlannerPro</span>
          </div>
          <p className="mt-3 font-playfair text-4xl font-bold text-charcoal">
            LKR 12,000
            <span className="text-lg font-normal text-slate-500"> / month</span>
          </p>
          <ul className="mt-6 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={upgrade}
            disabled={upgrading || isPro}
            className="mt-8 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:opacity-60"
          >
            {isPro ? "Current plan" : upgrading ? "Upgrading…" : "Upgrade to PlannerPro"}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
