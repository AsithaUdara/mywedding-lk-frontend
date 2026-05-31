"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import { auth } from "@/shared/lib/firebase";
import { signOut } from "firebase/auth";
import { LayoutDashboard, ScrollText, ShieldCheck, Store, Users, Wallet } from "lucide-react";
import { B2BWorkspaceShell } from "@/shared/components/layout/B2BWorkspaceShell";
import { PageLoadingSkeleton } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";
import { getPendingVendors } from "@/shared/lib/api/admin";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "KYB queue", href: "/admin/vendors", icon: <Users size={18} />, exact: true },
  { label: "All vendors", href: "/admin/vendors/directory", icon: <Store size={18} /> },
  { label: "Payouts", href: "/admin/dashboard/commissions", icon: <Wallet size={18} /> },
  { label: "Audit log", href: "/admin/dashboard/audit-log", icon: <ScrollText size={18} /> },
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
      <div className="regal-frost-shell min-h-screen bg-background p-8 font-glass-body">
        <PageLoadingSkeleton />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="regal-frost-shell flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 font-glass-body">
        <p className="font-luxury-section text-lg font-medium tracking-tight text-foreground">Access denied</p>
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
        <span className={cn(rf.badge, "px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]")}>
          Internal ops
        </span>
      }
      sidebarFooter={
        <div className={cn(rf.panel, "border-primary/20 bg-primary/5 p-4 shadow-none")}>
          <p className={cn(rf.label, "text-primary")}>Trust & safety</p>
          <p className={cn("mt-1.5 text-xs leading-relaxed", rf.subtitle)}>
            Review vendor KYB before they appear on MyWedding.lk.
          </p>
          <GlassButton href="/admin/vendors" variant="primary" className="mt-3 w-full justify-center">
            Open KYB queue
            {kybPending !== undefined && kybPending > 0 ? ` (${kybPending})` : ""}
          </GlassButton>
          <GlassButton href="/admin/vendors/directory" variant="ghost" className="mt-2 w-full justify-center">
            View all vendors
          </GlassButton>
        </div>
      }
    >
      {children}
    </B2BWorkspaceShell>
  );
}
