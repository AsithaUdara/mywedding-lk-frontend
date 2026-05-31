"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  Heart,
  Loader2,
  Lock,
  Mail,
  Store,
} from "lucide-react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import {
  getSafeReturnUrl,
  resolvePostLoginPathWithReturn,
  syncUserWithBackend,
} from "@/shared/lib/auth/postLoginRedirect";
import { Button, ErrorBanner, inputClass } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import {
  GlassAuthCard,
  glassAuthTitleClass,
} from "@/modules/design-system/regal-frost/GlassAuthLayout";
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";
import { rf } from "@/modules/design-system/regal-frost/tokens";

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

function appendReturnUrl(basePath: string, returnUrl: string | null): string {
  if (!returnUrl) return basePath;
  return `${basePath}?returnUrl=${encodeURIComponent(returnUrl)}`;
}

const rolePickerClass = cn(rf.panel, "flex w-full items-center gap-4 p-5 text-left transition-colors");

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = getSafeReturnUrl(searchParams.get("returnUrl"));

  const [showClientAuth, setShowClientAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeClientAuth = async () => {
    await syncUserWithBackend();
    const user = auth.currentUser;
    if (!user) throw new Error("User not found after authentication.");
    const path = await resolvePostLoginPathWithReturn(user, returnUrl);
    router.push(path);
  };

  const handleClientEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await completeClientAuth();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message.replace("Firebase: ", "") : "Sign-in failed.");
      setLoading(false);
    }
  };

  const handleClientGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      await completeClientAuth();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setLoading(false);
    }
  };

  if (showClientAuth) {
    return (
      <RegalFrostShell mesh className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <GlassAuthCard>
            <button
              type="button"
              onClick={() => {
                setShowClientAuth(false);
                setError(null);
              }}
              className="mb-6 text-sm font-semibold text-primary hover:underline"
            >
              Back to account type
            </button>
            <div className="mb-6">
              <h1 className={glassAuthTitleClass}>Client sign in</h1>
              <p className={cn("mt-2", rf.subtitle)}>
                Sign in to accept your invitation or view your wedding portal.
              </p>
            </div>

            {error && <ErrorBanner message={error} className="mb-6" />}

            <Button
              type="button"
              variant="secondary"
              className="mb-4 w-full gap-2"
              disabled={loading}
              onClick={() => void handleClientGoogleSignIn()}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <form onSubmit={(e) => void handleClientEmailSignIn(e)} className="space-y-5">
              <div>
                <label htmlFor="client-email" className="mb-1.5 block text-sm font-semibold text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    id="client-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading}
                    className={cn(inputClass, "pl-10 disabled:opacity-50")}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="client-password" className="mb-1.5 block text-sm font-semibold text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    id="client-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    className={cn(inputClass, "pl-10 disabled:opacity-50")}
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </GlassAuthCard>
        </div>
      </RegalFrostShell>
    );
  }

  return (
    <RegalFrostShell mesh className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <p className={rf.eyebrow}>MyWedding.lk</p>
          <h1 className={cn("mt-2", glassAuthTitleClass)}>Sign in</h1>
          <p className={cn("mt-2", rf.subtitle)}>
            Choose how you use the platform. You will return to your previous page after signing in.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href={appendReturnUrl("/planner/login", returnUrl)}
            className={rolePickerClass}
          >
            <div className={cn(rf.quickLinkIcon, "h-12 w-12")}>
              <Briefcase size={24} aria-hidden />
            </div>
            <div className="text-left">
              <p className={rf.linkLabel}>Login as Planner</p>
              <p className={rf.subtitle}>Wedding planning agency workspace</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setShowClientAuth(true)}
            className={rolePickerClass}
          >
            <div className={cn(rf.quickLinkIcon, "h-12 w-12 bg-accent/20 text-accent-foreground ring-accent/20 group-hover:bg-accent group-hover:text-accent-foreground")}>
              <Heart size={24} aria-hidden />
            </div>
            <div>
              <p className={rf.linkLabel}>Login as Client</p>
              <p className={rf.subtitle}>Couples and wedding party members</p>
            </div>
          </button>

          <Link
            href={appendReturnUrl("/vendor/login", returnUrl)}
            className={rolePickerClass}
          >
            <div className={cn(rf.quickLinkIcon, "h-12 w-12")}>
              <Store size={24} aria-hidden />
            </div>
            <div className="text-left">
              <p className={rf.linkLabel}>Login as Vendor</p>
              <p className={rf.subtitle}>Photographers, venues, florists, and more</p>
            </div>
          </Link>
        </div>

        <p className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
            Back to homepage
          </Link>
        </p>
      </div>
    </RegalFrostShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <RegalFrostShell mesh className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
        </RegalFrostShell>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
