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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${bookingId}/contract`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Failed to load contract.");
  }
  const data = await res.json();
  return mapContractDetails(data as Record<string, unknown>);
}

export async function openBookingContractPdf(token: string, bookingId: string): Promise<void> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${bookingId}/contract/file`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Failed to open contract PDF.");
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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${bookingId}/contract/upload`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Failed to upload contract.");
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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${bookingId}/contract/send`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Failed to send contract.");
  }
  const data = await res.json();
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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${bookingId}/contract/sign`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Failed to sign contract.");
  }
  const data = await res.json();
  return {
    bookingId: String(data.bookingId ?? data.BookingId ?? bookingId),
    eventId: String(data.eventId ?? data.EventId ?? ""),
    signedAtUtc: String(data.signedAtUtc ?? data.SignedAtUtc ?? ""),
    pdfContentHash: String(data.pdfContentHash ?? data.PdfContentHash ?? ""),
    status: String(data.status ?? data.Status ?? "ContractSigned"),
  };
}
