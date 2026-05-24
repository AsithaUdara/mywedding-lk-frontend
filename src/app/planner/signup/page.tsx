"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/shared/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { syncUserWithBackend } from "@/shared/lib/auth/postLoginRedirect";
import { signupPlanner } from "@/shared/lib/api/planner";

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
      router.push("/planner/overview");
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

  return (
    <main className="min-h-screen bg-cream px-4 py-14">
      <section className="mx-auto max-w-2xl bg-white rounded-3xl shadow p-8 md:p-10">
        <h1 className="text-3xl font-playfair font-bold text-charcoal">Planner Signup</h1>
        <p className="text-slate-500 mt-2">
          Create your account and wedding planner workspace to manage multiple client weddings.
        </p>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Your account</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-charcoal">First Name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-charcoal">Last Name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-charcoal">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-charcoal">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          <p className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Business profile</p>
          <div>
            <label className="text-sm font-semibold text-charcoal">Business Name</label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
              placeholder="Elegant Weddings LK"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-charcoal">Business Description</label>
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
              placeholder="Tell couples about your planning style."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-charcoal">Contact Phone</label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                placeholder="+94 7X XXX XXXX"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-charcoal">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-primary"
                placeholder="Colombo"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Planner Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have a planner account?{" "}
          <Link href="/planner/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
