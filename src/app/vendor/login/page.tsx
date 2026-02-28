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
        <div className="max-w-md mx-auto px-4 py-24 bg-cream">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-xl p-10 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
                        <Briefcase size={40} />
                    </div>
                    <h1 className="text-3xl font-bold font-playfair text-charcoal">Vendor Login</h1>
                    <p className="text-slate-500 font-medium mt-2">Access your business dashboard</p>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start gap-3 text-sm font-bold animate-shake">
                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-charcoal mb-3 uppercase tracking-wider px-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-semibold shadow-sm"
                                placeholder="you@business.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-3 px-1">
                            <label className="text-sm font-bold text-charcoal uppercase tracking-wider">Password</label>
                            <Link href="#" className="text-sm font-bold text-primary hover:underline underline-offset-4">Forgot password?</Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="password"
                                required
                                className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white outline-none transition-all font-semibold shadow-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-primary text-white font-bold rounded-2xl hover:bg-opacity-90 transition-all shadow-[0_20px_50px_rgba(180,60,60,0.3)] flex items-center justify-center gap-3 group disabled:opacity-50 text-lg active:scale-95"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Sign In to Portal <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                    <p className="text-slate-500 font-medium">
                        Not a partner yet? <Link href="/vendor/signup" className="text-primary font-bold hover:underline underline-offset-4 ml-1">Apply to join</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
