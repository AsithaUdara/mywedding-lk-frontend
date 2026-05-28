"use client";

import React from 'react';

export default function StylePage({ params }: { params: Promise<{ eventId: string }> }) {
  void params;

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Style Preferences Retired</h1>
        <p className="mt-2 text-sm text-slate-600">
          This page was removed in the B2B2C redesign purge.
        </p>
      </div>
    </div>
  );
}

