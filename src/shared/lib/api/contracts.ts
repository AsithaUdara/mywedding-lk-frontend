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
