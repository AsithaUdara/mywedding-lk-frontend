const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface PendingVendor {
  userId: string;
  businessName: string;
  businessDescription: string | null;
  city: string | null;
  categoryName: string | null;
  ownerEmail: string | null;
  ownerName: string | null;
  verificationStatus: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalVendors: number;
  totalEvents: number;
  totalBookings: number;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function getPendingVendors(token: string): Promise<PendingVendor[]> {
  const res = await fetch(`${BASE}/api/admin/vendors/pending`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch pending vendors');
  return res.json();
}

export async function verifyVendor(token: string, vendorId: string): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/vendors/${vendorId}/verify`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to verify vendor');
}

export async function rejectVendor(token: string, vendorId: string): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/vendors/${vendorId}/reject`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to reject vendor');
}

export async function getPlatformStats(token: string): Promise<PlatformStats> {
  const res = await fetch(`${BASE}/api/admin/stats`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch platform stats');
  return res.json();
}
