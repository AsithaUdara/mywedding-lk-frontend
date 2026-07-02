"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import {
  AppRole,
  getRoleFromClaims,
  getSafeReturnUrl,
} from "@/shared/lib/auth/postLoginRedirect";

type GuardStatus = "loading" | "authorized" | "denied";

export interface UseRequireRoleOptions {
  /** Roles that may access this route. */
  allowedRoles: AppRole[];
  /** Sign-in page when the user is not authenticated. */
  loginPath: string;
  /** Where to send authenticated users with the wrong role. */
  deniedPath?: string;
  /** Set false on public pages (e.g. login) that use the same layout tree. */
  enabled?: boolean;
}

/**
 * Client-side route guard aligned with Firebase custom claim `role`.
 * Mirrors the admin layout pattern; API authorization remains the source of truth.
 */
export function useRequireRole({
  allowedRoles,
  loginPath,
  deniedPath = "/",
  enabled = true,
}: UseRequireRoleOptions) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<GuardStatus>("loading");
  const verifiedUidRef = useRef<string | null>(null);

  const allowedRolesKey = allowedRoles.join("|");

  useEffect(() => {
    if (!enabled) {
      setStatus("authorized");
      return;
    }

    if (authLoading) {
      return;
    }

    let cancelled = false;

    const verify = async () => {
      if (!user) {
        verifiedUidRef.current = null;
        const safeReturn = getSafeReturnUrl(pathname);
        const query = safeReturn ? `?returnUrl=${encodeURIComponent(safeReturn)}` : "";
        router.replace(`${loginPath}${query}`);
        return;
      }

      if (verifiedUidRef.current === user.uid) {
        setStatus("authorized");
        return;
      }

      setStatus("loading");

      try {
        const tokenResult = await user.getIdTokenResult(true);
        const role = getRoleFromClaims(tokenResult.claims as Record<string, unknown>);

        if (cancelled) return;

        if (allowedRoles.includes(role)) {
          verifiedUidRef.current = user.uid;
          setStatus("authorized");
        } else {
          verifiedUidRef.current = null;
          setStatus("denied");
          router.replace(deniedPath);
        }
      } catch {
        if (!cancelled) {
          verifiedUidRef.current = null;
          setStatus("denied");
          router.replace(loginPath);
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
    // pathname is read inside verify for returnUrl only — must not re-trigger full verify when already authorized.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- role list encoded in allowedRolesKey
  }, [user, authLoading, enabled, allowedRolesKey, loginPath, deniedPath, router]);

  return {
    loading: !enabled ? false : authLoading || status === "loading",
    authorized: status === "authorized",
    denied: status === "denied",
  };
}
