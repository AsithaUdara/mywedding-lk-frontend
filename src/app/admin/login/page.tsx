"use client";

import React, { useState } from "react";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { auth } from "@/shared/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  getRoleFromClaims,
  resolvePostLoginPath,
  syncUserWithBackend,
} from "@/shared/lib/auth/postLoginRedirect";
import { Button, ErrorBanner, inputClass } from "@/modules/admin/dashboard/ui";
import { cn } from "@/shared/lib/cn";
import {
  GlassAuthCard,
  GlassAuthLayout,
  glassAuthAsideClass,
  glassAuthTitleClass,
} from "@/modules/design-system/regal-frost/GlassAuthLayout";
import { rf } from "@/modules/design-system/regal-frost/tokens";

export default function AdminLoginPage() {
  const router = useRouter();
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

      if (role !== "admin") {
        await auth.signOut();
        setError("Access denied. This account does not have admin privileges.");
        setLoading(false);
        return;
      }

      await syncUserWithBackend();
      const path = await resolvePostLoginPath(user);
      router.push(path);
    } catch (err: unknown) {
      console.error("Admin login failed:", err);
      let message = "Failed to sign in. Please check your credentials.";
      if (err && typeof err === "object" && "code" in err) {
        const firebaseError = err as { code: string };
        if (
          firebaseError.code === "auth/user-not-found" ||
          firebaseError.code === "auth/wrong-password" ||
          firebaseError.code === "auth/invalid-credential"
        ) {
          message = "Invalid email or password.";
        }
      }
      setError(message);
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
                <ShieldCheck size={22} aria-hidden />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide">MyWedding.lk</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                  Platform admin
                </p>
              </div>
            </div>
            <h2 className={glassAuthTitleClass}>Operations & trust at a glance</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              Review vendor KYB, monitor MRR and TPV, and keep the marketplace safe for planners and
              couples.
            </p>
          </div>
          <p className="text-xs text-white/55">Internal use only — admin role required.</p>
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        </aside>
      }
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center lg:hidden">
          <p className={rf.eyebrow}>MyWedding.lk</p>
          <p className={cn("mt-1", glassAuthTitleClass)}>Admin sign in</p>
        </div>

        <GlassAuthCard>
          <div className="mb-6 hidden lg:block">
            <h1 className={glassAuthTitleClass}>Admin sign in</h1>
            <p className={cn("mt-2", rf.subtitle)}>Platform administration</p>
          </div>

          {error && <ErrorBanner message={error} className="mb-6" />}

          <form onSubmit={(e) => void handleLogin(e)} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@mywedding.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className={cn(inputClass, "pl-10 disabled:opacity-50")}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="admin-password"
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
                  id="admin-password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className={cn(inputClass, "pl-10 disabled:opacity-50")}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-8 text-center">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Back to main site
            </Link>
          </p>
        </GlassAuthCard>
      </div>
    </GlassAuthLayout>
  );
}
