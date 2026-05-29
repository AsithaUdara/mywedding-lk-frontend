"use client";

import { useState } from "react";
import { FileSignature, Loader2 } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import { signBookingContract } from "@/shared/lib/api/contracts";
import { Button, ErrorBanner, inputClass } from "@/shared/components/ui";

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
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <FileSignature size={18} aria-hidden />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            E-Sign
          </p>
          <h3 className="font-playfair text-lg font-bold text-foreground">Sign vendor contract</h3>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Type your full legal name to electronically sign. We record your IP address, Firebase
        account, timestamp, and a cryptographic hash of the contract for compliance.
      </p>

      {contractFileUrl && (
        <a
          href={contractFileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          View contract PDF
        </a>
      )}

      <input
        type="text"
        value={signerName}
        onChange={(e) => setSignerName(e.target.value)}
        placeholder="Full legal name"
        className={inputClass + " mt-4"}
      />

      <Button
        type="button"
        onClick={() => void handleSign()}
        disabled={loading || !signerName.trim()}
        className="mt-4 gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <FileSignature size={16} aria-hidden />}
        Sign contract
      </Button>

      {success && (
        <p className="mt-3 text-sm font-medium text-success">{success}</p>
      )}
      {error && (
        <div className="mt-3">
          <ErrorBanner message={error} />
        </div>
      )}
    </div>
  );
}
