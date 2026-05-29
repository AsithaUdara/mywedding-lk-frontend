"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, Mail, Lock, User } from "lucide-react";
import { auth } from "@/shared/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { syncUserWithBackend } from "@/shared/lib/auth/postLoginRedirect";
import { signupPlanner } from "@/shared/lib/api/planner";
import { Button, ErrorBanner, inputClass } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

export default function PlannerSignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
      });

      await syncUserWithBackend();

      const token = await user.getIdToken();
      await signupPlanner(token, {
        businessName,
        businessDescription,
        contactPhone,
        city,
      });

      await user.getIdToken(true);
      router.push("/planner/dashboard");
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === "auth/email-already-in-use") {
        setError("An account already exists with this email. Sign in instead.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to sign up as planner.");
      }
      setLoading(false);
    }
  };

  const fieldLabel = "mb-1.5 block text-sm font-semibold text-foreground";

  return (
    <div className="flex min-h-screen bg-background font-roboto">
      <aside className="relative hidden w-[min(100%,420px)] flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 p-10 text-primary-foreground lg:flex">
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
          <h2 className="font-playfair text-3xl font-bold leading-tight">
            Grow your planning studio
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            One account for client weddings, vendor procurement, timelines, and budgets — built
            for professional planners in Sri Lanka.
          </p>
        </div>
        <p className="text-xs text-white/55">Join studios already using MyWedding.lk.</p>
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center lg:hidden">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">MyWedding.lk</p>
            <p className="mt-1 font-playfair text-2xl font-bold text-foreground">Planner signup</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
            <div className="mb-6 hidden lg:block">
              <h1 className="font-playfair text-3xl font-bold text-foreground">Create planner account</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your profile and business workspace in one step
              </p>
            </div>

            {error && <ErrorBanner message={error} className="mb-6" />}

            <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your account
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="first-name" className={fieldLabel}>
                      First name
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className={cn(inputClass, "pl-10")}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last-name" className={fieldLabel}>
                      Last name
                    </label>
                    <input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="signup-email" className={fieldLabel}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={cn(inputClass, "pl-10")}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="signup-password" className={fieldLabel}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className={cn(inputClass, "pl-10")}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Business profile
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="business-name" className={fieldLabel}>
                      Business name
                    </label>
                    <div className="relative">
                      <Building2
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        id="business-name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        placeholder="Elegant Weddings LK"
                        className={cn(inputClass, "pl-10")}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="business-desc" className={fieldLabel}>
                      Business description
                    </label>
                    <textarea
                      id="business-desc"
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      rows={3}
                      placeholder="Tell couples about your planning style."
                      className={cn(inputClass, "resize-none")}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="contact-phone" className={fieldLabel}>
                        Contact phone
                      </label>
                      <input
                        id="contact-phone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+94 7X XXX XXXX"
                        className={inputClass}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className={fieldLabel}>
                        City
                      </label>
                      <input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Colombo"
                        className={inputClass}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create planner account"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have a planner account?{" "}
              <Link href="/planner/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
