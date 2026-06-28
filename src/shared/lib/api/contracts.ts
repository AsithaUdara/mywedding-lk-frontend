import { apiFetch } from "@/shared/lib/api/apiClient";
import { apiRequestJson, apiUrl } from "@/shared/lib/api/apiRequest";
import { parseApiError } from "@/shared/lib/api/parseApiError";

export interface BookingContractDetails {
  bookingId: string;
  eventId: string;
  contractFileUrl: string | null;
  contractUploadedAt: string | null;
  sentToClientAt: string | null;
  clientSignedAt: string | null;
  bookingStatus: string;
  requiresContractBeforePayment: boolean;
  canPreview: boolean;
  canSendToClient: boolean;
  canSign: boolean;
  canPayDeposit: boolean;
}

export interface UploadBookingContractResult {
  bookingId: string;
  eventId: string;
  contractFileUrl: string;
  uploadedAtUtc: string;
  sentToClient: boolean;
}

function mapContractDetails(raw: Record<string, unknown>): BookingContractDetails {
  return {
    bookingId: String(raw.bookingId ?? raw.BookingId ?? ""),
    eventId: String(raw.eventId ?? raw.EventId ?? ""),
    contractFileUrl:
      raw.contractFileUrl != null
        ? String(raw.contractFileUrl ?? raw.ContractFileUrl)
        : null,
    contractUploadedAt:
      raw.contractUploadedAt != null
        ? String(raw.contractUploadedAt ?? raw.ContractUploadedAt)
        : null,
    sentToClientAt:
      raw.sentToClientAt != null
        ? String(raw.sentToClientAt ?? raw.SentToClientAt)
        : null,
    clientSignedAt:
      raw.clientSignedAt != null
        ? String(raw.clientSignedAt ?? raw.ClientSignedAt)
        : null,
    bookingStatus: String(raw.bookingStatus ?? raw.BookingStatus ?? ""),
    requiresContractBeforePayment: Boolean(
      raw.requiresContractBeforePayment ?? raw.RequiresContractBeforePayment ?? false
    ),
    canPreview: Boolean(raw.canPreview ?? raw.CanPreview ?? false),
    canSendToClient: Boolean(raw.canSendToClient ?? raw.CanSendToClient ?? false),
    canSign: Boolean(raw.canSign ?? raw.CanSign ?? false),
    canPayDeposit: Boolean(raw.canPayDeposit ?? raw.CanPayDeposit ?? false),
  };
}

export async function getBookingContract(
  token: string,
  bookingId: string
): Promise<BookingContractDetails> {
  const data = await apiRequestJson<Record<string, unknown>>(
    token,
    `/api/bookings/${bookingId}/contract`,
    { method: "GET" },
    { fallbackError: "Failed to load contract." }
  );
  return mapContractDetails(data);
}

export async function openBookingContractPdf(token: string, bookingId: string): Promise<void> {
  const res = await apiFetch(token, apiUrl(`/api/bookings/${bookingId}/contract/file`), {
    method: "GET",
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to open contract PDF."));
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function uploadBookingContract(
  token: string,
  bookingId: string,
  options: { file?: File; generateStandardContract?: boolean }
): Promise<UploadBookingContractResult> {
  const formData = new FormData();
  if (options.file) {
    formData.append("file", options.file);
  }
  if (options.generateStandardContract) {
    formData.append("generateStandardContract", "true");
  }

  const res = await apiFetch(token, apiUrl(`/api/bookings/${bookingId}/contract/upload`), {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to upload contract."));
  }
  const data = await res.json();
  return {
    bookingId: String(data.bookingId ?? data.BookingId ?? bookingId),
    eventId: String(data.eventId ?? data.EventId ?? ""),
    contractFileUrl: String(data.contractFileUrl ?? data.ContractFileUrl ?? ""),
    uploadedAtUtc: String(data.uploadedAtUtc ?? data.UploadedAtUtc ?? ""),
    sentToClient: Boolean(data.sentToClient ?? data.SentToClient ?? false),
  };
}

export async function sendBookingContractToClient(
  token: string,
  bookingId: string
): Promise<{ sentToClientAtUtc: string }> {
  const data = await apiRequestJson<Record<string, unknown>>(
    token,
    `/api/bookings/${bookingId}/contract/send`,
    { method: "POST" },
    { fallbackError: "Failed to send contract." }
  );
  return {
    sentToClientAtUtc: String(data.sentToClientAtUtc ?? data.SentToClientAtUtc ?? ""),
  };
}

export interface SignContractPayload {
  signerName: string;
  contractFileUrl?: string;
}

export interface SignContractResult {
  bookingId: string;
  eventId: string;
  signedAtUtc: string;
  pdfContentHash: string;
  status: string;
}

export async function signBookingContract(
  token: string,
  bookingId: string,
  payload: SignContractPayload
): Promise<SignContractResult> {
  const data = await apiRequestJson<Record<string, unknown>>(
    token,
    `/api/bookings/${bookingId}/contract/sign`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { fallbackError: "Failed to sign contract." }
  );
  return {
    bookingId: String(data.bookingId ?? data.BookingId ?? bookingId),
    eventId: String(data.eventId ?? data.EventId ?? ""),
    signedAtUtc: String(data.signedAtUtc ?? data.SignedAtUtc ?? ""),
    pdfContentHash: String(data.pdfContentHash ?? data.PdfContentHash ?? ""),
    status: String(data.status ?? data.Status ?? "ContractSigned"),
  };
}
