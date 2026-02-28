"use client";

import React, { useState } from 'react';
import {
    Building2,
    MapPin,
    Globe,
    Info,
    Save,
    Image as ImageIcon,
    Camera,
    Plus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function VendorProfilePage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        businessName: 'Majestic Ballroom',
        description: 'We offer the most luxurious wedding hall experience in the heart of Colombo.',
        city: 'Colombo',
        website: 'https://majesticballroom.lk',
    });

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-playfair text-charcoal">Business Profile</h1>
                <p className="text-slate-500">Update how couples see your business on the platform.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="w-full h-full bg-gradient-to-tr from-primary to-accent rounded-2xl shadow-lg shadow-primary/20" />
                            <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-slate-100 text-primary hover:scale-110 transition-transform">
                                <Camera size={18} />
                            </button>
                        </div>
                        <h3 className="font-bold text-charcoal text-lg">{formData.businessName}</h3>
                        <p className="text-sm text-slate-400">ID: {user?.uid.substring(0, 8)}...</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="font-bold text-charcoal text-sm mb-4 uppercase tracking-wider">Verification Status</h4>
                        <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 p-3 rounded-xl">
                            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                            <span className="text-xs uppercase">Verified Partner</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                                    <Building2 size={16} className="text-primary" /> Business Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                                    <Globe size={16} className="text-primary" /> Website
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                                <MapPin size={16} className="text-primary" /> City
                            </label>
                            <input
                                type="text"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                                <Info size={16} className="text-primary" /> Business Description
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-opacity-90 transition-all">
                                <Save size={20} /> Save Changes
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-charcoal text-lg mb-6 flex items-center gap-2">
                            <ImageIcon size={20} className="text-primary" /> Business Portfolio
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-square bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer">
                                    <Plus size={24} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
