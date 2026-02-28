"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit3,
    Trash2,
    Package,
    Tag
} from 'lucide-react';

import ServiceModal from './ServiceModal';
import { useAuth } from '@/context/AuthContext';

export interface VendorService {
    id: string;
    name: string;
    description: string;
    price: string | number;
    priceType: string;
    category: string;
    categoryId?: string;
    status: string;
}

export default function VendorServicesPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<VendorService[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<VendorService | null>(null);

    const fetchServices = useCallback(async () => {
        if (!user) {
            return;
        }
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            } else {
                console.error("Failed to fetch services:", response.status, response.statusText);
                setServices([]);
            }
        } catch (err) {
            console.error("Failed to fetch services", err);
            setServices([]);
        }
    }, [user]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleAddNew = () => {
        setSelectedService(null);
        setModalOpen(true);
    };

    const handleEdit = (service: VendorService) => {
        setSelectedService(service);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!user) return;
        if (confirm('Are you sure you want to delete this service?')) {
            try {
                const token = await user.getIdToken();
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    setServices(services.filter(s => s.id !== id));
                }
            } catch (err) {
                console.error("Delete failed", err);
            }
        }
    };

    interface ServiceFormData {
        name: string;
        description: string;
        basePrice: string;
        pricingType: string;
        categoryId: string;
    }

    const handleSave = async (formData: ServiceFormData) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            if (selectedService) {
                // Update logic
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services/${selectedService.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        serviceName: formData.name,
                        description: formData.description,
                        basePrice: parseFloat(formData.basePrice),
                        pricingType: formData.pricingType,
                        categoryId: formData.categoryId || '00000000-0000-0000-0000-000000000000' // Placeholder if not selected
                    })
                });
                if (response.ok) fetchServices();
            } else {
                // Create logic
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        serviceName: formData.name,
                        description: formData.description,
                        basePrice: parseFloat(formData.basePrice),
                        pricingType: formData.pricingType,
                        categoryId: formData.categoryId || '00000000-0000-0000-0000-000000000000'
                    })
                });
                if (response.ok) fetchServices();
            }
            setModalOpen(false);
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-playfair text-charcoal">My Services</h1>
                    <p className="text-slate-500">Manage your service listings and pricing.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all"
                >
                    <Plus size={20} /> Add New Service
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search services..."
                        className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </div>

            {/* Services List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-charcoal">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Service Info</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Pricing</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {services.map((service) => (
                                <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group text-sm font-semibold">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                <Package size={20} />
                                            </div>
                                            <span className="font-bold text-charcoal">{service.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="flex items-center gap-2 text-slate-500">
                                            <Tag size={16} /> {service.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div>
                                            <span className="font-bold text-charcoal">LKR {service.price}</span>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{service.priceType}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${service.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {service.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="p-2 hover:bg-white hover:text-primary rounded-lg shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 hover:bg-white hover:text-red-500 rounded-lg shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ServiceModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                service={selectedService}
            />
        </div>
    );
}
