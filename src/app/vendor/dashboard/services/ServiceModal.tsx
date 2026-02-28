"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { VendorService } from './page';

interface ServiceFormData {
    name: string;
    description: string;
    basePrice: string;
    pricingType: string;
    categoryId: string;
    isActive: boolean;
}

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: ServiceFormData) => void;
    service?: VendorService | null; // If provided, we are editing
}

export default function ServiceModal({ isOpen, onClose, onSave, service }: ServiceModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        pricingType: 'Fixed',
        categoryId: '',
        isActive: true
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (service) {
            setFormData({
                name: service.serviceName || '',
                description: service.serviceDescription || '',
                basePrice: service.basePrice?.toString() || '',
                pricingType: service.pricingType || 'Fixed',
                categoryId: service.categoryId || '',
                isActive: service.isActive !== false // Default to true if undefined
            });
        } else {
            setFormData({ name: '', description: '', basePrice: '', pricingType: 'Fixed', categoryId: '', isActive: true });
        }
        setErrors({});
    }, [service, isOpen]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Service name is required';
        if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) newErrors.basePrice = 'Enter a valid price';
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLocalSave = () => {
        if (validate()) {
            onSave(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                    <h3 className="font-bold text-lg text-charcoal">{service ? 'Edit Service' : 'Add New Service'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-charcoal uppercase tracking-wider text-[11px] px-1">Service Name</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.name ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-primary/10'} rounded-xl outline-none transition-all font-medium`}
                            placeholder="e.g. Luxury Banquet Hall"
                            value={formData.name}
                            onChange={e => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                        />
                        {errors.name && <p className="text-[10px] text-red-500 font-bold px-1 uppercase tracking-wider">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-charcoal uppercase tracking-wider text-[11px] px-1">Base Price (LKR)</label>
                            <input
                                type="number"
                                className={`w-full px-4 py-3 bg-slate-50 border ${errors.basePrice ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-primary/10'} rounded-xl outline-none transition-all font-medium`}
                                placeholder="0.00"
                                value={formData.basePrice}
                                onChange={e => {
                                    setFormData({ ...formData, basePrice: e.target.value });
                                    if (errors.basePrice) setErrors({ ...errors, basePrice: '' });
                                }}
                            />
                            {errors.basePrice && <p className="text-[10px] text-red-500 font-bold px-1 uppercase tracking-wider">{errors.basePrice}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-charcoal uppercase tracking-wider text-[11px] px-1">Pricing Type</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-charcoal"
                                value={formData.pricingType}
                                onChange={e => setFormData({ ...formData, pricingType: e.target.value })}
                            >
                                <option value="Fixed">Per Event (Fixed)</option>
                                <option value="PerPerson">Per Guest</option>
                                <option value="Hourly">Per Hour</option>
                                <option value="Package">Package Deal</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-charcoal uppercase tracking-wider text-[11px] px-1">Service Category</label>
                        <select
                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.categoryId ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-primary/10'} rounded-xl outline-none transition-all font-bold text-charcoal`}
                            value={formData.categoryId}
                            onChange={e => {
                                setFormData({ ...formData, categoryId: e.target.value });
                                if (errors.categoryId) setErrors({ ...errors, categoryId: '' });
                            }}
                        >
                            <option value="">Select a category</option>
                            <option value="11111111-1111-1111-1111-111111111111">Venue</option>
                            <option value="22222222-2222-2222-2222-222222222222">Photography</option>
                            <option value="33333333-3333-3333-3333-333333333333">Catering</option>
                            <option value="44444444-4444-4444-4444-444444444444">Floral & Decor</option>
                            <option value="55555555-5555-5555-5555-555555555555">Music & DJ</option>
                            <option value="66666666-6666-6666-6666-666666666666">Other Services</option>
                        </select>
                        {errors.categoryId && <p className="text-[10px] text-red-500 font-bold px-1 uppercase tracking-wider">{errors.categoryId}</p>}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                        <div>
                            <p className="text-sm font-bold text-charcoal">Show Listing</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Visible to potential customers</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                            className={`w-14 h-7 rounded-full transition-all relative outline-none focus:ring-4 focus:ring-primary/20 ${formData.isActive ? 'bg-primary' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${formData.isActive ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-charcoal">Description</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            placeholder="Describe what's included in this service..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <p className="text-xs leading-relaxed font-medium">
                            High-quality descriptions and transparent pricing help you rank higher in search results and build trust with couples.
                        </p>
                    </div>
                </div>

                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-charcoal transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLocalSave}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
                    >
                        <Save size={18} /> {service ? 'Update Service' : 'Create Service'}
                    </button>
                </div>
            </div>
        </div>
    );
}
