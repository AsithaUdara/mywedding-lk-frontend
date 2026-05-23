"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Mail, Lock, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/shared/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  getRoleFromClaims,
  resolvePostLoginPath,
  syncUserWithBackend,
} from '@/shared/lib/auth/postLoginRedirect';

export default function AdminLoginPage() {
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
      const tokenResult = await user.getIdTokenResult(true);
      const role = getRoleFromClaims(tokenResult.claims as Record<string, unknown>);

      if (role !== 'admin') {
        await auth.signOut();
        setError('Access denied. This account does not have admin privileges.');
        setLoading(false);
        return;
      }

      await syncUserWithBackend();
      const path = await resolvePostLoginPath(user);
      router.push(path);
    } catch (err: unknown) {
      console.error('Admin login failed:', err);
      let message = 'Failed to sign in. Please check your credentials.';
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string };
        if (
          firebaseError.code === 'auth/user-not-found' ||
          firebaseError.code === 'auth/wrong-password' ||
          firebaseError.code === 'auth/invalid-credential'
        ) {
          message = 'Invalid email or password.';
        }
      }
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-xl border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold font-playfair text-charcoal">Admin Sign In</h1>
          <p className="text-slate-500 text-sm mt-2">Platform administration for MyWeddingLK</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-sm font-medium">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-charcoal mb-2 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="admin@mw.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In to Admin <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          <Link href="/" className="text-primary font-semibold hover:underline">
            Back to main site
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
