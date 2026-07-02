"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, FileSignature, Loader2 } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  getBookingContract,
  openBookingContractPdf,
  signBookingContract,
} from "@/shared/lib/api/contracts";
import { ErrorBanner, inputClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";
import { dispatchVendorProposalsUpdated } from "@/shared/lib/vendorProposalEvents";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

type ContractSignPanelProps = {
  bookingId: string;
  eventId?: string | null;
};

export function ContractSignPanel({ bookingId, eventId }: ContractSignPanelProps) {
  const { user } = useAuth();
  const [signerName, setSignerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loadingContract, setLoadingContract] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canSign, setCanSign] = useState(false);
  const [canPreview, setCanPreview] = useState(false);
  const [resolvedEventId, setResolvedEventId] = useState<string | null>(eventId ?? null);
  const [awaitingVendorSend, setAwaitingVendorSend] = useState(false);

  useEffect(() => {
    if (!user) return;

    void (async () => {
      try {
        setLoadingContract(true);
        const token = await user.getIdToken();
        const details = await getBookingContract(token, bookingId);
        setCanSign(details.canSign);
        setCanPreview(details.canPreview);
        setResolvedEventId(details.eventId || eventId || null);
        setAwaitingVendorSend(!details.sentToClientAt && !details.canPreview && !details.canSign);
        if (details.clientSignedAt) {
          setSuccess("This contract is already signed.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load contract.");
      } finally {
        setLoadingContract(false);
      }
    })();
  }, [user, bookingId, eventId]);

  const handlePreview = async () => {
    if (!user) return;
    try {
      setPreviewLoading(true);
      setError(null);
      const token = await user.getIdToken();
      await openBookingContractPdf(token, bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open contract PDF.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSign = async () => {
    if (!user || !signerName.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const result = await signBookingContract(token, bookingId, {
        signerName: signerName.trim(),
      });
      setSuccess(`Contract signed. Reference hash: ${result.pdfContentHash.slice(0, 16)}…`);
      setCanSign(false);
      if (result.eventId) {
        dispatchVendorProposalsUpdated(result.eventId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signing failed.");
    } finally {
      setLoading(false);
    }
  };

  const backHref = resolvedEventId ? `/events/${resolvedEventId}/vendors` : "/dashboard";

  return (
    <section className={rf.panel}>
      <div className={cn("flex items-center gap-3", rf.panelHeader)}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <FileSignature size={18} aria-hidden />
        </div>
        <div>
          <p className={rf.label}>E-Sign</p>
          <h3 className={rf.sectionTitle}>Sign vendor contract</h3>
        </div>
      </div>

      <div className={rf.panelBody}>
        {loadingContract ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Loading contract…
          </div>
        ) : (
          <>
            <p className={rf.subtitle}>
              Review the vendor contract PDF, then type your full legal name to sign electronically.
              Payment is unlocked only after signing.
            </p>

            {awaitingVendorSend ? (
              <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-900">
                The vendor is still preparing the contract. You will be notified when it is sent for signature.
              </p>
            ) : canPreview ? (
              <GlassButton
                type="button"
                variant="ghost"
                className="mt-4 gap-1.5"
                disabled={previewLoading}
                onClick={() => void handlePreview()}
              >
                {previewLoading ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                ) : (
                  <Eye size={16} aria-hidden />
                )}
                View contract PDF
              </GlassButton>
            ) : (
              <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-900">
                The vendor has not sent the contract yet.
              </p>
            )}

            {canSign ? (
              <>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Full legal name"
                  className={cn(glassInput, "mt-4")}
                />

                <GlassButton
                  type="button"
                  variant="primary"
                  onClick={() => void handleSign()}
                  disabled={loading || !signerName.trim()}
                  className="mt-4 gap-2"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden />
                  ) : (
                    <FileSignature size={16} aria-hidden />
                  )}
                  Sign contract
                </GlassButton>
              </>
            ) : null}

            {success ? (
              <div className="mt-4 space-y-3">
                <p className="rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-sm font-medium text-success backdrop-blur-sm">
                  {success}
                </p>
                <GlassButton href={backHref} variant="primary">
                  Return to vendors
                </GlassButton>
              </div>
            ) : null}

            {error ? (
              <div className="mt-3">
                <ErrorBanner message={error} />
              </div>
            ) : null}

            {!success ? (
              <Link href={backHref} className={cn(rf.btnGhost, "mt-4 inline-flex text-sm")}>
                Back to vendors
              </Link>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
