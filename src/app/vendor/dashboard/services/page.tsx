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
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useAuth } from '@/context/AuthContext';

export interface VendorService {
    id: string;
    serviceName: string;
    serviceDescription?: string;
    basePrice: number;
    pricingType: string;
    categoryName: string;
    categoryId: string;
    isActive: boolean;
    status?: string;
}

export default function VendorServicesPage() {
    const { user } = useAuth();
    const [services, setServices] = useState<VendorService[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<VendorService | null>(null);

    // Delete Confirmation State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [serviceIdToDelete, setServiceIdToDelete] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

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

    const handleDelete = (id: string) => {
        setServiceIdToDelete(id);
        setDeleteError(null);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!user || !serviceIdToDelete) return;

        try {
            const token = await user.getIdToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services/${serviceIdToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setServices(services.filter(s => s.id !== serviceIdToDelete));
                setDeleteModalOpen(false);
                setServiceIdToDelete(null);
            } else {
                const errorData = await response.json();
                setDeleteError(errorData.message || 'Failed to delete service. It may have active bookings.');
            }
        } catch (err) {
            console.error("Delete failed", err);
            setDeleteError('An unexpected error occurred. Please try again.');
        }
    };

    interface ServiceFormData {
        name: string;
        description: string;
        basePrice: string;
        pricingType: string;
        categoryId: string;
        isActive: boolean;
    }

    const handleSave = async (formData: ServiceFormData) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const body = {
                serviceName: formData.name,
                description: formData.description,
                basePrice: parseFloat(formData.basePrice),
                pricingType: formData.pricingType,
                categoryId: formData.categoryId || '00000000-0000-0000-0000-000000000000',
                isActive: formData.isActive
            };

            if (selectedService) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services/${selectedService.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });
                if (response.ok) fetchServices();
            } else {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
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
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search services..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                        <Filter size={18} /> Advanced Filter
                    </button>
                </div>
            </div>

            {/* Services List */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-charcoal">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Service Info</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Category</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Pricing</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {services.map((service) => (
                                <tr key={service.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <Package size={22} />
                                            </div>
                                            <span className="font-bold text-charcoal text-base break-all flex-1 min-w-0">{service.serviceName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="flex items-center gap-2 text-slate-500 font-semibold italic">
                                            <Tag size={16} className="text-primary/40" /> {service.categoryName}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div>
                                            <span className="font-bold text-charcoal text-base">LKR {service.basePrice.toLocaleString()}</span>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.1em] font-bold mt-0.5">{service.pricingType}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${service.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {service.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-3 transition-all">
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                title="Edit Service"
                                            >
                                                <Edit3 size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete Service"
                                            >
                                                <Trash2 size={20} />
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

            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Service?"
                message={deleteError || "Are you sure you want to delete this service? This action cannot be undone unless you have active bookings, in which case you should mark it as Inactive."}
            />
        </div>
    );
}
