"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { acceptInvitation } from '@/shared/lib/api/invitations';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

function AcceptInvitationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'already_member' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your invitation...');
    const hasAttempted = React.useRef(false);

    const token = searchParams.get('token');

    useEffect(() => {
        const handleAccept = async () => {
            if (authLoading) return;
            if (hasAttempted.current) return;

            // Note: If user is not immediately available, we should give it a tiny bit of time
            // to resolve auth state, but if they are definitely not logged in:
            if (!user) {
                // If not logged in, redirect to login but keep the token
                router.push(`/login?redirect=/invite/accept?token=${token}`);
                return;
            }

            hasAttempted.current = true;

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
        <div className="flex min-h-screen items-center justify-center bg-background p-4 font-roboto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xl shadow-primary/5"
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
                            <h1 className="font-playfair text-2xl font-bold text-foreground">Processing invitation</h1>
                            <p className="font-medium text-muted-foreground">{message}</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="font-playfair text-2xl font-bold text-foreground">Join successful!</h1>
                            <p className="font-medium text-muted-foreground">{message}</p>
                        </div>
                        <div className="pt-4 space-y-4">
                            <div className="flex items-center justify-center gap-2 text-primary font-bold animate-pulse">
                                <Sparkles size={18} /> Redirecting to your dashboard...
                            </div>
                            <Link
                                href="/dashboard"
                                className="block w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                            >
                                Go to Dashboard Now
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <XCircle className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="font-playfair text-2xl font-bold text-foreground">Invitation error</h1>
                            <p className="font-medium text-destructive">{message}</p>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/"
                                className="block w-full rounded-xl bg-muted py-3 font-bold text-muted-foreground transition-all hover:bg-muted/80"
                            >
                                Back to Homepage
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'already_member' && (
                    <div className="space-y-6">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="font-playfair text-2xl font-bold text-foreground">Already a member!</h1>
                            <p className="font-medium text-muted-foreground">{message}</p>
                        </div>
                        <div className="pt-4 space-y-3">
                            <Link
                                href="/dashboard"
                                className="block w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                            >
                                Go to Dashboard
                            </Link>
                            <Link
                                href="/"
                                className="block w-full rounded-xl bg-muted py-3 font-bold text-muted-foreground transition-all hover:bg-muted/80"
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
            <div className="flex min-h-screen items-center justify-center bg-background font-roboto">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        }>
            <AcceptInvitationContent />
        </Suspense>
    );
}

