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
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
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
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { glassAuthAsideClass } from "@/modules/design-system/regal-frost/GlassAuthLayout";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

function StepSidebar({ step }: { step: number }) {
  return (
    <aside
      className={cn(
        glassAuthAsideClass,
        "relative hidden overflow-hidden lg:flex lg:w-[380px] lg:flex-col lg:justify-between"
      )}
    >
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider"
        >
          <Briefcase size={14} />
          Vendor partner program
        </motion.div>
        <h2 className="font-luxury-display text-3xl font-normal leading-tight tracking-[0.04em]">
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
              className={cn(
                "flex items-start gap-4 rounded-2xl border px-4 py-3 transition",
                active
                  ? "border-white/30 bg-white/10"
                  : done
                    ? "border-success/40 bg-success/15"
                    : "border-white/10 bg-white/5"
              )}
            >
              <motion.div
                initial={false}
                animate={{ scale: active ? 1.05 : 1 }}
                className={cn(
                  "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                  done
                    ? "bg-success text-success-foreground"
                    : active
                      ? "bg-white/90 text-foreground"
                      : "bg-white/15 text-white/60"
                )}
              >
                {done ? <CheckCircle2 size={18} /> : s.id}
              </motion.div>
              <div>
                <p className={cn("text-sm font-semibold", active ? "text-white" : "text-white/80")}>
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
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition",
                step > s.id
                  ? "bg-success text-success-foreground"
                  : step === s.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-white/50 text-muted-foreground ring-1 ring-white/60"
              )}
            >
              {step > s.id ? <CheckCircle2 size={16} /> : s.id}
            </div>
            <p
              className={cn(
                "hidden text-center text-[10px] font-semibold sm:block",
                step === s.id ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s.title}
            </p>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((step - 1) / (VENDOR_SIGNUP_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
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
    <label className={cn("mb-1.5 flex items-center gap-2", rf.label)}>
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
    if (!form.agreeTerms) return;

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
      } else if (
        firebaseErr.code === "auth/wrong-password" ||
        firebaseErr.code === "auth/invalid-credential"
      ) {
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
      className={cn(rf.panel, "mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl overflow-hidden")}
    >
      <StepSidebar step={step} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col p-6 sm:p-10 lg:p-12"
      >
        <MobileStepper step={step} />

        <div className="mb-8">
          <p className={rf.eyebrow}>
            Step {step} of {VENDOR_SIGNUP_STEPS.length}
          </p>
          <h1 className={cn(rf.sectionTitle, "mt-2 text-3xl")}>{stepMeta.title}</h1>
          <p className={cn("mt-1", rf.subtitle)}>{stepMeta.subtitle}</p>
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
                      className={glassInput}
                      value={form.firstName}
                      onChange={(e) => patch({ firstName: e.target.value })}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <FieldLabel>Last name</FieldLabel>
                    <input
                      type="text"
                      autoComplete="family-name"
                      placeholder="Fernando"
                      className={glassInput}
                      value={form.lastName}
                      onChange={(e) => patch({ lastName: e.target.value })}
                    />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <FieldLabel icon={<Mail size={15} className="text-muted-foreground" />}>
                    Work email
                  </FieldLabel>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="hello@yourbusiness.lk"
                    className={glassInput}
                    value={form.email}
                    onChange={(e) => patch({ email: e.target.value })}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <FieldLabel icon={<Lock size={15} className="text-muted-foreground" />}>
                    Password
                  </FieldLabel>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    className={glassInput}
                    value={form.password}
                    onChange={(e) => patch({ password: e.target.value })}
                  />
                  <p className={cn("mt-1.5", rf.caption)}>
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
                    className={glassInput}
                    value={form.businessName}
                    onChange={(e) => patch({ businessName: e.target.value })}
                  />
                  <p className={cn("mt-1.5", rf.caption)}>
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
                          className={cn(
                            "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                            selected
                              ? "border-primary/40 bg-primary/10 ring-2 ring-primary/15"
                              : "border-white/55 bg-white/40 backdrop-blur-sm hover:border-[hsl(42_48%_52%/0.28)] hover:bg-white/55"
                          )}
                        >
                          <motion.div
                            initial={false}
                            animate={{ scale: selected ? 1.05 : 1 }}
                            className={cn(
                              "rounded-lg p-2.5",
                              selected
                                ? "bg-primary text-primary-foreground"
                                : "bg-white/50 text-muted-foreground ring-1 ring-white/60"
                            )}
                          >
                            {cat.icon}
                          </motion.div>
                          <motion.div initial={false} animate={{ opacity: selected ? 1 : 0.85 }}>
                            <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                            <p className={rf.caption}>{cat.description}</p>
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
                      className={glassInput}
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
                      className={glassInput}
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
              <div className="rounded-2xl border border-white/55 bg-white/35 p-6 backdrop-blur-sm">
                <p className={rf.label}>Application summary</p>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    ["Account owner", `${form.firstName} ${form.lastName}`],
                    ["Email", form.email],
                    ["Business", form.businessName],
                    ["Category", getCategoryLabel(form.category)],
                    ["Location", form.city],
                    ["Contact phone", form.contactPhone],
                  ].map(([label, value], index, arr) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex justify-between gap-4",
                        index < arr.length - 1 && "border-b border-white/40 pb-3"
                      )}
                    >
                      <dt className={rf.subtitle}>{label}</dt>
                      <dd className="text-right font-semibold text-foreground">{value}</dd>
                    </motion.div>
                  ))}
                </dl>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-white/55 bg-white/40 p-5 backdrop-blur-sm">
                <div className="rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/15">
                  <ShieldCheck size={22} />
                </div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="font-semibold text-foreground">Partner terms</p>
                  <p className={cn("mt-1 leading-relaxed", rf.subtitle)}>
                    MyWedding.lk charges a{" "}
                    <span className="font-semibold text-primary">5% commission</span> on successful
                    bookings. Respond to inquiries within 24 hours and maintain the service quality
                    couples expect.
                  </p>
                </motion.div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/55 bg-white/35 p-4 backdrop-blur-sm transition hover:border-primary/30 hover:bg-primary/5">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded accent-primary"
                  checked={form.agreeTerms}
                  onChange={(e) => patch({ agreeTerms: e.target.checked })}
                />
                <span className={cn("text-sm", rf.subtitle)}>
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

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/40 pt-8">
          {step > 1 ? (
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
              className="gap-2"
            >
              <ChevronLeft size={18} aria-hidden />
              Back
            </GlassButton>
          ) : (
            <p className={cn("text-sm", rf.subtitle)}>
              Already a partner?{" "}
              <Link href="/vendor/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          )}

          {step < 3 ? (
            <GlassButton
              type="button"
              variant="primary"
              disabled={(step === 1 && !accountValid) || (step === 2 && !businessValid)}
              onClick={() => setStep((s) => s + 1)}
              className="gap-2 px-6 py-3"
            >
              Continue
              <ChevronRight size={18} aria-hidden />
            </GlassButton>
          ) : (
            <GlassButton
              type="button"
              variant="primary"
              disabled={!form.agreeTerms || loading}
              onClick={() => void handleSignup()}
              className="gap-2 px-6 py-3"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating portal…
                </>
              ) : (
                <>
                  Create vendor account
                  <ArrowRight size={18} aria-hidden />
                </>
              )}
            </GlassButton>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
