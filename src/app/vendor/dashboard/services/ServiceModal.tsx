"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, Save, AlertCircle, Upload, Trash2 } from "lucide-react";
import { VendorService } from "./page";
import { getVendorCategories, VendorCategory } from "@/shared/lib/api/vendors";
import { validateServiceImageFile } from "@/shared/lib/vendorMedia";

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

  useEffect(() => {
    return () => {
      formData.pendingGalleryItems.forEach((item) => revokeIfBlob(item.previewUrl));
      revokeIfBlob(primaryPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup blob URLs on unmount only
  }, []);

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

  const removeGalleryUrl = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((item) => item !== url),
    }));
  };

  const removePendingGalleryItem = (id: string) => {
    setFormData((prev) => {
      const target = prev.pendingGalleryItems.find((item) => item.id === id);
      if (target) revokeIfBlob(target.previewUrl);
      return {
        ...prev,
        pendingGalleryItems: prev.pendingGalleryItems.filter((item) => item.id !== id),
      };
    });
  };

  const clearPrimaryImage = () => {
    revokeIfBlob(primaryPreview);
    setPrimaryPreview(null);
    setFormData((prev) => ({
      ...prev,
      pendingPrimaryFile: null,
      primaryImageUrl: null,
      removePrimary: true,
    }));
  };

  const handleLocalSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const showGallerySection =
    formData.galleryUrls.length > 0 || formData.pendingGalleryItems.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h3 className="text-lg font-bold text-charcoal">
            {service ? "Edit Service" : "Add New Service"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-8">
          <div className="space-y-2">
            <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-charcoal">
              Primary image
            </label>
            <div className="flex flex-wrap items-start gap-4">
              {hasPrimaryImage && primaryPreview && (
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200">
                  <Image src={primaryPreview} alt="Primary" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={clearPrimaryImage}
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
              {!hasPrimaryImage && (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-6 py-4 text-slate-500 transition hover:border-primary hover:text-primary">
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
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                {errors.primaryImage}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-charcoal">
              Gallery
            </label>
            {showGallerySection && (
              <div className="flex flex-wrap gap-2">
                {formData.galleryUrls.map((url) => (
                  <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200">
                    <Image src={url} alt="Gallery" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeGalleryUrl(url)}
                      className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                {formData.pendingGalleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200"
                  >
                    <Image src={item.previewUrl} alt="New gallery" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removePendingGalleryItem(item.id)}
                      className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary">
              <Upload size={16} />
              Add gallery images
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleGalleryFiles(e.target.files)}
              />
            </label>
            {errors.gallery && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">{errors.gallery}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-charcoal">
              Service Name
            </label>
            <input
              type="text"
              className={`w-full rounded-xl border bg-slate-50 px-4 py-3 font-medium outline-none transition-all ${
                errors.name
                  ? "border-red-300 ring-4 ring-red-50"
                  : "border-slate-200 focus:ring-4 focus:ring-primary/10"
              }`}
              placeholder="e.g. Luxury Banquet Hall"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
            />
            {errors.name && (
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-charcoal">
                Base Price (LKR)
              </label>
              <input
                type="number"
                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 font-medium outline-none transition-all ${
                  errors.basePrice
                    ? "border-red-300 ring-4 ring-red-50"
                    : "border-slate-200 focus:ring-4 focus:ring-primary/10"
                }`}
                placeholder="0.00"
                value={formData.basePrice}
                onChange={(e) => {
                  setFormData({ ...formData, basePrice: e.target.value });
                  if (errors.basePrice) setErrors({ ...errors, basePrice: "" });
                }}
              />
              {errors.basePrice && (
                <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                  {errors.basePrice}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-charcoal">
                Pricing Type
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-charcoal outline-none transition-all focus:ring-4 focus:ring-primary/10"
                value={formData.pricingType}
                onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
              >
                <option value="Fixed">Per Event (Fixed)</option>
                <option value="PerPerson">Per Guest</option>
                <option value="Hourly">Per Hour</option>
                <option value="Package">Package Deal</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-charcoal">
              Service Category
            </label>
            <select
              className={`w-full rounded-xl border bg-slate-50 px-4 py-3 font-bold text-charcoal outline-none transition-all ${
                errors.categoryId
                  ? "border-red-300 ring-4 ring-red-50"
                  : "border-slate-200 focus:ring-4 focus:ring-primary/10"
              }`}
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
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                {errors.categoryId}
              </p>
            )}
          </div>

          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-bold text-charcoal">Show Listing</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Visible to potential customers
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative h-7 w-14 rounded-full outline-none transition-all focus:ring-4 focus:ring-primary/20 ${
                formData.isActive ? "bg-primary" : "bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                  formData.isActive ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-charcoal">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:ring-2 focus:ring-primary/20"
              placeholder="Describe what's included in this service..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 rounded-xl bg-blue-50 p-4 text-blue-700">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              Active services need a primary image to appear on the vendors hub and search pages. Images are stored on
              Cloudinary.
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-8 py-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 text-sm font-bold text-slate-500 transition-colors hover:text-charcoal"
          >
            Cancel
          </button>
          <button
            onClick={handleLocalSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            <Save size={18} /> {saving ? "Saving..." : service ? "Update Service" : "Create Service"}
          </button>
        </div>
      </div>
    </div>
  );
}
