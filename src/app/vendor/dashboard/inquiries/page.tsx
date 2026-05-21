"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { getVendorInquiries, markInquiryAsRead } from '@/shared/lib/api/vendors';
import { MessageSquare, Mail, CheckCircle } from 'lucide-react';

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

  useEffect(() => {
    fetchInquiries();
  }, [user]);

  const fetchInquiries = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const data = await getVendorInquiries(token);
      setInquiries(data);
    } catch (error) {
      console.error("Failed to fetch inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
    if (!user || currentStatus) return;
    try {
      const token = await user.getIdToken();
      await markInquiryAsRead(token, id);
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, isRead: true } : inq));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const toggleExpand = (id: string, isRead: boolean) => {
    setExpandedId(expandedId === id ? null : id);
    if (!isRead && expandedId !== id) {
      handleMarkAsRead(id, isRead);
    }
  };

  if (loading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading inquiries...</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <MessageSquare size={32} className="text-accent" />
        <h1 className="text-3xl font-bold">Client Inquiries</h1>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center border">
          <Mail size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700">No Inquiries Yet</h3>
          <p className="text-gray-500 mt-2">When couples contact you from your profile, their messages will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div 
              key={inquiry.id} 
              className={`bg-white border rounded-xl overflow-hidden transition-shadow ${!inquiry.isRead ? 'border-l-4 border-l-accent shadow-md' : 'shadow-sm'}`}
            >
              <div 
                className="p-6 cursor-pointer flex flex-col md:flex-row justify-between md:items-center hover:bg-gray-50"
                onClick={() => toggleExpand(inquiry.id, inquiry.isRead)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className={`font-bold ${!inquiry.isRead ? 'text-black' : 'text-gray-700'}`}>
                      {inquiry.senderEmail}
                    </span>
                    {!inquiry.isRead && (
                      <span className="px-2 py-1 bg-accent bg-opacity-10 text-accent text-xs font-bold rounded-full">New</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {new Date(inquiry.sentAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  {!inquiry.isRead && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(inquiry.id, inquiry.isRead); }}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
                    >
                      <CheckCircle size={16} />
                      <span>Mark Read</span>
                    </button>
                  )}
                  <button className="text-sm text-accent hover:underline">
                    {expandedId === inquiry.id ? "Hide Message" : "Read Message"}
                  </button>
                </div>
              </div>
              
              {expandedId === inquiry.id && (
                <div className="p-6 bg-gray-50 border-t text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {inquiry.message}
                  
                  <div className="mt-6 pt-6 border-t flex justify-end">
                    <a 
                      href={`mailto:${inquiry.senderEmail}`}
                      className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorInquiriesPage;
