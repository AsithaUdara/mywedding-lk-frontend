"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Save, AlertCircle, Upload, Trash2 } from "lucide-react";
import type { VendorService } from "@/modules/vendor/dashboard/vendorServiceHelpers";
import { getVendorCategories, VendorCategory } from "@/shared/lib/api/vendors";
import { validateServiceImageFile } from "@/shared/lib/vendorMedia";
import { ToggleSwitch } from "@/modules/vendor/dashboard/components";
import { Button, inputClass } from "@/modules/vendor/dashboard/ui";
import { cn } from "@/shared/lib/cn";
import { vd } from "@/modules/vendor/dashboard/vendor-dashboard-theme";

export type { PendingGalleryItem } from "@/modules/vendor/services/listing/types";
import type { PendingGalleryItem } from "@/modules/vendor/services/listing/types";

export interface ServiceFormData {
  name: string;
  description: string;
  basePrice: string;
  pricingType: string;
  categoryId: string;
  isActive: boolean;
  primaryImageUrl?: string | null;
  galleryUrls: string[];
  pendingPrimaryFile?: File | null;
  pendingGalleryItems: PendingGalleryItem[];
  removePrimary?: boolean;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceFormData) => void | Promise<void>;
  service?: VendorService | null;
  saving?: boolean;
}

function revokeIfBlob(url: string | null) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

const fieldLabel = "text-[11px] font-bold uppercase tracking-widest text-muted-foreground";

