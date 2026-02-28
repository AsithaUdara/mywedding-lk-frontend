// src/app/vendor/login/page.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function VendorLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Force refresh token to get latest custom claims
            const idTokenResult = await user.getIdTokenResult(true);

            if (idTokenResult.claims.role === 'vendor') {
                router.push('/vendor/dashboard');
            } else {
                // Not a vendor
                await auth.signOut();
                setError("Access denied. This account is not registered as a vendor.");
                setLoading(false);
            }
        } catch (err: unknown) {
            console.error('Login failed:', err);
            let message = "Failed to sign in. Please check your credentials.";

            // Type guard for Firebase error
            if (err && typeof err === 'object' && 'code' in err) {
                const firebaseError = err as { code: string };
                if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
                    message = "Invalid email or password.";
                }
            }

            setError(message);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Briefcase size={32} />
                    </div>
                    <h1 className="text-2xl font-bold font-playfair text-charcoal">Vendor Login</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your wedding business dashboard</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-sm animate-pulse">
                        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-charcoal mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="you@business.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-charcoal">Password</label>
                            <Link href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In to Portal'} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <p className="text-slate-500 text-sm">
                        Not a partner yet? <Link href="/vendor/signup" className="text-primary font-bold hover:underline">Apply to join</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
