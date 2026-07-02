"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Briefcase, Lock, Mail } from "lucide-react";
import { auth } from "@/shared/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  getRoleFromClaims,
  getSafeReturnUrl,
  resolvePostLoginPathWithReturn,
  syncUserWithBackend,
} from "@/shared/lib/auth/postLoginRedirect";
import { Button, ErrorBanner, inputClass } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import {
  GlassAuthCard,
  GlassAuthLayout,
  glassAuthAsideClass,
  glassAuthTitleClass,
} from "@/modules/design-system/regal-frost/GlassAuthLayout";
import { rf } from "@/modules/design-system/regal-frost/tokens";

function PlannerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = getSafeReturnUrl(searchParams.get("returnUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      if (role !== "planner") {
        await auth.signOut();
        setError("This account is not registered as a wedding planner.");
        setLoading(false);
        return;
      }

      await syncUserWithBackend();
      const path = await resolvePostLoginPathWithReturn(user, returnUrl);
      router.push(path);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in.");
      setLoading(false);
    }
  };

  return (
    <GlassAuthLayout
      aside={
        <aside className={glassAuthAsideClass}>
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <Briefcase size={22} aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide">MyWedding.lk</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                  Planner workspace
                </p>
              </div>
            </div>
            <h2 className={glassAuthTitleClass}>Your agency command center</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              Manage clients, vendor procurement, timelines, and budgets — built for professional
              wedding planners in Sri Lanka.
            </p>
          </div>
          <p className="text-xs text-white/55">Trusted by planning studios across the island.</p>
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        </aside>
      }
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center lg:hidden">
          <p className={rf.eyebrow}>MyWedding.lk</p>
          <p className={cn("mt-1", glassAuthTitleClass)}>Planner sign in</p>
        </div>

        <GlassAuthCard>
          <div className="mb-6 hidden lg:block">
            <h1 className={glassAuthTitleClass}>Planner sign in</h1>
            <p className={cn("mt-2", rf.subtitle)}>Access your workspace</p>
          </div>

          {error && <ErrorBanner message={error} className="mb-6" />}

          <form onSubmit={(e) => void handleLogin(e)} className="space-y-5">
            <div>
              <label htmlFor="planner-email" className="mb-1.5 block text-sm font-semibold text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="planner-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={cn(inputClass, "pl-10 disabled:opacity-50")}
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="planner-password"
                className="mb-1.5 block text-sm font-semibold text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="planner-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={cn(inputClass, "pl-10 disabled:opacity-50")}
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New planner?{" "}
            <Link href="/planner/signup" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-4 text-center">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Back to main site
            </Link>
          </p>
        </GlassAuthCard>
      </div>
    </GlassAuthLayout>
  );
}

export default function PlannerLoginPage() {
  return (
    <Suspense
      fallback={
        <GlassAuthLayout>
          <div className="flex items-center justify-center py-24" />
        </GlassAuthLayout>
      }
    >
      <PlannerLoginContent />
    </Suspense>
  );
}
