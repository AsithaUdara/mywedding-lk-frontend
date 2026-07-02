"use client";

import type { ReactNode } from "react";
import { PageLoadingSkeleton } from "@/shared/components/ui";
import {
  useRequireRole,
  type UseRequireRoleOptions,
} from "@/shared/hooks/useRequireRole";

type RoleGuardProps = UseRequireRoleOptions & {
  children: ReactNode;
  loadingClassName?: string;
};

/** Blocks children until Firebase role matches; shows skeleton while verifying. */
export function RoleGuard({
  children,
  loadingClassName = "min-h-screen p-8",
  ...options
}: RoleGuardProps) {
  const { loading, authorized } = useRequireRole(options);

  if (loading) {
    return (
      <div className={loadingClassName}>
        <PageLoadingSkeleton />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
