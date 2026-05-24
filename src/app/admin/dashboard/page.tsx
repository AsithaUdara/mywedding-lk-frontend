"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getPlatformStats,
  PlatformStats,
  getPayoutDue,
  markPayoutSettled,
  PayoutDueItem,
} from "@/shared/lib/api/admin";
import { Users, Store, CalendarHeart, CalendarCheck, ArrowRight, Banknote } from "lucide-react";
import {
  ErrorBanner,
  EmptyState,
  LoadingState,
  PageHeader,
  SectionCard,
  StatCard,
} from "@/modules/admin/dashboard/ui";
import { PrimaryButton } from "@/modules/admin/dashboard/components";
import {
  DataTable,
  TableShell,
  Td,
  Th,
} from "@/modules/vendor/dashboard/components";

function formatLKR(amount: number) {
  return `LKR ${amount.toLocaleString()}`;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [payoutDue, setPayoutDue] = useState<PayoutDueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setError(null);
        const token = await user.getIdToken();
        const [statsData, payoutData] = await Promise.all([
          getPlatformStats(token),
          getPayoutDue(token),
        ]);
        setStats(statsData);
        setPayoutDue(payoutData);
      } catch {
        setError("Failed to load platform statistics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSettle = async (settlementId: string) => {
    if (!user) return;
    try {
      setSettlingId(settlementId);
      const token = await user.getIdToken();
      await markPayoutSettled(token, settlementId);
      setPayoutDue((prev) => prev.filter((x) => x.id !== settlementId));
    } catch {
      setError("Failed to mark payout as settled.");
    } finally {
      setSettlingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="Live metrics and payout operations across MyWedding.lk."
        action={
          <Link
            href="/admin/vendors"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-charcoal shadow-sm transition hover:border-primary/30 hover:text-primary"
          >
            Review vendors
            <ArrowRight size={16} />
          </Link>
        }
      />

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingState label="Loading platform data..." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              index={0}
              label="Total users"
              value={stats?.totalUsers.toLocaleString() ?? "—"}
              icon={Users}
              theme="blue"
            />
            <StatCard
              index={1}
              label="Total vendors"
              value={stats?.totalVendors.toLocaleString() ?? "—"}
              icon={Store}
              theme="green"
            />
            <StatCard
              index={2}
              label="Total events"
              value={stats?.totalEvents.toLocaleString() ?? "—"}
              icon={CalendarHeart}
              theme="violet"
            />
            <StatCard
              index={3}
              label="Total bookings"
              value={stats?.totalBookings.toLocaleString() ?? "—"}
              icon={CalendarCheck}
              theme="amber"
            />
          </div>

          <SectionCard
            title="Vendor payout queue"
            subtitle="Settlements ready for manual transfer (commission already deducted)"
            action={
              payoutDue.length > 0 ? (
                <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  {payoutDue.length} pending
                </span>
              ) : null
            }
          >
            {payoutDue.length === 0 ? (
              <EmptyState
                icon={Banknote}
                title="No pending settlements"
                description="Completed bookings with vendor payouts will appear here when ready to settle."
              />
            ) : (
              <TableShell>
                <DataTable>
                  <thead>
                    <tr>
                      <Th>Booking</Th>
                      <Th>Gross</Th>
                      <Th>Commission</Th>
                      <Th>Vendor net</Th>
                      <Th align="right">Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutDue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <Td>
                          <p className="font-mono text-xs font-medium text-charcoal">
                            {item.bookingId.slice(0, 8)}…
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </Td>
                        <Td>
                          <span className="font-medium text-charcoal">{formatLKR(item.grossAmount)}</span>
                        </Td>
                        <Td>
                          <span className="text-slate-600">{formatLKR(item.commissionAmount)}</span>
                        </Td>
                        <Td>
                          <span className="font-semibold text-emerald-700">
                            {formatLKR(item.vendorNetAmount)}
                          </span>
                        </Td>
                        <Td align="right">
                          <PrimaryButton
                            onClick={() => handleSettle(item.id)}
                            loading={settlingId === item.id}
                            disabled={settlingId !== null && settlingId !== item.id}
                          >
                            Mark settled
                          </PrimaryButton>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </TableShell>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
