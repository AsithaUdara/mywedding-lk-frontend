// File: src/lib/api/vendors.ts

import { parseApiError } from '@/shared/lib/api/parseApiError';
import { submitPayHereCheckout } from '@/shared/lib/payhereCheckout';

// --- Define the data structures (Types) for our API responses ---

// Type for the list of vendors on the search page
export interface Vendor {
  userId: string;
  businessName: string;
  businessDescription: string | null;
  websiteUrl: string | null;
  contactPhone: string | null;
  city: string;
  verificationStatus: string;
  averageRating: number;
  totalReviews: number;
  minPrice: number;
  categoryName: string;
  primaryImageUrl?: string | null;
  imageUrls?: string[];
  premiumTier?: string;
  isSponsored?: boolean;
  isFeatured?: boolean;
}

export interface VendorCategory {
  id: string;
  name: string;
}

// Type for a single vendor's detailed profile
export interface VendorDetail {
  userId: string;
  businessName: string;
  businessDescription: string | null;
  websiteUrl: string | null;
  contactPhone: string | null;
  city: string;
  province?: string | null;
  verificationStatus: string;
  averageRating: number;
  coverImageUrl?: string | null;
  galleryImageUrls?: string[];
  services: {
    id: string;
    serviceName: string;
    description: string;
    basePrice: number;
    pricingType: string;
    primaryImageUrl?: string | null;
    galleryUrls?: string[];
    tagline?: string | null;
    listingDetailsJson?: string | null;
  }[];
  reviews: {
    id: string;
    reviewerName: string;
    rating: number;
    reviewContent: string;
    createdAt: string;
  }[];
}

// Type for the filter parameters
export interface VendorFilters {
  category?: string;
  location?: string;
}

export interface VendorAnalytics {
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  pendingRevenue: number;
  averageRating: number;
  totalReviews: number;
  totalInquiries: number;
  unreadInquiries: number;
  monthlyEarnings: Array<{
    month: string;
    amount: number;
  }>;
}

export interface VendorDashboardService {
  id: string;
  serviceName: string;
  serviceDescription?: string;
  basePrice: number;
  pricingType: string;
  categoryName: string;
  categoryId: string;
  isActive: boolean;
  status?: string;
  primaryImageUrl?: string | null;
  galleryUrls?: string[];
  tagline?: string | null;
  listingDetailsJson?: string | null;
}

// --- API Functions ---

export const getVendorCategories = async (): Promise<VendorCategory[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendors/categories`;
  const response = await fetch(apiUrl, { method: "GET", next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new Error("Failed to fetch vendor categories.");
  }
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((item: { id: string; name: string }) => ({
    id: String(item.id),
    name: String(item.name),
  }));
};

// 1. Get a list of vendors, with optional filtering
export const getVendors = async (filters: VendorFilters = {}): Promise<Vendor[]> => {
  const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendors`;

  // Build query string from filters
  const queryParams = new URLSearchParams();
  if (filters.category) {
    queryParams.append('category', filters.category);
  }
  if (filters.location) {
    queryParams.append('location', filters.location);
  }

  const apiUrl = `${baseUrl}?${queryParams.toString()}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    // No authorization header needed for public endpoints
    next: { revalidate: 60 } // Optional: Revalidate cache every 60 seconds
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vendors.');
  }
  return response.json();
};

// 2. Get a single vendor by their ID
export const getVendorById = async (vendorId: string): Promise<VendorDetail | null> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendors/${vendorId}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    next: { revalidate: 60 } // Optional: Revalidate cache
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // Handle "Not Found" gracefully
    }
    throw new Error('Failed to fetch vendor details.');
  }
  return response.json();
};

// --- NEW TYPES FOR BOOKING ---
export interface BookingData {
  eventId: string;
  serviceId: string;
  finalAmount: number;
  serviceDate: string;
}

// --- NEW FUNCTION: Create a new booking ---
export const createBooking = async (token: string, bookingData: BookingData) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to create booking.'));
  }
  return response.json();
};

export const createDepositCheckout = async (token: string, bookingId: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/bookings/${bookingId}/deposit-checkout`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response, 'Failed to start payment checkout.'));
  }
  return response.json();
};

