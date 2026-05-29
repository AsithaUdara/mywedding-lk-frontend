"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getVendorCategories,
  getVendorDashboardServices,
  VendorCategory,
  VendorDashboardService,
} from "@/shared/lib/api/vendors";
import { validateServiceImageFile } from "@/shared/lib/vendorMedia";
import {
  DEFAULT_HIGHLIGHT_SUGGESTIONS,
  DEFAULT_INCLUDED_SUGGESTIONS,
} from "@/shared/lib/serviceListingDetails";
import { parseListingDetails } from "@/shared/lib/serviceListingDetails";
import { Button, ErrorBanner, formatLKR, PageLoadingSkeleton } from "@/modules/vendor/dashboard/ui";
import { cn } from "@/shared/lib/cn";
import ListingPreviewPanel from "./ListingPreviewPanel";
import { saveServiceListing } from "./saveServiceListing";
import {
  emptyListingForm,
  LISTING_STEPS,
  ListingStepId,
  ServiceListingFormState,
  PendingGalleryItem,
} from "./types";

const MIN_DESCRIPTION_LENGTH = 40;

function revokeIfBlob(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

interface ServiceListingWizardProps {
  mode: "create" | "edit";
  serviceId?: string;
}

export default function ServiceListingWizard({ mode, serviceId }: ServiceListingWizardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<ListingStepId>("photos");
  const [form, setForm] = useState<ServiceListingFormState>(emptyListingForm);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includedInput, setIncludedInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");

  const stepIndex = LISTING_STEPS.findIndex((s) => s.id === step);
  const currentStepMeta = LISTING_STEPS[stepIndex];

  useEffect(() => {
    getVendorCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !user || !serviceId) return;
    const load = async () => {
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const services = await getVendorDashboardServices(token);
        const service = services.find((s) => s.id === serviceId);
        if (!service) {
          setError("Service not found.");
          return;
        }
        hydrateFromService(service);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load service.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode, user, serviceId]);

  const hydrateFromService = (service: VendorDashboardService) => {
    setForm({
      name: service.serviceName,
      tagline: service.tagline ?? "",
      description: service.serviceDescription ?? "",
      basePrice: String(service.basePrice),
      pricingType: service.pricingType,
      categoryId: service.categoryId,
      categoryName: service.categoryName,
      isActive: service.isActive,
      primaryImageUrl: service.primaryImageUrl ?? null,
      galleryUrls: service.galleryUrls ?? [],
      pendingPrimaryFile: null,
      pendingGalleryItems: [],
      removePrimary: false,
      listingDetails: parseListingDetails(service.listingDetailsJson),
    });
    setPrimaryPreview(service.primaryImageUrl ?? null);
  };

  const hasPrimaryImage =
    Boolean(primaryPreview) ||
    Boolean(form.primaryImageUrl && !form.removePrimary) ||
    Boolean(form.pendingPrimaryFile);

  const allPreviewImages = useMemo(() => {
    const urls: string[] = [];
    if (primaryPreview) urls.push(primaryPreview);
    urls.push(...form.galleryUrls);
    urls.push(...form.pendingGalleryItems.map((i) => i.previewUrl));
    return urls;
  }, [primaryPreview, form.galleryUrls, form.pendingGalleryItems]);

  const validateStep = (stepId: ListingStepId): string | null => {
    switch (stepId) {
      case "photos":
        if (!hasPrimaryImage) return "Add a cover photo to continue.";
        return null;
      case "basics":
        if (!form.name.trim()) return "Service name is required.";
        if (!form.categoryId) return "Select a category.";
        if (!form.tagline.trim()) return "Add a short headline for couples.";
        return null;
      case "pricing":
        if (!form.basePrice || parseFloat(form.basePrice) <= 0) return "Enter a valid price.";
        return null;
      case "details": {
        const descLen = form.description.trim().length;
        if (descLen < MIN_DESCRIPTION_LENGTH) {
          const remaining = MIN_DESCRIPTION_LENGTH - descLen;
          return `Add ${remaining} more character${remaining === 1 ? "" : "s"} to your description (${descLen}/${MIN_DESCRIPTION_LENGTH}).`;
        }
        return null;
      }
      default:
        return null;
    }
  };

  const stepBlocker = validateStep(step);

  const goNext = () => {
    if (stepBlocker) {
      setError(stepBlocker);
      return;
    }
    setError(null);
    if (stepIndex < LISTING_STEPS.length - 1) {
      setStep(LISTING_STEPS[stepIndex + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    setError(null);
    if (stepIndex > 0) {
      setStep(LISTING_STEPS[stepIndex - 1].id);
    } else {
      router.push("/vendor/dashboard/services");
    }
  };

  const handlePrimaryFile = (file: File | null) => {
    if (!file) return;
    const err = validateServiceImageFile(file);
    if (err) {
      setError(err);
      return;
    }
    revokeIfBlob(primaryPreview);
    setForm((prev) => ({ ...prev, pendingPrimaryFile: file, removePrimary: false }));
    setPrimaryPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleGalleryFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const newItems: PendingGalleryItem[] = [];
    for (const file of Array.from(files)) {
      const err = validateServiceImageFile(file);
      if (err) {
        setError(err);
        return;
      }
      newItems.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    setForm((prev) => ({
      ...prev,
      pendingGalleryItems: [...prev.pendingGalleryItems, ...newItems],
    }));
    setError(null);
  };

  const addChipItem = (field: "includedItems" | "highlights", value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setForm((prev) => {
      const exists = prev.listingDetails[field].some(
        (existing) => existing.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) return prev;
      return {
        ...prev,
        listingDetails: {
          ...prev.listingDetails,
          [field]: [...prev.listingDetails[field], trimmed],
        },
      };
    });
    if (field === "includedItems") setIncludedInput("");
    else setHighlightInput("");
  };

  const removeChipItem = (field: "includedItems" | "highlights", index: number) => {
    setForm((prev) => ({
      ...prev,
      listingDetails: {
        ...prev.listingDetails,
        [field]: prev.listingDetails[field].filter((_, i) => i !== index),
      },
    }));
  };

  const handlePublish = async (publish: boolean) => {
    const stepsToValidate: ListingStepId[] = ["photos", "basics", "pricing", "details"];
    for (const stepId of stepsToValidate) {
      const message = validateStep(stepId);
      if (message) {
        setError(message);
        setStep(stepId);
        return;
      }
    }
    if (publish && !hasPrimaryImage) {
      setError("A cover photo is required to publish.");
      setStep("photos");
      return;
    }

    if (!user) return;
    try {
      setSaving(true);
      setError(null);
      const token = await user.getIdToken();
      const payload = { ...form, isActive: publish };
      await saveServiceListing(token, user.uid, payload, serviceId);
      router.push("/vendor/dashboard/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="listing-editor-page p-8">
        <PageLoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="listing-editor-page font-roboto">
      <header className="listing-editor-header sticky top-0 z-40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link
            href="/vendor/dashboard/services"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-muted-foreground transition hover:bg-primary/5 hover:text-primary"
          >
            <ArrowLeft size={18} />
            Exit
          </Link>
          <div className="hidden text-center md:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
              Step {stepIndex + 1} of {LISTING_STEPS.length}
            </p>
            <p className="font-playfair text-lg font-bold text-foreground">{currentStepMeta.label}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={() => void handlePublish(false)}
            >
              Save draft
            </Button>
            {step === "review" && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={saving}
                onClick={() => void handlePublish(true)}
              >
                {saving ? "Publishing…" : "Publish listing"}
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto px-4 pb-3 md:justify-center md:px-8">
          {LISTING_STEPS.map((s, index) => {
            const done = index < stepIndex;
            const active = s.id === step;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => index <= stepIndex && setStep(s.id)}
                className={`flex flex-shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : done
                      ? "listing-editor-step-done"
                      : "listing-editor-step-pending"
                }`}
              >
                {done ? <Check size={12} /> : index + 1}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="min-w-0 space-y-6">
          {error && <ErrorBanner message={error} />}

          <div className="listing-editor-card p-6 md:p-10">
            <div className="mb-8 border-b border-primary/10 pb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent">MyWedding.lk listing</p>
              <h1 className="mt-2 font-playfair text-3xl font-bold text-foreground">{currentStepMeta.label}</h1>
              <p className="mt-2 text-muted-foreground">{currentStepMeta.description}</p>
            </div>

            {step === "photos" && (
              <div className="space-y-8">
                <section>
                  <h2 className="mb-2 text-lg font-bold text-foreground">Cover photo</h2>
                  <p className="mb-4 text-sm text-foreground/70">
                    This is the first image couples see — like the hero photo on Airbnb.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {hasPrimaryImage && primaryPreview && (
                      <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-primary/15 shadow-md">
                        <Image src={primaryPreview} alt="Cover" fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={() => {
                            revokeIfBlob(primaryPreview);
                            setPrimaryPreview(null);
                            setForm((prev) => ({
                              ...prev,
                              pendingPrimaryFile: null,
                              primaryImageUrl: null,
                              removePrimary: true,
                            }));
                          }}
                          className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    {!hasPrimaryImage && (
                      <label className="listing-editor-upload-zone flex aspect-[4/3] w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl text-foreground/70">
                        <Upload size={32} className="mb-2" />
                        <span className="font-semibold">Upload cover photo</span>
                        <span className="mt-1 text-xs">JPEG, PNG or WebP · max 5 MB</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => handlePrimaryFile(e.target.files?.[0] ?? null)}
                        />
                      </label>
                    )}
                  </div>
                </section>

                <section>
                  <h2 className="mb-2 text-lg font-bold text-foreground">Photo gallery</h2>
                  <p className="mb-4 text-sm text-foreground/70">
                    Add 3–10 photos showing your work, setup, and results. More photos build trust.
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {form.galleryUrls.map((url) => (
                      <div key={url} className="relative aspect-square overflow-hidden rounded-xl">
                        <Image src={url} alt="" fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              galleryUrls: prev.galleryUrls.filter((u) => u !== url),
                            }))
                          }
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {form.pendingGalleryItems.map((item) => (
                      <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl">
                        <Image src={item.previewUrl} alt="" fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={() => {
                            revokeIfBlob(item.previewUrl);
                            setForm((prev) => ({
                              ...prev,
                              pendingGalleryItems: prev.pendingGalleryItems.filter(
                                (i) => i.id !== item.id
                              ),
                            }));
                          }}
                          className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="listing-editor-upload-zone flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl text-foreground/60 hover:text-primary">
                      <Plus size={24} />
                      <span className="mt-1 text-xs font-semibold">Add photos</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => handleGalleryFiles(e.target.files)}
                      />
                    </label>
                  </div>
                </section>
              </div>
            )}

            {step === "basics" && (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-foreground">Service name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Full-day wedding photography"
                    className="listing-editor-input w-full rounded-xl px-4 py-3 text-lg font-medium"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-foreground">
                    Headline for couples
                  </label>
                  <input
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="e.g. Candid storytelling with cinematic edits"
                    className="listing-editor-input w-full rounded-xl px-4 py-3"
                  />
                  <p className="mt-1 text-xs text-foreground/55">One line that appears under your title on the listing.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-foreground">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setForm({
                        ...form,
                        categoryId: e.target.value,
                        categoryName: cat?.name ?? "",
                      });
                    }}
                    className="listing-editor-input w-full rounded-xl px-4 py-3 font-semibold"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === "pricing" && (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-foreground">Starting price (LKR)</label>
                    <input
                      type="number"
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                      className="listing-editor-input w-full rounded-xl px-4 py-3 text-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-foreground">Price unit</label>
                    <select
                      value={form.pricingType}
                      onChange={(e) => setForm({ ...form, pricingType: e.target.value })}
                      className="listing-editor-input w-full rounded-xl px-4 py-3 font-semibold"
                    >
                      <option value="Fixed">Per event (fixed)</option>
                      <option value="PerPerson">Per guest</option>
                      <option value="Hourly">Per hour</option>
                      <option value="Package">Package deal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">What&apos;s included</h3>
                  <p className="mb-4 text-sm text-foreground/70">
                    List everything couples get — transparency reduces back-and-forth.
                  </p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {DEFAULT_INCLUDED_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addChipItem("includedItems", suggestion)}
                        className="listing-editor-chip-inactive rounded-full px-3 py-1 text-xs font-medium"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={includedInput}
                      onChange={(e) => setIncludedInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChipItem("includedItems", includedInput))}
                      placeholder="Add custom item..."
                      className="listing-editor-input flex-1 rounded-xl px-4 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => addChipItem("includedItems", includedInput)}
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {form.listingDetails.includedItems.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="listing-editor-surface-muted flex items-center justify-between rounded-xl px-4 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <Check size={14} className="text-success" />
                          {item}
                        </span>
                        <button type="button" onClick={() => removeChipItem("includedItems", index)}>
                          <X size={14} className="text-foreground/40" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {step === "details" && (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                      <Clock size={16} /> Duration / coverage
                    </label>
                    <input
                      value={form.listingDetails.durationLabel ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          listingDetails: { ...form.listingDetails, durationLabel: e.target.value },
                        })
                      }
                      placeholder="e.g. 8 hours · 2 photographers"
                      className="listing-editor-input w-full rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                      <Users size={16} /> Capacity
                    </label>
                    <input
                      value={form.listingDetails.capacityNote ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          listingDetails: { ...form.listingDetails, capacityNote: e.target.value },
                        })
                      }
                      placeholder="e.g. Up to 300 guests"
                      className="listing-editor-input w-full rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-foreground">About this service</label>
                  <textarea
                    rows={8}
                    value={form.description}
                    onChange={(e) => {
                      setForm({ ...form, description: e.target.value });
                      setError(null);
                    }}
                    placeholder="Describe your style, process, deliverables, and what makes your offering unique for Sri Lankan weddings..."
                    className={`listing-editor-input w-full rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      form.description.trim().length < MIN_DESCRIPTION_LENGTH
                        ? "ring-1 ring-warning/50"
                        : ""
                    }`}
                    aria-describedby="listing-description-hint"
                  />
                  <p
                    id="listing-description-hint"
                    className={`mt-1 text-xs ${
                      form.description.trim().length < MIN_DESCRIPTION_LENGTH
                        ? "font-medium text-warning"
                        : "text-foreground/55"
                    }`}
                  >
                    {form.description.trim().length} / {MIN_DESCRIPTION_LENGTH} characters minimum
                    {form.description.trim().length < MIN_DESCRIPTION_LENGTH && (
                      <> — {MIN_DESCRIPTION_LENGTH - form.description.trim().length} more needed to continue</>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-foreground">
                    <Sparkles size={18} className="text-primary" />
                    Highlights
                  </h3>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {DEFAULT_HIGHLIGHT_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addChipItem("highlights", suggestion)}
                        className="listing-editor-chip-inactive rounded-full px-3 py-1 text-xs font-medium"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addChipItem("highlights", highlightInput))}
                      className="listing-editor-input flex-1 rounded-xl px-4 py-2 text-sm"
                      placeholder="Add a highlight..."
                    />
                    <button
                      type="button"
                      onClick={() => addChipItem("highlights", highlightInput)}
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.listingDetails.highlights.map((item, index) => (
                      <span
                        key={`${item}-${index}`}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                      >
                        {item}
                        <button type="button" onClick={() => removeChipItem("highlights", index)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-8">
                <div className="rounded-2xl border border-border bg-gradient-to-br from-accent/10 to-background p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <ImageIcon size={20} className="text-primary" />
                    Listing summary
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                    <li className="flex justify-between">
                      <span>Photos</span>
                      <span className="font-semibold">{allPreviewImages.length} uploaded</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Price</span>
                      <span className="font-semibold">
                        {form.basePrice ? formatLKR(parseFloat(form.basePrice)) : "—"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Included items</span>
                      <span className="font-semibold">{form.listingDetails.includedItems.length}</span>
                    </li>
                  </ul>
                </div>

                <div className="listing-editor-surface-muted flex items-center justify-between rounded-2xl p-6">
                  <div>
                    <p className="font-bold text-foreground">Publish to couples</p>
                    <p className="text-sm text-foreground/70">
                      When on, verified vendors show this listing on search and your profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={cn(
                      "relative h-8 w-14 rounded-full transition",
                      form.isActive ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${form.isActive ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>

                <p className="text-sm text-foreground/60">
                  Check the preview panel on the right (desktop) to see how couples will experience your listing.
                </p>
              </div>
            )}

            <div className="mt-10 border-t border-primary/10 pt-8">
              {stepBlocker && step !== "review" && (
                <p className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                  {stepBlocker}
                </p>
              )}
              <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-primary"
              >
                <ArrowLeft size={18} />
                {stepIndex === 0 ? "Cancel" : "Back"}
              </button>
              {step !== "review" ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={Boolean(stepBlocker)}
                  title={stepBlocker ?? undefined}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handlePublish(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving ? "Publishing..." : "Publish listing"}
                  <ChevronRight size={18} />
                </button>
              )}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <ListingPreviewPanel form={form} primaryPreview={primaryPreview} />
        </div>
      </div>

      <div className="border-t border-border bg-muted/30 px-4 py-8 lg:hidden">
        <div className="mx-auto max-w-md">
          <ListingPreviewPanel form={form} primaryPreview={primaryPreview} />
        </div>
      </div>
    </div>
  );
}
