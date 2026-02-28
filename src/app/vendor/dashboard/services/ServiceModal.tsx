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
        pricingType: 'PerEvent',
        categoryId: '' // For simplicity in this demo, we'll use a text field or static select
    });

    useEffect(() => {
        if (service) {
            setFormData({
                name: service.name || '',
                description: service.description || '',
                basePrice: service.price?.toString().replace(/,/g, '') || '',
                pricingType: service.priceType === 'Per Guest' ? 'PerGuest' : 'PerEvent',
                categoryId: service.categoryId || ''
            });
        } else {
            setFormData({ name: '', description: '', basePrice: '', pricingType: 'PerEvent', categoryId: '' });
        }
    }, [service, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-charcoal">{service ? 'Edit Service' : 'Add New Service'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-charcoal">Service Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            placeholder="e.g. Luxury Banquet Hall"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-charcoal">Base Price (LKR)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                placeholder="0.00"
                                value={formData.basePrice}
                                onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-charcoal">Pricing Type</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-charcoal"
                                value={formData.pricingType}
                                onChange={e => setFormData({ ...formData, pricingType: e.target.value })}
                            >
                                <option value="PerEvent">Per Event</option>
                                <option value="PerGuest">Per Guest</option>
                                <option value="PerHour">Per Hour</option>
                                <option value="PerDay">Per Day</option>
                            </select>
                        </div>
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

                <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-charcoal transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
                    >
                        <Save size={18} /> {service ? 'Update Service' : 'Create Service'}
                    </button>
                </div>
            </div>
        </div>
    );
}
