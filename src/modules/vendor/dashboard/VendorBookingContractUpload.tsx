"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, FileUp, Loader2, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";
import {
  openBookingContractPdf,
  sendBookingContractToClient,
  uploadBookingContract,
} from "@/shared/lib/api/contracts";
import { GlassButton } from "@/modules/vendor/dashboard/glass-ui";
import { ErrorBanner } from "@/modules/vendor/dashboard/ui";
import { cn } from "@/shared/lib/cn";
import { vg } from "@/modules/vendor/dashboard/vendor-glass-theme";

type Props = {
  bookingId: string;
  contractUploaded?: boolean;
  contractSentAt?: string | null;
  contractSignedAt?: string | null;
  onUpdated?: () => void;
  className?: string;
};

export function VendorBookingContractUpload({
  bookingId,
  contractUploaded = false,
  contractSentAt,
  contractSignedAt,
  onUpdated,
  className,
}: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<"upload" | "generate" | "send" | "preview" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(contractUploaded);
  const [sentAt, setSentAt] = useState<string | null>(contractSentAt ?? null);

  useEffect(() => {
    setHasDraft(contractUploaded);
    setSentAt(contractSentAt ?? null);
  }, [contractUploaded, contractSentAt]);

  const isSent = Boolean(sentAt);

  const handleUpload = async (file: File) => {
    if (!user) return;
    try {
      setLoading("upload");
      setError(null);
      const token = await user.getIdToken();
      await uploadBookingContract(token, bookingId, { file });
      setHasDraft(true);
      setSentAt(null);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload contract.");
    } finally {
      setLoading(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!user) return;
    try {
      setLoading("generate");
      setError(null);
      const token = await user.getIdToken();
      await uploadBookingContract(token, bookingId, {
        generateStandardContract: true,
      });
      setHasDraft(true);
      setSentAt(null);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate contract.");
    } finally {
      setLoading(null);
    }
  };

  const handlePreview = async () => {
    if (!user) return;
    try {
      setLoading("preview");
      setError(null);
      const token = await user.getIdToken();
      await openBookingContractPdf(token, bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open contract PDF.");
    } finally {
      setLoading(null);
    }
  };

  const handleSend = async () => {
    if (!user) return;
    try {
      setLoading("send");
      setError(null);
      const token = await user.getIdToken();
      const result = await sendBookingContractToClient(token, bookingId);
      setSentAt(result.sentToClientAtUtc);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send contract.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {!hasDraft ? (
        <p className={cn("text-sm", vg.caption)}>
          Generate or upload the contract PDF first. Preview it, then send it to the client when ready.
        </p>
      ) : isSent ? (
        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-3 py-2.5 text-sm text-emerald-900">
          <p className="font-semibold">Contract sent to client</p>
          {contractSignedAt ? (
            <p className={cn("mt-1 text-xs", vg.caption)}>Client signed — awaiting deposit.</p>
          ) : (
            <p className={cn("mt-1 text-xs", vg.caption)}>Waiting for client signature.</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/80 px-3 py-2.5 text-sm text-amber-950">
          <p className="font-semibold">Draft ready — preview before sending</p>
          <p className={cn("mt-1 text-xs", vg.caption)}>
            The client is not notified until you click Send to client.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />
        <GlassButton
          type="button"
          variant="ghost"
          className="gap-1.5"
          disabled={loading !== null || !hasDraft}
          onClick={() => void handlePreview()}
        >
          {loading === "preview" ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : (
            <Eye size={14} aria-hidden />
          )}
          Preview PDF
        </GlassButton>
        {!isSent ? (
          <GlassButton
            type="button"
            variant="primary"
            className="gap-1.5"
            disabled={loading !== null || !hasDraft}
            onClick={() => void handleSend()}
          >
            {loading === "send" ? (
              <Loader2 size={14} className="animate-spin" aria-hidden />
            ) : (
              <Send size={14} aria-hidden />
            )}
            Send to client
          </GlassButton>
        ) : null}
        <GlassButton
          type="button"
          variant="ghost"
          className="gap-1.5"
          disabled={loading !== null}
          onClick={() => inputRef.current?.click()}
        >
          {loading === "upload" ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : (
            <FileUp size={14} aria-hidden />
          )}
          {hasDraft ? "Replace PDF" : "Upload contract PDF"}
        </GlassButton>
        <GlassButton
          type="button"
          variant="ghost"
          className="gap-1.5"
          disabled={loading !== null}
          onClick={() => void handleGenerate()}
        >
          {loading === "generate" ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : (
            <Sparkles size={14} aria-hidden />
          )}
          Generate standard contract
        </GlassButton>
      </div>

      {error ? <ErrorBanner message={error} /> : null}
    </div>
  );
}
