"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Mail, UserCheck, Users } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { getPlannerClients, PlannerClientItem } from "@/shared/lib/api/planner";
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
  PageHeader,
  StatCard,
} from "@/modules/planner/components/ui";
import Link from "next/link";

export default function PlannerClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<PlannerClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getPlannerClients(token);
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const totalWeddings = clients.reduce((s, c) => s + c.totalEvents, 0);
  const activeWeddings = clients.reduce((s, c) => s + c.activeEvents, 0);

  return (
    <section className="space-y-8">
      <PageHeader
        title="Clients"
        description="Couples and families attached to your managed weddings."
        badge={`${clients.length} clients`}
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          index={0}
          label="Total clients"
          value={clients.length}
          icon={<Users size={22} />}
          color="bg-gradient-to-br from-primary to-primary/80"
        />
        <StatCard
          index={1}
          label="Weddings managed"
          value={totalWeddings}
          icon={<Calendar size={22} />}
          color="bg-gradient-to-br from-violet-500 to-purple-600"
        />
        <StatCard
          index={2}
          label="Active now"
          value={activeWeddings}
          icon={<UserCheck size={22} />}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
      </div>

      {loading ? (
        <LoadingState label="Loading clients…" />
      ) : clients.length === 0 ? (
        <EmptyState
          title="No clients linked yet"
          description="Create a wedding in Events and assign a client email to see them here."
          action={
            <Link
              href="/planner/events"
              className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Go to Events
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((client, i) => (
            <motion.article
              key={client.clientUserId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/20 text-lg font-bold text-primary">
                  {(client.clientEmail || "?").charAt(0).toUpperCase()}
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Users size={18} />
                </div>
              </div>
              <p className="mt-4 font-semibold text-charcoal">{client.clientEmail || "Unknown client"}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <Mail size={12} />
                ID {client.clientUserId.slice(0, 8)}…
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weddings</p>
                  <p className="text-xl font-bold text-charcoal">{client.totalEvents}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active</p>
                  <p className="text-xl font-bold text-emerald-600">{client.activeEvents}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Last activity {new Date(client.lastActivityAt).toLocaleDateString()}
              </p>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
