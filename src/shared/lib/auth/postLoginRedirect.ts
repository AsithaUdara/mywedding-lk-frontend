import { User } from 'firebase/auth';

export type AppRole = 'admin' | 'vendor' | 'planner' | 'user';

/** Reads Firebase custom claim `role` (defaults to couple/user). */
export function getRoleFromClaims(claims: Record<string, unknown>): AppRole {
  const role = claims.role;
  if (role === 'admin' || role === 'vendor' || role === 'planner') return role;
  return 'user';
}

/** Default home route after sign-in based on role. */
export function getDashboardPathForRole(role: AppRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'vendor':
      return '/vendor/dashboard';
    case 'planner':
      return '/planner/dashboard';
    default:
      return '/dashboard';
  }
}

export async function syncUserWithBackend(): Promise<void> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    throw new Error('API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in .env.local');
  }

  const { auth } = await import('@/shared/lib/firebase');
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not found after authentication.');
  }

  const token = await user.getIdToken();
  const response = await fetch(`${apiBase}/api/auth/sync-user`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to sync user with backend.');
  }
}

/** Refreshes ID token and returns the post-login dashboard path for this user. */
export async function resolvePostLoginPath(user: User): Promise<string> {
  const tokenResult = await user.getIdTokenResult(true);
  const role = getRoleFromClaims(tokenResult.claims as Record<string, unknown>);
  return getDashboardPathForRole(role);
}

/** Returns a safe in-app path from ?returnUrl=, or null if invalid. */
export function getSafeReturnUrl(returnUrl: string | null | undefined): string | null {
  if (!returnUrl || !returnUrl.startsWith('/') || returnUrl.startsWith('//')) {
    return null;
  }
  return returnUrl;
}

/** After sign-in: honor returnUrl when present, otherwise role dashboard. */
export async function resolvePostLoginPathWithReturn(
  user: User,
  returnUrl: string | null | undefined
): Promise<string> {
  const safe = getSafeReturnUrl(returnUrl);
  if (safe) return safe;
  return resolvePostLoginPath(user);
}
