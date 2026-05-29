"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/shared/lib/firebase";
import { registerVendor } from "@/shared/lib/api/vendors";
import {
  getCategoryLabel,
  INITIAL_VENDOR_SIGNUP_FORM,
  VENDOR_CATEGORIES,
  VENDOR_SIGNUP_STEPS,
  VendorSignupForm,
} from "./constants";

import { ErrorBanner, inputClass } from "@/modules/vendor/dashboard/ui";
import { cn } from "@/shared/lib/cn";

function StepSidebar({ step }: { step: number }) {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/85 p-10 text-primary-foreground lg:flex lg:w-[380px] lg:flex-col lg:justify-between">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider"
        >
          <Briefcase size={14} />
          Vendor partner program
        </motion.div>
        <h2 className="font-playfair text-3xl font-bold leading-tight">
          List your business on Sri Lanka&apos;s wedding marketplace
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/75">
          Receive booking requests, manage inquiries, and get paid through one professional dashboard.
        </p>
      </motion.div>

      <div className="relative z-10 space-y-4">
        {VENDOR_SIGNUP_STEPS.map((s) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div
              key={s.id}
              className={`flex items-start gap-4 rounded-2xl border px-4 py-3 transition ${
                active
                  ? "border-white/30 bg-white/10"
                  : done
                    ? "border-success/40 bg-success/15"
                    : "border-white/10 bg-white/5"
              }`}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1.05 : 1,
                }}
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  done
                    ? "bg-success text-success-foreground"
                    : active
                      ? "bg-card text-foreground"
                      : "bg-white/15 text-white/60"
                }`}
              >
                {done ? <CheckCircle2 size={18} /> : s.id}
              </motion.div>
              <div>
                <p className={`text-sm font-semibold ${active ? "text-white" : "text-white/80"}`}>
                  {s.title}
                </p>
                <p className="text-xs text-white/55">{s.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5" />
      <motion.div
        key={`sidebar-tip-${step}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
      >
        <Sparkles size={16} className="mb-2 text-accent" />
        {step === 1 && "Use a work email you check daily — booking alerts land here."}
        {step === 2 && "Pick the category that best matches your primary service. You can add more services later."}
        {step === 3 && "Profiles are reviewed before going live. Complete your first service listing next."}
      </motion.div>
    </aside>
  );
}