export interface BookingPaymentStatus {
  bookingId: string;
  bookingStatus: string;
  paymentStatus: string;
  paidAt?: string | null;
}

export const getBookingPaymentStatus = async (
  token: string,
  bookingId: string
): Promise<BookingPaymentStatus> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/bookings/${bookingId}/status`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch booking payment status.');
  }
  const data = await response.json();
  return {
    bookingId: String(data.bookingId ?? data.BookingId ?? bookingId),
    bookingStatus: String(data.bookingStatus ?? data.BookingStatus ?? ''),
    paymentStatus: String(data.paymentStatus ?? data.PaymentStatus ?? 'None'),
    paidAt: data.paidAt ?? data.PaidAt ?? null,
  };
};

export const registerVendor = async (
  token: string,
  vendorData: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    businessName: string;
    category: string;
    city: string;
    contactPhone?: string;
  }
) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendors/register`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(vendorData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register vendor profile.');
  }
  return response.json();
};

export const getVendorAnalytics = async (token: string): Promise<VendorAnalytics> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/analytics`;
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to load vendor analytics.");
  }
  const data = await response.json();
  const monthlyRaw = data.monthlyEarnings ?? data.MonthlyEarnings ?? [];
  return {
    totalServices: Number(data.totalServices ?? data.TotalServices ?? 0),
    activeServices: Number(data.activeServices ?? data.ActiveServices ?? 0),
    totalBookings: Number(data.totalBookings ?? data.TotalBookings ?? 0),
    pendingBookings: Number(data.pendingBookings ?? data.PendingBookings ?? 0),
    confirmedBookings: Number(data.confirmedBookings ?? data.ConfirmedBookings ?? 0),
    completedBookings: Number(data.completedBookings ?? data.CompletedBookings ?? 0),
    totalRevenue: Number(data.totalRevenue ?? data.TotalRevenue ?? 0),
    pendingRevenue: Number(data.pendingRevenue ?? data.PendingRevenue ?? 0),
    averageRating: Number(data.averageRating ?? data.AverageRating ?? 0),
    totalReviews: Number(data.totalReviews ?? data.TotalReviews ?? 0),
    totalInquiries: Number(data.totalInquiries ?? data.TotalInquiries ?? 0),
    unreadInquiries: Number(data.unreadInquiries ?? data.UnreadInquiries ?? 0),
    monthlyEarnings: (Array.isArray(monthlyRaw) ? monthlyRaw : []).map(
      (item: Record<string, unknown>) => ({
        month: String(item.month ?? item.Month ?? ""),
        amount: Number(item.amount ?? item.Amount ?? 0),
      })
    ),
  };
};

export const getVendorDashboardServices = async (token: string): Promise<VendorDashboardService[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services`;
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch vendor services.");
  }
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((item: Record<string, unknown>) => ({
    id: String(item.id ?? item.Id ?? ""),
    serviceName: String(item.serviceName ?? item.ServiceName ?? ""),
    serviceDescription:
      item.serviceDescription != null || item.ServiceDescription != null
        ? String(item.serviceDescription ?? item.ServiceDescription ?? "")
        : undefined,
    basePrice: Number(item.basePrice ?? item.BasePrice ?? 0),
    pricingType: String(item.pricingType ?? item.PricingType ?? "Fixed"),
    categoryName: String(item.categoryName ?? item.CategoryName ?? "Unknown"),
    categoryId: String(item.categoryId ?? item.CategoryId ?? ""),
    isActive: Boolean(item.isActive ?? item.IsActive),
    status: item.status != null ? String(item.status ?? item.Status) : undefined,
    primaryImageUrl:
      item.primaryImageUrl != null || item.PrimaryImageUrl != null
        ? String(item.primaryImageUrl ?? item.PrimaryImageUrl ?? "") || null
        : null,
    galleryUrls: ((item.galleryUrls ?? item.GalleryUrls ?? []) as unknown[]).map(String),
    tagline:
      item.tagline != null || item.Tagline != null
        ? String(item.tagline ?? item.Tagline ?? "") || null
        : null,
    listingDetailsJson:
      item.listingDetailsJson != null || item.ListingDetailsJson != null
        ? String(item.listingDetailsJson ?? item.ListingDetailsJson ?? "") || null
        : null,
  }));
};

