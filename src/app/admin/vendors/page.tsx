"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { getPendingVendors, verifyVendor, rejectVendor, PendingVendor } from '@/shared/lib/api/admin';
import { CheckCircle, XCircle, Loader2, Store, MapPin, Tag, Mail, User } from 'lucide-react';

type ActionState = { id: string; type: 'approve' | 'reject' } | null;

export default function AdminPendingVendorsPage() {
  const { user } = useAuth();
  const [vendors, setVendors]     = useState<PendingVendor[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [actionState, setAction]  = useState<ActionState>(null);

  const loadVendors = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      setVendors(await getPendingVendors(token));
    } catch {
      setError('Failed to load pending vendors.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadVendors(); }, [loadVendors]);

  const handleApprove = async (vendorId: string) => {
    if (!user) return;
    setAction({ id: vendorId, type: 'approve' });
    try {
      const token = await user.getIdToken();
      await verifyVendor(token, vendorId);
      setVendors(prev => prev.filter(v => v.userId !== vendorId));
    } catch {
      setError('Failed to approve vendor.');
    } finally {
      setAction(null);
    }
  };

  const handleReject = async (vendorId: string) => {
    if (!user) return;
    setAction({ id: vendorId, type: 'reject' });
    try {
      const token = await user.getIdToken();
      await rejectVendor(token, vendorId);
      setVendors(prev => prev.filter(v => v.userId !== vendorId));
    } catch {
      setError('Failed to reject vendor.');
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold font-playfair text-charcoal">Pending Vendors</h1>
        <p className="text-slate-500 mt-1">Review and approve or reject vendor applications.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 py-12">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading vendors…</span>
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <CheckCircle size={48} className="mx-auto text-emerald-300 mb-4" />
          <h3 className="text-xl font-bold text-charcoal">All caught up!</h3>
          <p className="text-slate-500 mt-2">There are no pending vendor applications right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 font-medium">{vendors.length} application{vendors.length !== 1 ? 's' : ''} awaiting review</p>

          {vendors.map(vendor => {
            const isActing = actionState?.id === vendor.userId;

            return (
              <div
                key={vendor.userId}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-6"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Store size={28} />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-charcoal text-lg leading-tight">{vendor.businessName}</h3>

                  {vendor.businessDescription && (
                    <p className="text-sm text-slate-500 line-clamp-2">{vendor.businessDescription}</p>
                  )}

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                    {vendor.ownerName && (
                      <span className="flex items-center gap-1">
                        <User size={12} /> {vendor.ownerName}
                      </span>
                    )}
                    {vendor.ownerEmail && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {vendor.ownerEmail}
                      </span>
                    )}
                    {vendor.city && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {vendor.city}
                      </span>
                    )}
                    {vendor.categoryName && (
                      <span className="flex items-center gap-1">
                        <Tag size={12} /> {vendor.categoryName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(vendor.userId)}
                    disabled={isActing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isActing && actionState?.type === 'approve' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(vendor.userId)}
                    disabled={isActing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-500 text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isActing && actionState?.type === 'reject' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <XCircle size={16} />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
