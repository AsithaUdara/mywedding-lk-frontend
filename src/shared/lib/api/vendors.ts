// File: src/lib/api/vendors.ts

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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create booking.');
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to start payment checkout.');
  }
  return response.json();
};

export const getBookingPaymentStatus = async (token: string, bookingId: string) => {
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
  return response.json();
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
  return response.json();
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
  return response.json();
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

export const getVendorBookings = async (token: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/vendor`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch bookings.');
  }
  return response.json();
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

export const getVendorInquiries = async (token: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/inquiries`;
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
    senderEmail: String(item.senderEmail ?? item.SenderEmail ?? ''),
    sentAt: String(item.sentAt ?? item.SentAt ?? ''),
    isRead: Boolean(item.isRead ?? item.IsRead),
  }));
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

export const getVendorSubscription = async (token: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vendor/dashboard/subscription`;
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to load subscription.');
  }
  return response.json();
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
  return response.json();
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

export function openPayHereCheckout(checkout: {
  checkoutUrl: string;
  order_id: string | number;
  amount: number | string;
  currency: string;
}) {
  const checkoutUrl = new URL(checkout.checkoutUrl);
  checkoutUrl.searchParams.set('order_id', String(checkout.order_id));
  checkoutUrl.searchParams.set('amount', String(checkout.amount));
  checkoutUrl.searchParams.set('currency', String(checkout.currency));
  window.location.href = checkoutUrl.toString();
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

