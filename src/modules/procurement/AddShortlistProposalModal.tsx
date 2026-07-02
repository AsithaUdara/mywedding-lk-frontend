"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Loader2, MapPin, Search, Star, X } from "lucide-react";
import {
  createVendorShortlist,
  type CreateShortlistItemPayload,
} from "@/shared/lib/api/vendorShortlist";
import { getVendorById, getVendors, type Vendor, type VendorDetail } from "@/shared/lib/api/vendors";
import { useAuth } from "@/shared/context/AuthContext";
import { Button, ErrorBanner, formatLKR, inputClass } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import {
  VENDOR_SEARCH_CATEGORIES,
  vendorMatchesCategory,
  type VendorSearchCategory,
} from "@/modules/vendors/search/vendorSearchConstants";
import { mapVendorToCardProps, resolveVendorCardImages } from "@/shared/lib/vendorMedia";

type Props = {
  eventId: string;
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
};

type BrowseStep = "browse" | "propose";

export function AddShortlistProposalModal({ eventId, open, onClose, onAdded }: Props) {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<VendorSearchCategory | "All">("All");
  const [step, setStep] = useState<BrowseStep>("browse");
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

  const resetState = useCallback(() => {
    setStep("browse");
    setSelectedVendorId(null);
    setVendorDetail(null);
    setServiceId("");
    setSearch("");
    setCategoryFilter("All");
    setCategoryLabel("");
    setPlannerNotes("");
    setProposedAmount("");
    setServiceDate("");
    setSendToClient(false);
  }, []);

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
      resetState();
    }
  }, [open, loadVendors, resetState]);

  useEffect(() => {
    if (!selectedVendorId || step !== "propose") {
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
  }, [selectedVendorId, step]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vendors.filter((vendor) => {
      const categoryMatch =
        categoryFilter === "All" || vendorMatchesCategory(vendor.categoryName, categoryFilter);
      const queryMatch =
        !query ||
        vendor.businessName.toLowerCase().includes(query) ||
        vendor.categoryName.toLowerCase().includes(query) ||
        vendor.city.toLowerCase().includes(query) ||
        (vendor.businessDescription?.toLowerCase().includes(query) ?? false);
      return categoryMatch && queryMatch;
    });
  }, [vendors, search, categoryFilter]);

  const selectedService = useMemo(
    () => vendorDetail?.services.find((service) => service.id === serviceId),
    [vendorDetail, serviceId]
  );

  const handleSelectVendor = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setStep("propose");
    setError(null);
  };

  const handleBackToBrowse = () => {
    setStep("browse");
    setSelectedVendorId(null);
    setVendorDetail(null);
    setServiceId("");
  };

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
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-playfair text-xl font-bold text-foreground">Add vendor proposal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse verified vendors, review their profile and packages, then add the best option for
              your client.
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

        {step === "browse" ? (
          <div className="space-y-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
                aria-hidden
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category, or city…"
                className={cn(inputClass, "pl-10")}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategoryFilter("All")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  categoryFilter === "All"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-muted/40 text-muted-foreground hover:border-primary/30"
                )}
              >
                All
              </button>
              {VENDOR_SEARCH_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                    categoryFilter === category
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-muted/40 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {filtered.length} vendor{filtered.length === 1 ? "" : "s"} found
              </span>
              <Link
                href="/vendors/search"
                target="_blank"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                Open full directory
                <ExternalLink size={12} aria-hidden />
              </Link>
            </div>

            {loadingVendors ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" aria-hidden />
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No vendors match your filters. Try another category or search term.
              </div>
            ) : (
              <ul className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto">
                {filtered.map((vendor) => {
                  const card = mapVendorToCardProps(vendor);
                  const image = resolveVendorCardImages(vendor.primaryImageUrl, vendor.imageUrls)[0];
                  return (
                    <li key={vendor.userId}>
                      <div className="flex gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-muted/30">
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={image}
                            alt={card.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-foreground">{card.name}</p>
                            {card.isVerified && (
                              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {card.category} · {card.location}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {card.totalReviews > 0 && (
                              <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                                <Star size={12} className="fill-accent text-accent" aria-hidden />
                                {card.rating.toFixed(1)} ({card.totalReviews})
                              </span>
                            )}
                            <span>
                              {card.price > 0
                                ? `${formatLKR(card.price)} starting`
                                : "Packages coming soon"}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                          <Link
                            href={`/vendor/${vendor.userId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                          >
                            View profile
                            <ExternalLink size={12} aria-hidden />
                          </Link>
                          <Button
                            type="button"
                            variant="primary"
                            className="h-8 px-3 text-xs"
                            onClick={() => handleSelectVendor(vendor.userId)}
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <button
              type="button"
              className="text-sm font-semibold text-primary hover:underline"
              onClick={handleBackToBrowse}
            >
              ← Back to vendor list
            </button>

            {loadingDetail || !vendorDetail ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin text-primary" aria-hidden />
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{vendorDetail.businessName}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin size={14} aria-hidden />
                        {vendorDetail.city}
                        {vendorDetail.province ? `, ${vendorDetail.province}` : ""}
                      </p>
                      {vendorDetail.businessDescription && (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                          {vendorDetail.businessDescription}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/vendor/${vendorDetail.userId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/30 hover:text-primary"
                      >
                        Full profile
                        <ExternalLink size={12} aria-hidden />
                      </Link>
                      {selectedService && (
                        <Link
                          href={`/vendor/${vendorDetail.userId}/services/${selectedService.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/30 hover:text-primary"
                        >
                          Service details
                          <ExternalLink size={12} aria-hidden />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Package to propose
                  </label>
                  <select
                    value={serviceId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setServiceId(id);
                      const svc = vendorDetail.services.find((s) => s.id === id);
                      if (svc) {
                        setProposedAmount(String(svc.basePrice));
                        setCategoryLabel(svc.serviceName);
                      }
                    }}
                    className={inputClass}
                    required
                  >
                    {vendorDetail.services.length === 0 ? (
                      <option value="">No active packages</option>
                    ) : (
                      vendorDetail.services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.serviceName} — {formatLKR(s.basePrice)}
                        </option>
                      ))
                    )}
                  </select>
                  {vendorDetail.services.length === 0 && (
                    <p className="mt-2 text-xs text-destructive">
                      This vendor has no published packages yet. View profile and pick another vendor.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Category label (shown to client)
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
                    placeholder="Why you recommend this vendor — portfolio fit, budget, style match…"
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
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={submitting || vendorDetail.services.length === 0}
                >
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
