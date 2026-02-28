"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { acceptInvitation } from '@/lib/api/events';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

function AcceptInvitationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'already_member' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your invitation...');

    const token = searchParams.get('token');

    useEffect(() => {
        const handleAccept = async () => {
            if (authLoading) return;

            if (!user) {
                // If not logged in, redirect to login but keep the token
                router.push(`/login?redirect=/invite/accept?token=${token}`);
                return;
            }

            if (!token) {
                setStatus('error');
                setMessage('Invalid invitation link. Missing token.');
                return;
            }

            try {
                const authToken = await user.getIdToken();
                await acceptInvitation(authToken, { token });
                setStatus('success');
                setMessage('Welcome to the team! You have successfully joined the wedding planning team.');

                // Redirect after success
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            } catch (err) {
                console.error(err);
                const errMsg = err instanceof Error ? err.message : '';
                // If the error is "Invalid or expired" it likely means the user already accepted
                if (errMsg.toLowerCase().includes('invalid') || errMsg.toLowerCase().includes('expired') || errMsg.toLowerCase().includes('already')) {
                    setStatus('already_member');
                    setMessage("It looks like you're already a member of this event, or this invitation has already been used.");
                } else {
                    setStatus('error');
                    setMessage(errMsg || 'Failed to accept invitation. The link may be expired or invalid.');
                }
            }
        };

        handleAccept();
    }, [user, authLoading, token, router]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-roboto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 text-center"
            >
                {status === 'loading' && (
                    <div className="space-y-6">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                            <div className="relative flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-charcoal font-playfair">Processing Invitation</h1>
                            <p className="text-slate-500 font-medium">{message}</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-charcoal font-playfair">Join Successful!</h1>
                            <p className="text-slate-600 font-medium">{message}</p>
                        </div>
                        <div className="pt-4 space-y-4">
                            <div className="flex items-center justify-center gap-2 text-primary font-bold animate-pulse">
                                <Sparkles size={18} /> Redirecting to your dashboard...
                            </div>
                            <Link
                                href="/dashboard"
                                className="block w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                            >
                                Go to Dashboard Now
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <XCircle className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-charcoal font-playfair">Invitation Error</h1>
                            <p className="text-red-500 font-medium">{message}</p>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/"
                                className="block w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Back to Homepage
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'already_member' && (
                    <div className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-charcoal font-playfair">Already a Member!</h1>
                            <p className="text-slate-600 font-medium">{message}</p>
                        </div>
                        <div className="pt-4 space-y-3">
                            <Link
                                href="/dashboard"
                                className="block w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                            >
                                Go to Dashboard
                            </Link>
                            <Link
                                href="/"
                                className="block w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                            >
                                Back to Homepage
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function AcceptInvitationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-roboto">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        }>
            <AcceptInvitationContent />
        </Suspense>
    );
}
