// File: src/lib/api/vendors.ts

// --- Define the data structures (Types) for our API responses ---

// Type for the list of vendors on the search page
export interface Vendor {
  userId: string;
  businessName: string;
  businessDescription: string | null;
  websiteUrl: string | null;
  city: string;
  verificationStatus: string;
  averageRating: number;
  categoryName: string;
}

// Type for a single vendor's detailed profile
export interface VendorDetail {
  userId: string;
  businessName: string;
  businessDescription: string | null;
  websiteUrl: string | null;
  city: string;
  verificationStatus: string;
  averageRating: number;
  services: {
    id: string;
    serviceName: string;
    description: string;
    basePrice: number;
    pricingType: string;
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

// --- API Functions ---

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