export default function ServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
  saving = false,
}: ServiceModalProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    basePrice: "",
    pricingType: "Fixed",
    categoryId: "",
    isActive: true,
    primaryImageUrl: null,
    galleryUrls: [],
    pendingPrimaryFile: null,
    pendingGalleryItems: [],
    removePrimary: false,
  });
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getVendorCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.serviceName || "",
        description: service.serviceDescription || "",
        basePrice: service.basePrice?.toString() || "",
        pricingType: service.pricingType || "Fixed",
        categoryId: service.categoryId || "",
        isActive: service.isActive !== false,
        primaryImageUrl: service.primaryImageUrl ?? null,
        galleryUrls: service.galleryUrls ?? [],
        pendingPrimaryFile: null,
        pendingGalleryItems: [],
        removePrimary: false,
      });
      setPrimaryPreview(service.primaryImageUrl ?? null);
    } else {
      setFormData({
        name: "",
        description: "",
        basePrice: "",
        pricingType: "Fixed",
        categoryId: "",
        isActive: true,
        primaryImageUrl: null,
        galleryUrls: [],
        pendingPrimaryFile: null,
        pendingGalleryItems: [],
        removePrimary: false,
      });
      setPrimaryPreview(null);
    }
    setErrors({});
  }, [service, isOpen]);

  const hasPrimaryImage =
    Boolean(primaryPreview) ||
    Boolean(formData.primaryImageUrl && !formData.removePrimary) ||
    Boolean(formData.pendingPrimaryFile);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Service name is required";
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = "Enter a valid price";
    }
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (formData.isActive && !hasPrimaryImage) {
      newErrors.primaryImage =
        "A primary image is required for active listings visible to couples.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePrimaryFile = (file: File | null) => {
    if (!file) return;
    const validationError = validateServiceImageFile(file);
    if (validationError) {
      setErrors((prev) => ({ ...prev, primaryImage: validationError }));
      return;
    }
    revokeIfBlob(primaryPreview);
    setFormData((prev) => ({
      ...prev,
      pendingPrimaryFile: file,
      removePrimary: false,
    }));
    setPrimaryPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, primaryImage: "" }));
  };

  const handleGalleryFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const valid: File[] = [];
    for (const file of Array.from(files)) {
      const validationError = validateServiceImageFile(file);
      if (validationError) {
        setErrors((prev) => ({ ...prev, gallery: validationError }));
        return;
      }
      valid.push(file);
    }
    const newItems: PendingGalleryItem[] = valid.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setFormData((prev) => ({
      ...prev,
      pendingGalleryItems: [...prev.pendingGalleryItems, ...newItems],
    }));
    setErrors((prev) => ({ ...prev, gallery: "" }));
  };

  const handleLocalSave = () => {
    if (validate()) {
      void onSave(formData);
    }
  };

  if (!isOpen) return null;

  const inputError = (key: string) =>
    errors[key] ? "border-destructive ring-2 ring-destructive/15" : "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-bold text-foreground">
            {service ? "Edit service" : "Add new service"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-6 sm:p-8">
          <div className="space-y-2">
            <label className={fieldLabel}>Primary image</label>
            <div className="flex flex-wrap items-start gap-4">
              {hasPrimaryImage && primaryPreview && (
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-border">
                  <Image src={primaryPreview} alt="Primary" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => {
                      revokeIfBlob(primaryPreview);
                      setPrimaryPreview(null);
                      setFormData((prev) => ({
                        ...prev,
                        pendingPrimaryFile: null,
                        primaryImageUrl: null,
                        removePrimary: true,
                      }));
                    }}
                    className="absolute right-1 top-1 rounded-full bg-foreground/60 p-1 text-primary-foreground"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
              {!hasPrimaryImage && (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-4 text-muted-foreground transition hover:border-primary hover:text-primary">
                  <Upload size={20} className="mb-1" />
                  <span className="text-xs font-semibold">Upload cover</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handlePrimaryFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              )}
            </div>
            {errors.primaryImage && (
              <p className="text-xs font-medium text-destructive">{errors.primaryImage}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className={fieldLabel}>Gallery</label>
            {(formData.galleryUrls.length > 0 || formData.pendingGalleryItems.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {formData.galleryUrls.map((url) => (
                  <div key={url} className="relative h-16 w-16 overflow-hidden rounded-xl border border-border">
                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          galleryUrls: prev.galleryUrls.filter((item) => item !== url),
                        }))
                      }
                      className="absolute right-0.5 top-0.5 rounded-full bg-foreground/50 p-0.5 text-primary-foreground"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                {formData.pendingGalleryItems.map((item) => (
                  <div key={item.id} className="relative h-16 w-16 overflow-hidden rounded-xl border border-border">
                    <Image src={item.previewUrl} alt="" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => {
                        revokeIfBlob(item.previewUrl);
                        setFormData((prev) => ({
                          ...prev,
                          pendingGalleryItems: prev.pendingGalleryItems.filter((i) => i.id !== item.id),
                        }));
                      }}
                      className="absolute right-0.5 top-0.5 rounded-full bg-foreground/50 p-0.5 text-primary-foreground"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary">
              <Upload size={16} aria-hidden />
              Add gallery images
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleGalleryFiles(e.target.files)}
              />
            </label>
            {errors.gallery && <p className="text-xs font-medium text-destructive">{errors.gallery}</p>}
          </div>

          <div className="space-y-2">
            <label className={fieldLabel}>Service name</label>
            <input
              type="text"
              className={cn(inputClass, inputError("name"))}
              placeholder="e.g. Luxury banquet hall"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
            />
            {errors.name && <p className="text-xs font-medium text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={fieldLabel}>Base price (LKR)</label>
              <input
                type="number"
                className={cn(inputClass, inputError("basePrice"))}
                placeholder="0"
                value={formData.basePrice}
                onChange={(e) => {
                  setFormData({ ...formData, basePrice: e.target.value });
                  if (errors.basePrice) setErrors({ ...errors, basePrice: "" });
                }}
              />
              {errors.basePrice && (
                <p className="text-xs font-medium text-destructive">{errors.basePrice}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className={fieldLabel}>Pricing type</label>
              <select
                className={inputClass}
                value={formData.pricingType}
                onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
              >
                <option value="Fixed">Per event (fixed)</option>
                <option value="PerPerson">Per guest</option>
                <option value="Hourly">Per hour</option>
                <option value="Package">Package deal</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className={fieldLabel}>Category</label>
            <select
              className={cn(inputClass, inputError("categoryId"))}
              value={formData.categoryId}
              onChange={(e) => {
                setFormData({ ...formData, categoryId: e.target.value });
                if (errors.categoryId) setErrors({ ...errors, categoryId: "" });
              }}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs font-medium text-destructive">{errors.categoryId}</p>
            )}
          </div>

          <div className={cn("flex items-center justify-between", vd.metaBox)}>
            <div>
              <p className="text-sm font-bold text-foreground">Show listing</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Visible to couples on the marketplace</p>
            </div>
            <ToggleSwitch
              checked={formData.isActive}
              onChange={() => setFormData({ ...formData, isActive: !formData.isActive })}
              aria-label="Toggle listing visibility"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Description</label>
            <textarea
              rows={3}
              className={inputClass}
              placeholder="Describe what's included in this service…"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className={cn("flex gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-primary")}>
            <AlertCircle size={20} className="flex-shrink-0" aria-hidden />
            <p className="text-xs font-medium leading-relaxed">
              Active services need a cover image to appear in search. Images are stored securely on
              Cloudinary.
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 justify-end gap-3 border-t border-border bg-muted/20 px-6 py-5 sm:px-8">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleLocalSave} disabled={saving}>
            <Save size={18} aria-hidden />
            {saving ? "Saving…" : service ? "Update service" : "Create service"}
          </Button>
        </div>
      </div>
    </div>
  );
}