export const createVendorDashboardService = async (
  token: string,
  payload: {
    serviceName: string;
    description: string;
    basePrice: number;
    pricingType: string;
    categoryId: string;
    isActive: boolean;
    primaryImageUrl?: string | null;
    galleryUrls?: string[];
    tagline?: string | null;
    listingDetailsJson?: string;
  }
) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create vendor service.");
  }
  return response.json();
};

export const updateVendorDashboardService = async (
  token: string,
  serviceId: string,
  payload: {
    serviceName: string;
    description: string;
    basePrice: number;
    pricingType: string;
    categoryId: string;
    isActive: boolean;
    primaryImageUrl?: string | null;
    galleryUrls?: string[];
    tagline?: string | null;
    listingDetailsJson?: string;
  }
) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services/${serviceId}`;
  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update vendor service.");
  }
};

export const deleteVendorDashboardService = async (token: string, serviceId: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/services/${serviceId}`;
  const response = await fetch(apiUrl, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete vendor service.");
  }
};

export interface VendorBookingItem {
  bookingId: string;
  serviceName: string;
  eventName: string;
  coupleName: string;
  finalAmount: number;
  status: string;
  serviceDate: string;
}

const BOOKING_STATUS_BY_NUMBER: Record<number, string> = {
  0: "Requested",
  1: "AwaitingPayment",
  2: "Confirmed",
  3: "Completed",
  4: "Cancelled",
  5: "ContractSigned",
};

function normalizeBookingStatus(raw: unknown): string {
  if (typeof raw === "number") {
    return BOOKING_STATUS_BY_NUMBER[raw] ?? String(raw);
  }
  const status = String(raw ?? "");
  if (status === "Pending" || status === "pending") return "Requested";
  return status;
}

export const getVendorBookings = async (token: string): Promise<VendorBookingItem[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/vendor`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch bookings.');
  }
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((item: Record<string, unknown>) => ({
    bookingId: String(item.bookingId ?? item.BookingId ?? ""),
    serviceName: String(item.serviceName ?? item.ServiceName ?? "Unknown"),
    eventName: String(item.eventName ?? item.EventName ?? "Unknown"),
    coupleName: String(item.coupleName ?? item.CoupleName ?? "Unknown"),
    finalAmount: Number(item.finalAmount ?? item.FinalAmount ?? 0),
    status: normalizeBookingStatus(item.status ?? item.Status),
    serviceDate: String(item.serviceDate ?? item.ServiceDate ?? ""),
  }));
};

export const updateBookingStatus = async (token: string, bookingId: string, status: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${bookingId}/status`;
  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update booking status.');
  }
  return response;
};

// --- NEW FUNCTIONS FOR INQUIRIES ---
export const sendInquiry = async (token: string, vendorId: string, message: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendors/${vendorId}/inquiries`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send inquiry.');
  }
  return response.json();
};

export interface VendorInquiryItem {
  id: string;
  message: string;
  subject?: string;
  senderEmail: string;
  senderId: string;
  vendorId: string;
  sentAt: string;
  isRead: boolean;
  from: 'planner' | 'client';
  senderName: string;
  senderOrg: string;
  eventName?: string;
  weddingDate?: string;
  budgetHint?: string;
}

export interface InquiryQuoteResult {
  quoteId: string;
  quoteReference: string;
  amount: number;
  currency: string;
  suggestedReply: string;
  pdfStorageKey?: string;
}

export interface VendorAvailabilityMonth {
  bookedDates: number[];
  blockedDates: number[];
  blockedDateDetails: Array<{ date: string; reason?: string | null }>;
}

export interface WeeklyViewPoint {
  week: string;
  views: number;
}

export interface MonthlyCountPoint {
  month: string;
  count: number;
}

export interface WinRateSummary {
  won: number;
  pending: number;
  lost: number;
}

export const getVendorInquiries = async (token: string): Promise<VendorInquiryItem[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/inquiries`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.detail || errorData.title || 'Failed to fetch inquiries.'
    );
  }
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((item: Record<string, unknown>) => ({
    id: String(item.id ?? item.Id ?? ''),
    message: String(item.message ?? item.Message ?? ''),
    subject: item.subject != null ? String(item.subject ?? item.Subject) : undefined,
    senderEmail: String(item.senderEmail ?? item.SenderEmail ?? ''),
    senderId: String(item.senderId ?? item.SenderId ?? ''),
    vendorId: String(item.vendorId ?? item.VendorId ?? ''),
    sentAt: String(item.sentAt ?? item.SentAt ?? ''),
    isRead: Boolean(item.isRead ?? item.IsRead),
    from: (String(item.from ?? item.From ?? 'client').toLowerCase() === 'planner' ? 'planner' : 'client') as 'planner' | 'client',
    senderName: String(item.senderName ?? item.SenderName ?? ''),
    senderOrg: String(item.senderOrg ?? item.SenderOrg ?? 'Direct inquiry'),
    eventName: item.eventName != null ? String(item.eventName ?? item.EventName) : undefined,
    weddingDate: item.weddingDate != null ? String(item.weddingDate ?? item.WeddingDate) : undefined,
    budgetHint: item.budgetHint != null ? String(item.budgetHint ?? item.BudgetHint) : undefined,
  }));
};

