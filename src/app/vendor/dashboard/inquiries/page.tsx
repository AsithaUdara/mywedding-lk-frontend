"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/shared/context/AuthContext";
import { getVendorInquiries, markInquiryAsRead } from "@/shared/lib/api/vendors";
import { MessageSquare, Mail, CheckCircle } from "lucide-react";
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
  PageHeader,
  SectionCard,
  StatCard,
} from "@/modules/vendor/dashboard/ui";

interface Inquiry {
  id: string;
  message: string;
  senderEmail: string;
  sentAt: string;
  isRead: boolean;
}

const VendorInquiriesPage = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const token = await user.getIdToken();
      const data = await getVendorInquiries(token);
      setInquiries(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch inquiries.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
    if (!user || currentStatus) return;
    try {
      const token = await user.getIdToken();
      await markInquiryAsRead(token, id);
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, isRead: true } : inq));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to mark inquiry as read.");
    }
  };

  const toggleExpand = (id: string, isRead: boolean) => {
    setExpandedId(expandedId === id ? null : id);
    if (!isRead && expandedId !== id) {
      handleMarkAsRead(id, isRead);
    }
  };

  const unreadCount = inquiries.filter((item) => !item.isRead).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inquiries"
        description="Respond quickly to customer messages and keep your lead conversion high."
        badge={`${unreadCount} unread`}
      />

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          index={0}
          label="Unread"
          value={unreadCount}
          trend={unreadCount > 0 ? "Needs reply" : "Inbox clear"}
          trendTone={unreadCount > 0 ? "attention" : "neutral"}
          icon={MessageSquare}
          iconTheme="rose"
        />
        <StatCard
          index={1}
          label="Total inquiries"
          value={inquiries.length}
          trend={inquiries.length > 0 ? "Active leads" : "No messages yet"}
          trendTone={inquiries.length > 0 ? "success" : "neutral"}
          icon={Mail}
          iconTheme="primary"
        />
      </div>

      <SectionCard title="Inbox" subtitle="Click an inquiry to view full message">
        {loading ? (
          <LoadingState label="Loading inquiries..." />
        ) : inquiries.length === 0 ? (
          <EmptyState
            title="No inquiries yet"
            description="When couples contact you from your public profile, messages appear here."
            action={
              <Link
                href="/vendor/dashboard/profile"
                className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                Update profile
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`overflow-hidden rounded-xl border transition-shadow ${
                  !inquiry.isRead
                    ? "border-l-4 border-l-accent shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div
                  className="flex cursor-pointer flex-col justify-between p-6 hover:bg-gray-50 md:flex-row md:items-center"
                  onClick={() => toggleExpand(inquiry.id, inquiry.isRead)}
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center space-x-3">
                      <span className={`font-bold ${!inquiry.isRead ? "text-black" : "text-gray-700"}`}>
                        {inquiry.senderEmail}
                      </span>
                      {!inquiry.isRead && (
                        <span className="rounded-full bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(inquiry.sentAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center space-x-4 md:mt-0">
                    {!inquiry.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(inquiry.id, inquiry.isRead);
                        }}
                        className="flex items-center space-x-1 text-sm text-gray-500 transition-colors hover:text-green-600"
                      >
                        <CheckCircle size={16} />
                        <span>Mark read</span>
                      </button>
                    )}
                    <button className="text-sm text-accent hover:underline">
                      {expandedId === inquiry.id ? "Hide message" : "Read message"}
                    </button>
                  </div>
                </div>

                {expandedId === inquiry.id && (
                  <div className="whitespace-pre-wrap border-t bg-gray-50 p-6 leading-relaxed text-gray-800">
                    {inquiry.message}
                    <div className="mt-6 flex justify-end border-t pt-6">
                      <a
                        href={`mailto:${inquiry.senderEmail}`}
                        className="rounded-lg bg-accent px-6 py-2 font-semibold text-white transition-colors hover:bg-accent/90"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Reply via email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default VendorInquiriesPage;
