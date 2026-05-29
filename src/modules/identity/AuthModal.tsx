"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Mail, Lock, User as UserIcon } from "lucide-react";
import { auth } from "@/shared/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { resolvePostLoginPath, syncUserWithBackend } from "@/shared/lib/auth/postLoginRedirect";
import { Button, ErrorBanner, inputClass } from "@/shared/components/ui";
import { pv } from "@/modules/vendors/public-theme";
import { cn } from "@/shared/lib/cn";

const GoogleIcon = () => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden className="h-5 w-5">
    <g fill="none">
      <path
        d="m30.7 16.340875c0-1.0635937-.0954375-2.0863125-.2727187-3.06825h-14.1272813v5.8022813h8.0727188c-.3477188 1.8749999-1.4044688 3.4636874-2.9931563 4.527375v3.7635937h4.8477188c2.8364062-2.6113125 4.4727187-6.4568438 4.4727187-11.025z"
        fill="#4285f4"
      />
      <path
        d="m16.3 31c4.05 0 7.4454375-1.34325 9.9271875-3.6340312l-4.8477187-3.7635938c-1.3430626.9-3.0613126 1.43175-5.0794688 1.43175-3.9068438 0-7.21363125-2.6386875-8.39323125-6.184125h-5.01135v3.8864063c2.46825 4.9022812 7.54094995 8.2635937 13.40458125 8.2635937z"
        fill="#34a853"
      />
      <path
        d="m7.90675 18.8499062c-.3-.9-.4704-1.8613125-.4704-2.85s.1704-1.95.4704-2.85v-3.88635933h-5.01135c-1.0158 2.02504693-1.5954 4.31592183-1.5954 6.73635933 0 2.4204376.5796 4.7113126 1.5954 6.7363125z"
        fill="#fbbc04"
      />
      <path
        d="m16.3 6.96595c2.2021875 0 4.1794688.75675 5.7340313 2.2431l4.3023749-4.3023c-2.5977187-2.4204-5.9932499-3.90675-10.0364062-3.90675-5.8636313 0-10.93633125 3.36135-13.40458125 8.26365l5.01135 3.88635c1.1796-3.5454 4.48638745-6.18405 8.39323125-6.18405z"
        fill="#e94235"
      />
    </g>
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  signUpHint?: string;
  redirectOnSuccess?: boolean;
  onSuccess?: () => void;
}

const AuthModal = ({
  isOpen,
  onClose,
  title,
  description,
  redirectOnSuccess = true,
  onSuccess,
}: AuthModalProps) => {
  const [view, setView] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const completeAuthFlow = async () => {
    await syncUserWithBackend();
    if (!redirectOnSuccess) {
      onSuccess?.();
      onClose();
      return;
    }
    const user = auth.currentUser;
    if (!user) throw new Error("User not found after authentication.");
    const path = await resolvePostLoginPath(user);
    router.push(path);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (view === "signUp") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: fullName });
        }
        await syncUserWithBackend();
        if (!redirectOnSuccess) {
          onSuccess?.();
          onClose();
        } else {
          router.push("/dashboard");
          onClose();
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        await completeAuthFlow();
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === "auth/email-already-in-use") {
        setError("An account already exists with this email. Please sign in instead.");
        setView("signIn");
      } else if (firebaseError.message === "Failed to sync user with backend.") {
        setError(
          "Authenticated with Firebase, but failed to sync with our database. Please try signing in again."
        );
      } else {
        setError((firebaseError.message || "An error occurred").replace("Firebase: ", ""));
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
      await completeAuthFlow();
    } catch (err: unknown) {
      const firebaseErr = err as { message?: string };
      setError(firebaseErr.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={pv.modalOverlay} onClick={onClose}>
      <div className={pv.modalPanel} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <h2 className="text-center font-playfair text-2xl font-bold text-foreground">
          {title ?? (view === "signIn" ? "Welcome back" : "Create your account")}
        </h2>
        <p className="mb-6 mt-2 text-center text-sm leading-relaxed text-muted-foreground">
          {description ??
            (view === "signIn" ? "Log in to continue planning." : "Join to start planning your perfect day.")}
        </p>

        <div className="space-y-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={loading}
            onClick={() => void handleGoogleSignIn()}
          >
            <GoogleIcon />
            Continue with Google
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <hr className="flex-grow border-border" />
          <span className="text-xs font-semibold uppercase text-muted-foreground">or</span>
          <hr className="flex-grow border-border" />
        </div>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {view === "signUp" && (
            <div className="relative">
              <UserIcon
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className={cn(inputClass, "pl-10 disabled:opacity-50")}
              />
            </div>
          )}
          <div className="relative">
            <Mail
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className={cn(inputClass, "pl-10 disabled:opacity-50")}
            />
          </div>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className={cn(inputClass, "pl-10 disabled:opacity-50")}
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Processing…" : view === "signIn" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {view === "signIn" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setView(view === "signIn" ? "signUp" : "signIn");
              setError(null);
            }}
            className="font-semibold text-primary hover:underline"
          >
            {view === "signIn" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