export const generateInquiryQuote = async (
  token: string,
  inquiryId: string,
  proposedAmount?: number
): Promise<InquiryQuoteResult> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/inquiries/${inquiryId}/quote`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ proposedAmount }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.detail || 'Failed to generate quote.');
  }
  const item = await response.json();
  return {
    quoteId: String(item.quoteId ?? item.QuoteId ?? ''),
    quoteReference: String(item.quoteReference ?? item.QuoteReference ?? ''),
    amount: Number(item.amount ?? item.Amount ?? 0),
    currency: String(item.currency ?? item.Currency ?? 'LKR'),
    suggestedReply: String(item.suggestedReply ?? item.SuggestedReply ?? ''),
    pdfStorageKey: item.pdfStorageKey != null ? String(item.pdfStorageKey ?? item.PdfStorageKey) : undefined,
  };
};

export const getVendorAvailability = async (token: string, month: string): Promise<VendorAvailabilityMonth> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/availability?month=${encodeURIComponent(month)}`;
  const response = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load availability.');
  }
  const data = await response.json();
  const rawDetails = (data.blockedDateDetails ?? data.BlockedDateDetails ?? []) as Record<string, unknown>[];
  return {
    bookedDates: (data.bookedDates ?? data.BookedDates ?? []) as number[],
    blockedDates: (data.blockedDates ?? data.BlockedDates ?? []) as number[],
    blockedDateDetails: rawDetails.map((item) => ({
      date: String(item.date ?? item.Date ?? ''),
      reason: item.reason != null || item.Reason != null
        ? String(item.reason ?? item.Reason ?? '')
        : null,
    })),
  };
};

export const blockVendorDate = async (token: string, date: string, reason?: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/availability/block`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date, reason }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to block date.');
  }
};

export const unblockVendorDate = async (token: string, date: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/availability/block/${date}`;
  const response = await fetch(apiUrl, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to unblock date.');
  }
};

export const getVendorProfileViews = async (token: string, weeks = 6): Promise<WeeklyViewPoint[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/analytics/profile-views?weeks=${weeks}`;
  const response = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Failed to load profile views.');
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((item: Record<string, unknown>) => ({
    week: String(item.week ?? item.Week ?? ''),
    views: Number(item.views ?? item.Views ?? 0),
  }));
};

export const getVendorInquiryTrend = async (token: string, months = 6): Promise<MonthlyCountPoint[]> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/analytics/inquiries?months=${months}`;
  const response = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Failed to load inquiry trend.');
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((item: Record<string, unknown>) => ({
    month: String(item.month ?? item.Month ?? ''),
    count: Number(item.count ?? item.Count ?? 0),
  }));
};

export const getVendorWinRate = async (token: string): Promise<WinRateSummary> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/analytics/win-rate`;
  const response = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Failed to load win rate.');
  const data = await response.json();
  return {
    won: Number(data.won ?? data.Won ?? 0),
    pending: Number(data.pending ?? data.Pending ?? 0),
    lost: Number(data.lost ?? data.Lost ?? 0),
  };
};

export const markInquiryAsRead = async (token: string, inquiryId: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/inquiries/${inquiryId}/read`;
  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to mark inquiry as read.');
  }
  return response;
};

