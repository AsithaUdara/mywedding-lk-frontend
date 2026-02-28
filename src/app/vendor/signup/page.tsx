"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    ShieldCheck,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Building2,
    Camera,
    UtensilsCrossed,
    Flower2,
    Music4,
    PlusCircle,
    Percent,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const VENDOR_CATEGORIES = [
    { id: 'venue', name: 'Venue', icon: <Building2 className="w-5 h-5" />, description: 'Hotels, Estates, Beachfronts' },
    { id: 'photography', name: 'Photography', icon: <Camera className="w-5 h-5" />, description: 'Capture precious moments' },
    { id: 'catering', name: 'Catering', icon: <UtensilsCrossed className="w-5 h-5" />, description: 'Exquisite food & service' },
    { id: 'floral', name: 'Floral & Decor', icon: <Flower2 className="w-5 h-5" />, description: 'Stunning arrangements' },
    { id: 'music', name: 'Music & DJ', icon: <Music4 className="w-5 h-5" />, description: 'Unforgettable entertainment' },
    { id: 'other', name: 'Other', icon: <PlusCircle className="w-5 h-5" />, description: 'Planning, Cakes, Rentals etc' },
];

import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { registerVendor } from '@/lib/api/vendors';
import { useRouter } from 'next/navigation';

export default function VendorSignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        businessName: '',
        category: '',
        firstName: '', // New field
        lastName: '',  // New field
        email: '',
        password: '',
        city: '',
        agreeTerms: false
    });

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSignup = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Create Firebase User
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Update Profile
            await updateProfile(user, {
                displayName: `${formData.firstName} ${formData.lastName}`
            });

            // 3. Register in Backend
            await registerVendor({
                userId: user.uid,
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                businessName: formData.businessName,
                category: formData.category,
                city: formData.city
            });

            // 4. Force token refresh to get the new 'vendor' custom claim
            await user.getIdToken(true);

            // 5. Success - Redirect to Vendor Dashboard
            console.log('Vendor registration successful. Redirecting...');
            router.push('/vendor/dashboard');

        } catch (err) {
            console.error('Signup failed:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred during signup.');
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            {/* Progress Stepper */}
            <div className="flex items-center justify-between mb-12 max-w-md mx-auto">
                {[1, 2, 3].map((num) => (
                    <React.Fragment key={num}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= num ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-200 text-slate-400'}`}>
                            {step > num ? <CheckCircle2 size={20} /> : num}
                        </div>
                        {num < 3 && <div className={`flex-grow h-1 mx-4 rounded ${step > num ? 'bg-primary' : 'bg-slate-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="p-8 md:p-12"
                        >
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold font-playfair text-charcoal mb-3">Join our community of professionals</h1>
                                <p className="text-slate-500">First, lets categorize your business to match you with the right couples.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                {VENDOR_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFormData({ ...formData, category: cat.id })}
                                        className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${formData.category === cat.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <div className={`p-3 rounded-lg ${formData.category === cat.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-charcoal">{cat.name}</h3>
                                            <p className="text-sm text-slate-500">{cat.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    disabled={!formData.category}
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                                >
                                    Continue <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="p-8 md:p-12"
                        >
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold font-playfair text-charcoal mb-3">Tell us about your business</h1>
                                <p className="text-slate-500">Couples want to know who they are booking.</p>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal mb-2">First Name</label>
                                        <input
                                            type="text"
                                            placeholder="John"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-medium"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            placeholder="Doe"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-medium"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                                        <Building2 size={16} className="text-primary" /> Business Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Majestic Ballroom"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-medium"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-charcoal mb-2 flex items-center gap-2">
                                        <MapPin size={16} className="text-primary" /> City
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Colombo, Kandy"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-medium"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal mb-2">Login Email</label>
                                        <input
                                            type="email"
                                            placeholder="business@example.com"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-medium"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal mb-2">Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none font-medium"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button onClick={prevStep} className="flex items-center gap-2 font-bold text-slate-400 hover:text-charcoal transition-colors">
                                    <ChevronLeft size={18} /> Back
                                </button>
                                <button
                                    disabled={!formData.businessName || !formData.city || !formData.email || !formData.password || !formData.firstName || !formData.lastName}
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/25"
                                >
                                    Confirm Details <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="p-8 md:p-12"
                        >
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold font-playfair text-charcoal mb-3">Final Step: Business Alignment</h1>
                                <p className="text-slate-500">Review our policies to start receiving bookings.</p>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                            <Percent size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-charcoal text-lg">Commission Structure</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                MyWedding.lk charges a flat <span className="font-bold text-charcoal underline">10% commission</span> on successful bookings through the platform.
                                                This covers our lead generation, secure payment processing, and ongoing marketing efforts.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-charcoal text-lg">Platform Policies</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed">
                                                By joining, you agree to respond to inquiries within 24 hours, maintain high service standards,
                                                and keep your availability calendar up to date.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-primary"
                                        checked={formData.agreeTerms}
                                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-slate-700">I agree to the Commission Structure and Platform Policies</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <button onClick={prevStep} disabled={loading} className="flex items-center gap-2 font-bold text-slate-400 hover:text-charcoal transition-colors disabled:opacity-50">
                                    <ChevronLeft size={18} /> Back
                                </button>
                                <button
                                    disabled={!formData.agreeTerms || loading}
                                    onClick={handleSignup}
                                    className="px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-primary/30 text-lg flex items-center gap-2"
                                >
                                    {loading ? 'Setting up business...' : 'Create Business Account'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="text-center mt-8 text-slate-500">
                Already have a business account? <Link href="/vendor/login" className="text-primary font-bold hover:underline">Sign in here</Link>
            </p>
        </div>
    );
}
