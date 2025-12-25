// File: src/features/authentication/AuthModal.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';

const GoogleIcon = () => ( <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '20px', width: '20px' }}><g fill="none"><path d="m30.7 16.340875c0-1.0635937-.0954375-2.0863125-.2727187-3.06825h-14.1272813v5.8022813h8.0727188c-.3477188 1.8749999-1.4044688 3.4636874-2.9931563 4.527375v3.7635937h4.8477188c2.8364062-2.6113125 4.4727187-6.4568438 4.4727187-11.025z" fill="#4285f4"></path><path d="m16.3 31c4.05 0 7.4454375-1.34325 9.9271875-3.6340312l-4.8477187-3.7635938c-1.3430626.9-3.0613126 1.43175-5.0794688 1.43175-3.9068438 0-7.21363125-2.6386875-8.39323125-6.184125h-5.01135v3.8864063c2.46825 4.9022812 7.54094995 8.2635937 13.40458125 8.2635937z" fill="#34a853"></path><path d="m7.90675 18.8499062c-.3-.9-.4704-1.8613125-.4704-2.85s.1704-1.95.4704-2.85v-3.88635933h-5.01135c-1.0158 2.02504693-1.5954 4.31592183-1.5954 6.73635933 0 2.4204376.5796 4.7113126 1.5954 6.7363125z" fill="#fbbc04"></path><path d="m16.3 6.96595c2.2021875 0 4.1794688.75675 5.7340313 2.2431l4.3023749-4.3023c-2.5977187-2.4204-5.9932499-3.90675-10.0364062-3.90675-5.8636313 0-10.93633125 3.36135-13.40458125 8.26365l5.01135 3.88635c1.1796-3.5454 4.48638745-6.18405 8.39323125-6.18405z" fill="#e94235"></path></g></svg>);
const FacebookIcon = () => ( <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '20px', width: '20px', fill: '#0866ff' }}><path d="m31.9361277 15.9680639c0-8.81884234-7.1492215-15.9680639-15.9680638-15.9680639-8.81884234 0-15.9680639 7.14922156-15.9680639 15.9680639 0 7.4883832 5.15576846 13.7721357 12.1108184 15.497964v-10.6181237h-3.29261481v-4.8798403h3.29261481v-2.1026747c0-5.4348902 2.4597205-7.95401195 7.7956087-7.95401195 1.0117366 0 2.7573653.19864271 3.4714571.3966467v4.42315365c-.3768463-.0396008-1.0315369-.0594012-1.8446307-.0594012-2.6181238 0-3.6298603.9919362-3.6298603 3.5704591v1.7258284h5.2158084l-.8961277 4.8798403h-4.3196807v10.9713373c7.9067465-.9548902 14.0333733-7.6870259 14.0333733-15.8511776z"></path></svg>);

interface AuthModalProps { isOpen: boolean; onClose: () => void; }

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [view, setView] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleBackendSync = async () => {
    const user = auth.currentUser;
    if (!user) { throw new Error("User not found after authentication."); }
    const token = await user.getIdToken(true);
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/sync-user`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) { throw new Error('Failed to sync user with backend.'); }
  };

  // --- THIS IS THE CORRECTED WORKFLOW ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (view === 'signUp') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Step 1: User is created in Firebase
        if (userCredential.user) {
          const fullName = `${firstName} ${lastName}`.trim();
          await updateProfile(userCredential.user, { displayName: fullName });
          // Step 2: Firebase profile is updated with name
        }

        // Step 3: Now that user exists in Firebase, sync them to our backend
        await handleBackendSync();

        // Step 4: Only navigate after everything is successful
        router.push('/dashboard');
        onClose();

      } else { // Sign In Logic
        await signInWithEmailAndPassword(auth, email, password);
        // Step 1: User is logged into Firebase

        // Step 2: Sync their data to ensure our backend has their record
        await handleBackendSync();

        // Step 3: Navigate to the dashboard
        router.push('/dashboard');
        onClose();
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in to continue.');
        setView('signIn');
      } else {
        setError((err.message || 'An error occurred').replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      await handleBackendSync();
      router.push('/dashboard');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md p-8 rounded-xl shadow-2xl" style={{ backgroundColor: 'var(--color-cream)' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors"><X size={24} /></button>
        <h2 className="text-4xl font-bold text-center mb-4" style={{ color: 'var(--color-charcoal)' }}>{view === 'signIn' ? 'Welcome Back' : 'Create Your Account'}</h2>
        <p className="text-center text-gray-500 mb-8">{view === 'signIn' ? 'Log in to continue planning.' : 'Join to start planning your perfect day.'}</p>
        
        <div className="space-y-4">
          <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center"><GoogleIcon /></div>
            <span className="font-semibold text-charcoal flex-grow text-center">Continue with Google</span>
          </button>
          <button disabled={loading} className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center"><FacebookIcon /></div>
            <span className="font-semibold text-charcoal flex-grow text-center">Continue with Facebook</span>
          </button>
        </div>

        <div className="flex items-center my-8"><hr className="flex-grow border-gray-300" /><span className="mx-4 text-gray-400 font-semibold">OR</span><hr className="flex-grow border-gray-300" /></div>
        
        {error && <p className="text-red-500 text-center mb-4 text-sm font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {view === 'signUp' && (
            <div className="flex gap-4">
              <div className="relative w-1/2">
                <UserIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none disabled:opacity-50"/>
              </div>
              <div className="relative w-1/2">
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} className="w-full py-3 pl-4 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none disabled:opacity-50"/>
              </div>
            </div>
          )}
          <div className="relative"><Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/><input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none disabled:opacity-50"/></div>
          <div className="relative"><Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none disabled:opacity-50"/></div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-lg text-white font-semibold shadow-lg smooth-scale-button disabled:opacity-70 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--color-primary)' }}>
            {loading ? 'Processing...' : (view === 'signIn' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center mt-8">
          {view === 'signIn' ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => { setView(view === 'signIn' ? 'signUp' : 'signIn'); setError(null); }} className="font-bold opacity-80 hover:opacity-100 transition-opacity" style={{ color: 'var(--color-primary)' }}>
            {view === 'signIn' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;