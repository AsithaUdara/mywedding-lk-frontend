"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import { auth } from "@/shared/lib/firebase";
import { signOut } from "firebase/auth";
import { LayoutDashboard, ShieldCheck, Users, Wallet } from "lucide-react";
import { B2BWorkspaceShell } from "@/shared/components/layout/B2BWorkspaceShell";
import { Button, Card, PageLoadingSkeleton } from "@/shared/components/ui";
import { getPendingVendors } from "@/shared/lib/api/admin";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "KYB queue", href: "/admin/vendors", icon: <Users size={18} /> },
  { label: "Payouts", href: "/admin/dashboard/commissions", icon: <Wallet size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [kybPending, setKybPending] = useState<number | undefined>(undefined);
  const isLoginPage = pathname === "/admin/login";

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const loadKybCount = useCallback(async () => {
    if (!user || isLoginPage) return;
    try {
      const token = await user.getIdToken();
      const pending = await getPendingVendors(token);
      setKybPending(pending.length);
    } catch {
      setKybPending(undefined);
    }
  }, [user, isLoginPage]);

  useEffect(() => {
    if (isLoginPage) return;

    const checkAdminRole = async () => {
      if (!user) {
        router.replace("/admin/login");
        return;
      }
      const tokenResult = await user.getIdTokenResult(true);
      if (tokenResult.claims.role === "admin") {
        setIsAdmin(true);
        void loadKybCount();
      } else {
        setIsAdmin(false);
        router.replace("/");
      }
    };

    if (!authLoading) {
      void checkAdminRole();
    }
  }, [user, authLoading, router, isLoginPage, loadKybCount]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background p-8 font-roboto">
        <PageLoadingSkeleton />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 font-roboto">
        <p className="font-playfair text-lg font-bold tracking-tight text-foreground">Access denied</p>
        <p className="text-sm text-muted-foreground">Admin role required.</p>
      </div>
    );
  }

  const navWithBadges = NAV_ITEMS.map((item) =>
    item.href === "/admin/vendors" && kybPending !== undefined && kybPending > 0
      ? { ...item, badge: kybPending }
      : item
  );

  return (
    <B2BWorkspaceShell
      brandName="Admin"
      brandHref="/admin/dashboard"
      brandIcon={<ShieldCheck size={18} strokeWidth={2} />}
      navItems={navWithBadges}
      exactMatchHref="/admin/dashboard"
      maxWidthClass="max-w-[1500px]"
      onLogout={handleSignOut}
      topBarActions={
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Internal ops
        </span>
      }
      sidebarFooter={
        <Card className="border-primary/15 bg-primary/5 p-4 shadow-none">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Trust & safety</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Review vendor KYB before they appear on MyWedding.lk.
          </p>
          <Button href="/admin/vendors" size="sm" className="mt-3 w-full">
            Open KYB queue
            {kybPending !== undefined && kybPending > 0 ? ` (${kybPending})` : ""}
          </Button>
        </Card>
      }
    >
      {children}
    </B2BWorkspaceShell>
  );
}
