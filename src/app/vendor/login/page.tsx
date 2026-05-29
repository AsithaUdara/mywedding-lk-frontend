"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, Store } from "lucide-react";
import { auth } from "@/shared/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button, ErrorBanner, inputClass } from "@/modules/vendor/dashboard/ui";
import { cn } from "@/shared/lib/cn";

export default function VendorLoginPage() {
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
      const idTokenResult = await user.getIdTokenResult(true);

      if (idTokenResult.claims.role === "vendor") {
        router.push("/vendor/dashboard");
      } else {
        await auth.signOut();
        setError("Access denied. This account is not registered as a vendor.");
        setLoading(false);
      }
    } catch (err: unknown) {
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
    <div className="flex min-h-screen bg-background font-roboto">
      <aside className="relative hidden w-[min(100%,420px)] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 p-10 text-primary-foreground lg:flex">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <Store size={22} aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">MyWedding.lk</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                Vendor hub
              </p>
            </div>
          </div>
          <h2 className="font-playfair text-3xl font-bold leading-tight">
            Your storefront & CRM in one place
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            Manage inquiries, availability, listings, and bookings — built for Sri Lankan wedding
            vendors.
          </p>
        </div>
        <p className="text-xs text-white/55">
          Trusted by photographers, venues, planners, and décor partners across the island.
        </p>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">MyWedding.lk</p>
            <p className="mt-1 font-playfair text-2xl font-bold text-foreground">Vendor sign in</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
            <div className="mb-6 hidden lg:block">
              <h1 className="font-playfair text-3xl font-bold text-foreground">Vendor sign in</h1>
              <p className="mt-2 text-sm text-muted-foreground">Access your business dashboard</p>
            </div>

            {error && <ErrorBanner message={error} className="mb-6" />}

            <form onSubmit={(e) => void handleLogin(e)} className="space-y-5">
              <div>
                <label htmlFor="vendor-email" className="mb-1.5 block text-sm font-semibold text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    id="vendor-email"
                    type="email"
                    placeholder="hello@yourbusiness.lk"
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
                  htmlFor="vendor-password"
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
                    id="vendor-password"
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

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Not a partner yet?{" "}
              <Link href="/vendor/signup" className="font-semibold text-primary hover:underline">
                Apply to join
              </Link>
            </p>
            <p className="mt-4 text-center">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Back to main site
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
