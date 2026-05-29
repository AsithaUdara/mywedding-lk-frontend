"use client";

import { use } from "react";
import Link from "next/link";
import { ContractSignPanel } from "@/modules/contracts/ContractSignPanel";

export default function ContractSignPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);

  return (
    <main className="min-h-screen bg-background px-4 py-12 font-roboto">
      <div className="mx-auto max-w-lg space-y-6">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          ← Back to dashboard
        </Link>
        <ContractSignPanel bookingId={bookingId} />
      </div>
    </main>
  );
}
