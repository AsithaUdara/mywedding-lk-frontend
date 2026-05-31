"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import { acceptInvitation } from "@/shared/lib/api/invitations";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  GlassAuthCard,
  glassAuthTitleClass,
} from "@/modules/design-system/regal-frost/GlassAuthLayout";
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "already_member" | "error">("loading");
  const [message, setMessage] = useState("Verifying your invitation...");
  const hasAttempted = React.useRef(false);

  const token = searchParams.get("token");

  useEffect(() => {
    const handleAccept = async () => {
      if (authLoading) return;
      if (hasAttempted.current) return;

      if (!user) {
        const returnPath = token
          ? `/invite/accept?token=${encodeURIComponent(token)}`
          : "/invite/accept";
        router.push(`/login?returnUrl=${encodeURIComponent(returnPath)}`);
        return;
      }

      hasAttempted.current = true;

      if (!token) {
        setStatus("error");
        setMessage("Invalid invitation link. Missing token.");
        return;
      }

      try {
        const authToken = await user.getIdToken();
        await acceptInvitation(authToken, { token });
        setStatus("success");
        setMessage("Welcome to the team! You have successfully joined the wedding planning team.");

        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } catch (err) {
        console.error(err);
        const errMsg = err instanceof Error ? err.message : "";
        if (
          errMsg.toLowerCase().includes("invalid") ||
          errMsg.toLowerCase().includes("expired") ||
          errMsg.toLowerCase().includes("already")
        ) {
          setStatus("already_member");
          setMessage(
            "It looks like you're already a member of this event, or this invitation has already been used."
          );
        } else {
          setStatus("error");
          setMessage(errMsg || "Failed to accept invitation. The link may be expired or invalid.");
        }
      }
    };

    handleAccept();
  }, [user, authLoading, token, router]);

  return (
    <RegalFrostShell mesh className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <GlassAuthCard className="text-center">
          {status === "loading" && (
            <div className="space-y-6">
              <div className="relative mx-auto h-20 w-20">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className={glassAuthTitleClass}>Processing invitation</h1>
                <p className={cn(rf.subtitle, "font-medium")}>{message}</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h1 className={glassAuthTitleClass}>Join successful!</h1>
                <p className={cn(rf.subtitle, "font-medium")}>{message}</p>
              </div>
              <div className="space-y-4 pt-4">
                <div className="flex animate-pulse items-center justify-center gap-2 font-bold text-primary">
                  <Sparkles size={18} /> Redirecting to your dashboard...
                </div>
                <Link
                  href="/dashboard"
                  className="block w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  Go to Dashboard Now
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <XCircle className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h1 className={glassAuthTitleClass}>Invitation error</h1>
                <p className="font-medium text-destructive">{message}</p>
              </div>
              <div className="pt-4">
                <Link
                  href="/"
                  className="block w-full rounded-xl bg-muted py-3 font-bold text-muted-foreground transition-all hover:bg-muted/80"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          )}

          {status === "already_member" && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h1 className={glassAuthTitleClass}>Already a member!</h1>
                <p className={cn(rf.subtitle, "font-medium")}>{message}</p>
              </div>
              <div className="space-y-3 pt-4">
                <Link
                  href="/dashboard"
                  className="block w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/"
                  className="block w-full rounded-xl bg-muted py-3 font-bold text-muted-foreground transition-all hover:bg-muted/80"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>
          )}
        </GlassAuthCard>
      </motion.div>
    </RegalFrostShell>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <RegalFrostShell mesh className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </RegalFrostShell>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
