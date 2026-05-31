"use client";

import { useState } from "react";
import { FileSignature, Loader2 } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { signBookingContract } from "@/shared/lib/api/contracts";
import { ErrorBanner, inputClass } from "@/shared/components/ui";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { rf } from "@/modules/design-system/regal-frost/tokens";
import { cn } from "@/shared/lib/cn";

const glassInput = cn(inputClass, "border-white/55 bg-white/40 backdrop-blur-sm");

type ContractSignPanelProps = {
  bookingId: string;
  contractFileUrl?: string;
};

export function ContractSignPanel({ bookingId, contractFileUrl }: ContractSignPanelProps) {
  const { user } = useAuth();
  const [signerName, setSignerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    if (!user || !signerName.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const result = await signBookingContract(token, bookingId, {
        signerName: signerName.trim(),
        contractFileUrl,
      });
      setSuccess(`Contract signed. Reference hash: ${result.pdfContentHash.slice(0, 16)}…`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signing failed.");
    } finally {
      setLoading(false);
    }
  };

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
        <p className={rf.subtitle}>
          Type your full legal name to electronically sign. We record your IP address, Firebase
          account, timestamp, and a cryptographic hash of the contract for compliance.
        </p>

        {contractFileUrl && (
          <a
            href={contractFileUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(rf.btnGhost, "mt-4 inline-flex gap-1.5")}
          >
            View contract PDF
          </a>
        )}

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

        {success && (
          <p className="mt-3 rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-sm font-medium text-success backdrop-blur-sm">
            {success}
          </p>
        )}
        {error && (
          <div className="mt-3">
            <ErrorBanner message={error} />
          </div>
        )}
      </div>
    </section>
  );
}
