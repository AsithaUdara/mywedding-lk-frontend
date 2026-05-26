"use client";

import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/shared/lib/firebase';
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
      const idTokenResult = await user.getIdTokenResult(true);

      if (idTokenResult.claims.role === 'vendor') {
        router.push('/vendor/dashboard');
      } else {
        await auth.signOut();
        setError('Access denied. This account is not registered as a vendor.');
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error('Login failed:', err);
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
    <div className="min-h-screen flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        className="relative w-full max-w-md p-8 rounded-xl shadow-2xl"
        style={{ backgroundColor: 'var(--color-cream)' }}
      >
        <h2
          className="text-4xl font-bold text-center mb-4"
          style={{ color: 'var(--color-charcoal)' }}
        >
          Vendor Login
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Access your business dashboard
        </p>

        {error && (
          <p className="text-red-500 text-center mb-4 text-sm font-medium">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none disabled:opacity-50"
            />
          </div>
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold shadow-lg smooth-scale-button disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500">
          Not a partner yet?{' '}
          <Link
            href="/vendor/signup"
            className="font-bold opacity-80 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--color-primary)' }}
          >
            Apply to join
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link
            href="/"
            className="text-sm font-bold opacity-80 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--color-primary)' }}
          >
            Back to main site
          </Link>
        </p>
      </div>
    </div>
  );
}