export interface VendorSubscriptionInfo {
  tier: string;
  monthlyFee: number;
  status: string;
}

export const getVendorSubscription = async (token: string): Promise<VendorSubscriptionInfo> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/subscription`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load subscription.');
  }
  const data = await response.json();
  return {
    tier: String(data.tier ?? data.Tier ?? 'Free'),
    monthlyFee: Number(data.monthlyFee ?? data.MonthlyFee ?? 0),
    status: String(data.status ?? data.Status ?? 'Active'),
  };
};

export interface VendorBillingProfile {
  hasPaymentMethod: boolean;
  cardholderName?: string;
  cardBrand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export const getVendorBillingProfile = async (token: string): Promise<VendorBillingProfile> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/billing-profile`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load payment method.');
  }
  const data = await response.json();
  return {
    hasPaymentMethod: Boolean(data.hasPaymentMethod ?? data.HasPaymentMethod),
    cardholderName:
      data.cardholderName != null || data.CardholderName != null
        ? String(data.cardholderName ?? data.CardholderName ?? '')
        : undefined,
    cardBrand:
      data.cardBrand != null || data.CardBrand != null
        ? String(data.cardBrand ?? data.CardBrand ?? '')
        : undefined,
    last4:
      data.last4 != null || data.Last4 != null
        ? String(data.last4 ?? data.Last4 ?? '')
        : undefined,
    expiryMonth:
      data.expiryMonth != null || data.ExpiryMonth != null
        ? Number(data.expiryMonth ?? data.ExpiryMonth)
        : undefined,
    expiryYear:
      data.expiryYear != null || data.ExpiryYear != null
        ? Number(data.expiryYear ?? data.ExpiryYear)
        : undefined,
  };
};

export const saveVendorBillingProfile = async (
  token: string,
  payload: {
    cardholderName: string;
    cardBrand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  }
) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/billing-profile`;
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to save payment method.');
  }
  return response.json();
};

export const createVendorSubscriptionCheckout = async (
  token: string,
  payload: { tier: 'Free' | 'Featured' | 'Sponsored'; monthlyFee: number }
) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/subscription/checkout`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to start subscription checkout.');
  }
  return response.json();
};

export function openPayHereCheckout(checkout: Record<string, unknown>) {
  submitPayHereCheckout(checkout);
}

export const setVendorSubscription = async (
  token: string,
  payload: { tier: 'Free' | 'Featured' | 'Sponsored'; monthlyFee: number }
) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/subscription`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update subscription.');
  }
  return response.json();
};

export interface VendorBusinessProfile {
  userId: string;
  businessName: string;
  businessDescription: string | null;
  websiteUrl: string | null;
  contactPhone: string | null;
  city: string;
  province: string | null;
  verificationStatus: string;
}

export const getVendorBusinessProfile = async (token: string): Promise<VendorBusinessProfile> => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/profile`;
  const response = await fetch(apiUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to load business profile.");
  }
  const data = await response.json();
  return {
    userId: String(data.userId ?? data.UserId ?? ""),
    businessName: String(data.businessName ?? data.BusinessName ?? ""),
    businessDescription:
      data.businessDescription != null || data.BusinessDescription != null
        ? String(data.businessDescription ?? data.BusinessDescription ?? "")
        : null,
    websiteUrl:
      data.websiteUrl != null || data.WebsiteUrl != null
        ? String(data.websiteUrl ?? data.WebsiteUrl ?? "") || null
        : null,
    contactPhone:
      data.contactPhone != null || data.ContactPhone != null
        ? String(data.contactPhone ?? data.ContactPhone ?? "") || null
        : null,
    city: String(data.city ?? data.City ?? ""),
    province:
      data.province != null || data.Province != null
        ? String(data.province ?? data.Province ?? "") || null
        : null,
    verificationStatus: String(data.verificationStatus ?? data.VerificationStatus ?? "Pending"),
  };
};

export const updateVendorBusinessProfile = async (
  token: string,
  payload: {
    businessName: string;
    businessDescription?: string;
    websiteUrl?: string;
    contactPhone?: string;
    city: string;
    province?: string;
  }
) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/profile`;
  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update business profile.");
  }
  return response.json();
};

