"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import {
  createVendorShortlist,
  type CreateShortlistItemPayload,
} from "@/shared/lib/api/vendorShortlist";
import { getVendorById, getVendors, type Vendor, type VendorDetail } from "@/shared/lib/api/vendors";
import { useAuth } from "@/shared/context/AuthContext";
import { Button, ErrorBanner, inputClass } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

type Props = {
  eventId: string;
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
};

export function AddShortlistProposalModal({ eventId, open, onClose, onAdded }: Props) {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendorDetail, setVendorDetail] = useState<VendorDetail | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [plannerNotes, setPlannerNotes] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [sendToClient, setSendToClient] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVendors = useCallback(async () => {
    setLoadingVendors(true);
    try {
      const data = await getVendors({});
      setVendors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vendors.");
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadVendors();
      setError(null);
    } else {
      setSelectedVendorId(null);
      setVendorDetail(null);
      setServiceId("");
      setSearch("");
    }
  }, [open, loadVendors]);

  useEffect(() => {
    if (!selectedVendorId) {
      setVendorDetail(null);
      return;
    }
    const load = async () => {
      setLoadingDetail(true);
      try {
        const detail = await getVendorById(selectedVendorId);
        setVendorDetail(detail);
        const first = detail?.services[0];
        if (first) {
          setServiceId(first.id);
          setProposedAmount(String(first.basePrice));
          setCategoryLabel(detail?.services[0]?.serviceName ?? "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load vendor.");
      } finally {
        setLoadingDetail(false);
      }
    };
    void load();
  }, [selectedVendorId]);

  const filtered = vendors.filter((v) =>
    v.businessName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !proposedAmount || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const item: CreateShortlistItemPayload = {
        vendorServiceId: serviceId,
        categoryLabel: categoryLabel || undefined,
        plannerNotes: plannerNotes || undefined,
        proposedAmount: Number(proposedAmount),
        serviceDate: serviceDate || undefined,
      };
      await createVendorShortlist(token, eventId, {
        sendToClient,
        items: [item],
      });
      onAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-playfair text-xl font-bold text-foreground">Add vendor proposal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a service from the directory and send it to your client for approval.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        {error && <ErrorBanner message={error} className="mb-4" />}

        {!selectedVendorId ? (
          <div className="space-y-3">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
                aria-hidden
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendors…"
                className={cn(inputClass, "pl-10")}
              />
            </div>
            {loadingVendors ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" aria-hidden />
              </div>
            ) : (
              <ul className="max-h-64 space-y-1 overflow-y-auto">
                {filtered.map((v) => (
                  <li key={v.userId}>
                    <button
                      type="button"
                      onClick={() => setSelectedVendorId(v.userId)}
                      className="w-full rounded-xl border border-border px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/50"
                    >
                      <p className="font-semibold text-foreground">{v.businessName}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.categoryName} · {v.city}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <button
              type="button"
              className="text-sm font-semibold text-primary hover:underline"
              onClick={() => setSelectedVendorId(null)}
            >
              ← Change vendor
            </button>
            {loadingDetail || !vendorDetail ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-primary" aria-hidden />
              </div>
            ) : (
              <>
                <p className="font-semibold text-foreground">{vendorDetail.businessName}</p>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">Service</label>
                  <select
                    value={serviceId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setServiceId(id);
                      const svc = vendorDetail.services.find((s) => s.id === id);
                      if (svc) setProposedAmount(String(svc.basePrice));
                    }}
                    className={inputClass}
                    required
                  >
                    {vendorDetail.services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.serviceName} — LKR {s.basePrice.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Category label
                  </label>
                  <input
                    value={categoryLabel}
                    onChange={(e) => setCategoryLabel(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Photography"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Proposed amount (LKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={proposedAmount}
                    onChange={(e) => setProposedAmount(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Service date
                  </label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Notes for client
                  </label>
                  <textarea
                    value={plannerNotes}
                    onChange={(e) => setPlannerNotes(e.target.value)}
                    rows={3}
                    className={cn(inputClass, "resize-none")}
                    placeholder="Why you recommend this vendor…"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={sendToClient}
                    onChange={(e) => setSendToClient(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Send to client immediately
                </label>
                <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                  {submitting ? "Saving…" : "Add proposal"}
                </Button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