function MobileStepper({ step }: { step: number }) {
  return (
    <div className="mb-8 lg:hidden">
      <div className="flex items-center justify-between gap-2">
        {VENDOR_SIGNUP_STEPS.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition ${
                step > s.id
                  ? "bg-success text-success-foreground"
                  : step === s.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.id ? <CheckCircle2 size={16} /> : s.id}
            </div>
            <p
              className={`hidden text-center text-[10px] font-semibold sm:block ${
                step === s.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.title}
            </p>
          </motion.div>
        ))}
      </div>
      <motion.div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((step - 1) / (VENDOR_SIGNUP_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    </div>
  );
}

function FieldLabel({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-foreground">
      {icon}
      {children}
    </label>
  );
}

export default function VendorSignupFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<VendorSignupForm>(INITIAL_VENDOR_SIGNUP_FORM);

  const stepMeta = VENDOR_SIGNUP_STEPS[step - 1];

  const accountValid = useMemo(
    () =>
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      form.password.length >= 8,
    [form]
  );

  const businessValid = useMemo(
    () =>
      form.businessName.trim() &&
      form.category &&
      form.city.trim() &&
      form.contactPhone.trim(),
    [form]
  );

  const patch = (fields: Partial<VendorSignupForm>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const finalizeVendorRegistration = async (user: FirebaseUser) => {
    await updateProfile(user, {
      displayName: `${form.firstName.trim()} ${form.lastName.trim()}`,
    });

    const token = await user.getIdToken();
    await registerVendor(token, {
      userId: user.uid,
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      businessName: form.businessName.trim(),
      category: form.category,
      city: form.city.trim(),
      contactPhone: form.contactPhone.trim(),
    });

    await user.getIdToken(true);
    router.push("/vendor/dashboard");
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      let user: FirebaseUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          form.email.trim(),
          form.password
        );
        user = userCredential.user;
      } catch (createErr: unknown) {
        const createCode = (createErr as { code?: string }).code;
        if (createCode === "auth/email-already-in-use") {
          // Resume signup when Firebase user exists from a prior failed backend call
          const signInCredential = await signInWithEmailAndPassword(
            auth,
            form.email.trim(),
            form.password
          );
          user = signInCredential.user;
        } else {
          throw createErr;
        }
      }

      await finalizeVendorRegistration(user);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === "auth/email-already-in-use") {
        setError("An account already exists with this email. Sign in instead.");
      } else if (firebaseErr.code === "auth/wrong-password" || firebaseErr.code === "auth/invalid-credential") {
        setError(
          "This email is already registered with a different password. Sign in or reset your password."
        );
      } else if (firebaseErr.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 8 characters.");
      } else {
        setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
      }
      setLoading(false);
    }
  };

  const slide = {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
    >
      <StepSidebar step={step} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col p-6 sm:p-10 lg:p-12"
      >
        <MobileStepper step={step} />

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Step {step} of {VENDOR_SIGNUP_STEPS.length}
          </p>
          <h1 className="mt-2 font-playfair text-3xl font-bold text-foreground">{stepMeta.title}</h1>
          <p className="mt-1 text-muted-foreground">{stepMeta.subtitle}</p>
        </div>

        {error && <ErrorBanner message={error} className="mb-6" />}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="account" {...slide} className="flex flex-1 flex-col">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <FieldLabel icon={<User size={15} className="text-muted-foreground" />}>
                      First name
                    </FieldLabel>
                    <input
                      type="text"
                      autoComplete="given-name"
                      placeholder="Priya"
                      className={inputClass}
                      value={form.firstName}
                      onChange={(e) => patch({ firstName: e.target.value })}
                    />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <FieldLabel>Last name</FieldLabel>
                    <input
                      type="text"
                      autoComplete="family-name"
                      placeholder="Fernando"
                      className={inputClass}
                      value={form.lastName}
                      onChange={(e) => patch({ lastName: e.target.value })}
                    />
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <FieldLabel icon={<Mail size={15} className="text-muted-foreground" />}>
                    Work email
                  </FieldLabel>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="hello@yourbusiness.lk"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => patch({ email: e.target.value })}
                  />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <FieldLabel icon={<Lock size={15} className="text-muted-foreground" />}>
                    Password
                  </FieldLabel>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    className={inputClass}
                    value={form.password}
                    onChange={(e) => patch({ password: e.target.value })}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    You&apos;ll use this to access bookings, inquiries, and payouts.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="business" {...slide} className="flex flex-1 flex-col">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <FieldLabel icon={<Building2 size={15} className="text-muted-foreground" />}>
                    Business name
                  </FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. Cinnamon Grand Weddings"
                    className={inputClass}
                    value={form.businessName}
                    onChange={(e) => patch({ businessName: e.target.value })}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Shown on your public vendor profile and search results.
                  </p>
                </div>

                <div>
                  <FieldLabel>Primary service category</FieldLabel>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {VENDOR_CATEGORIES.map((cat) => {
                      const selected = form.category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => patch({ category: cat.id })}
                          className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                            selected
                              ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                              : "border-border bg-muted/30 hover:border-primary/20 hover:bg-card"
                          }`}
                        >
                          <motion.div
                            initial={false}
                            animate={{ scale: selected ? 1.05 : 1 }}
                            className={`rounded-lg p-2.5 ${
                              selected
                                ? "bg-primary text-white"
                                : "bg-card text-muted-foreground shadow-sm"
                            }`}
                          >
                            {cat.icon}
                          </motion.div>
                          <motion.div initial={false} animate={{ opacity: selected ? 1 : 0.85 }}>
                            <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">{cat.description}</p>
                          </motion.div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel icon={<MapPin size={15} className="text-muted-foreground" />}>
                      City
                    </FieldLabel>
                    <input
                      type="text"
                      placeholder="Colombo"
                      className={inputClass}
                      value={form.city}
                      onChange={(e) => patch({ city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel icon={<Phone size={15} className="text-muted-foreground" />}>
                      Contact phone
                    </FieldLabel>
                    <input
                      type="tel"
                      placeholder="+94 7X XXX XXXX"
                      className={inputClass}
                      value={form.contactPhone}
                      onChange={(e) => patch({ contactPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="review" {...slide} className="flex flex-1 flex-col space-y-6">
              <div className="rounded-2xl border border-border bg-muted/40 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Application summary
                </p>
                <dl className="mt-4 space-y-3 text-sm">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between gap-4 border-b border-border/80 pb-3">
                    <dt className="text-muted-foreground">Account owner</dt>
                    <dd className="font-semibold text-foreground text-right">
                      {form.firstName} {form.lastName}
                    </dd>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex justify-between gap-4 border-b border-border/80 pb-3">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-semibold text-foreground text-right">{form.email}</dd>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex justify-between gap-4 border-b border-border/80 pb-3">
                    <dt className="text-muted-foreground">Business</dt>
                    <dd className="font-semibold text-foreground text-right">{form.businessName}</dd>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex justify-between gap-4 border-b border-border/80 pb-3">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-semibold text-foreground text-right">
                      {getCategoryLabel(form.category)}
                    </dd>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-between gap-4 border-b border-border/80 pb-3">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-semibold text-foreground text-right">{form.city}</dd>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Contact phone</dt>
                    <dd className="font-semibold text-foreground text-right">{form.contactPhone}</dd>
                  </motion.div>
                </dl>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <ShieldCheck size={22} />
                </div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="font-semibold text-foreground">Partner terms</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    MyWedding.lk charges a{" "}
                    <span className="font-semibold text-primary">5% commission</span> on successful
                    bookings. Respond to inquiries within 24 hours and maintain the service quality
                    couples expect.
                  </p>
                </motion.div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition hover:border-primary/30 hover:bg-primary/5">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded accent-primary"
                  checked={form.agreeTerms}
                  onChange={(e) => patch({ agreeTerms: e.target.checked })}
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link href="#" className="font-semibold text-primary hover:underline">
                    partner terms
                  </Link>{" "}
                  and commission structure above.
                </span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Already a partner?{" "}
              <Link href="/vendor/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          )}

          {step < 3 ? (
            <button
              type="button"
              disabled={(step === 1 && !accountValid) || (step === 2 && !businessValid)}
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!form.agreeTerms || loading}
              onClick={handleSignup}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating portal…
                </>
              ) : (
                <>
                  Create vendor account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
