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
        <div className="max-w-4xl mx-auto px-4 py-20 bg-cream">
            {/* Progress Stepper */}
            <div className="flex items-center justify-between mb-12 max-w-md mx-auto">
                {[1, 2, 3].map((num) => (
                    <React.Fragment key={num}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-500 ${step >= num ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-white text-slate-300 border-2 border-slate-100 shadow-sm'}`}>
                            {step > num ? <CheckCircle2 size={24} /> : num}
                        </div>
                        {num < 3 && <div className={`flex-grow h-1 mx-4 rounded-full transition-all duration-500 ${step > num ? 'bg-primary' : 'bg-slate-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 overflow-hidden transition-all duration-500">
                {error && (
                    <div className="p-5 bg-red-50 border-b border-red-100 text-red-600 text-sm font-bold flex items-center gap-3 animate-shake">
                        <AlertCircle size={20} className="flex-shrink-0" /> {error}
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
                            className="p-10 md:p-16"
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-4xl md:text-5xl font-bold font-playfair text-charcoal mb-4">Join our community</h1>
                                <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">Categorize your business to start matching with the right couples on our platform.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
                                {VENDOR_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFormData({ ...formData, category: cat.id })}
                                        className={`flex items-start gap-5 p-6 rounded-2xl border-2 text-left transition-all duration-300 group ${formData.category === cat.id ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10 -translate-y-1' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white hover:shadow-lg'}`}
                                    >
                                        <div className={`p-4 rounded-xl transition-all duration-300 ${formData.category === cat.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/40' : 'bg-white text-slate-400 group-hover:bg-primary/10 group-hover:text-primary shadow-sm'}`}>
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold transition-colors ${formData.category === cat.id ? 'text-charcoal' : 'text-slate-600 group-hover:text-charcoal'}`}>{cat.name}</h3>
                                            <p className="text-sm text-slate-400 font-medium group-hover:text-slate-500 transition-colors">{cat.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    disabled={!formData.category}
                                    onClick={nextStep}
                                    className="flex items-center gap-3 px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-primary/30 group text-lg"
                                >
                                    Get Started <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
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
                            className="p-10 md:p-16"
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-bold font-playfair text-charcoal mb-4">Business Identity</h1>
                                <p className="text-slate-500 text-lg font-medium">Details that help couples build trust with your brand.</p>
                            </div>

                            <div className="space-y-8 mb-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal mb-3 uppercase tracking-wider px-1">First Name</label>
                                        <input
                                            type="text"
                                            placeholder="John"
                                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none font-semibold transition-all shadow-sm"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal mb-3 uppercase tracking-wider px-1">Last Name</label>
                                        <input
                                            type="text"
                                            placeholder="Doe"
                                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none font-semibold transition-all shadow-sm"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-charcoal mb-3 flex items-center gap-2 uppercase tracking-wider px-1">
                                        <Building2 size={16} className="text-primary" /> Business Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Majestic Ballroom"
                                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none font-semibold transition-all shadow-sm"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal mb-3 flex items-center gap-2 uppercase tracking-wider px-1">
                                            <MapPin size={16} className="text-primary" /> City
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Colombo, Kandy"
                                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none font-semibold transition-all shadow-sm"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal mb-3 uppercase tracking-wider px-1">Login Email</label>
                                        <input
                                            type="email"
                                            placeholder="business@example.com"
                                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none font-semibold transition-all shadow-sm"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-charcoal mb-3 uppercase tracking-wider px-1">Password</label>
                                    <input
                                        type="password"
                                        placeholder="Min. 8 characters"
                                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none font-semibold transition-all shadow-sm"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <button onClick={prevStep} className="flex items-center gap-2 font-bold text-slate-400 hover:text-charcoal transition-all hover:scale-105">
                                    <ChevronLeft size={20} /> Back
                                </button>
                                <button
                                    disabled={!formData.businessName || !formData.city || !formData.email || !formData.password || !formData.firstName || !formData.lastName}
                                    onClick={nextStep}
                                    className="flex items-center gap-3 px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-opacity-90 transition-all disabled:opacity-50 shadow-2xl shadow-primary/30 group text-lg"
                                >
                                    Confirm Details <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
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
                            className="p-10 md:p-16"
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-bold font-playfair text-charcoal mb-4">Business Alignment</h1>
                                <p className="text-slate-500 text-lg font-medium">One final check before we launch your portal.</p>
                            </div>

                            <div className="space-y-6 mb-12">
                                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 shadow-inner">
                                    <div className="flex items-start gap-5 mb-10">
                                        <div className="p-4 bg-white text-green-600 rounded-2xl shadow-sm border border-green-50 shadow-green-100/50">
                                            <Percent size={28} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-charcoal text-xl mb-1">Commission Structure</h4>
                                            <p className="text-slate-500 leading-relaxed font-medium">
                                                MyWedding.lk charges a flat <span className="font-bold text-primary px-1 bg-primary/5 rounded">10% commission</span> on successful bookings.
                                                We handle the marketing while you focus on the service.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className="p-4 bg-white text-primary rounded-2xl shadow-sm border border-primary/5 shadow-primary/10">
                                            <ShieldCheck size={28} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-charcoal text-xl mb-1">Professional Excellence</h4>
                                            <p className="text-slate-500 leading-relaxed font-medium">
                                                Respond within 24 hours and maintain top-tier service standards. Build a reputation that attracts high-value couples.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <label className="flex items-center gap-4 p-6 border border-slate-100 bg-white/50 rounded-2xl cursor-pointer hover:bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all transition-all duration-300">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="w-6 h-6 rounded-lg accent-primary cursor-pointer"
                                            checked={formData.agreeTerms}
                                            onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                                        />
                                    </div>
                                    <span className="text-sm md:text-base font-bold text-charcoal">I agree to the commission structure and quality standards.</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <button onClick={prevStep} disabled={loading} className="flex items-center gap-2 font-bold text-slate-400 hover:text-charcoal transition-all hover:scale-105 disabled:opacity-50">
                                    <ChevronLeft size={20} /> Back
                                </button>
                                <button
                                    disabled={!formData.agreeTerms || loading}
                                    onClick={handleSignup}
                                    className="px-12 py-5 bg-primary text-white font-bold rounded-2xl hover:bg-opacity-90 transition-all disabled:opacity-50 shadow-[0_20px_50px_rgba(180,60,60,0.3)] text-xl flex items-center gap-3 active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Setting Up Portal...
                                        </>
                                    ) : (
                                        <>
                                            Finalize My Portal <ChevronRight size={24} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="text-center mt-10 text-slate-500 font-medium">
                Already have a partner account? <Link href="/vendor/login" className="text-primary font-bold hover:underline underline-offset-4 ml-1">Sign in here</Link>
            </p>
        </div>
    );
}
