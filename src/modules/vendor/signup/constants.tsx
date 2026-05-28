import {
  Building2,
  Camera,
  Flower2,
  Music4,
  PlusCircle,
  UtensilsCrossed,
} from "lucide-react";
import React from "react";

export const VENDOR_SIGNUP_STEPS = [
  { id: 1, title: "Your account", subtitle: "Secure login for your team" },
  { id: 2, title: "Your business", subtitle: "What couples will discover" },
  { id: 3, title: "Review & launch", subtitle: "Confirm and open your portal" },
] as const;

export const VENDOR_CATEGORIES = [
  {
    id: "venue",
    name: "Venue",
    icon: <Building2 className="h-5 w-5" />,
    description: "Hotels, estates, beachfronts",
  },
  {
    id: "photography",
    name: "Photography",
    icon: <Camera className="h-5 w-5" />,
    description: "Photo & videography",
  },
  {
    id: "catering",
    name: "Catering",
    icon: <UtensilsCrossed className="h-5 w-5" />,
    description: "Food, beverages & service",
  },
  {
    id: "floral",
    name: "Floral & Decor",
    icon: <Flower2 className="h-5 w-5" />,
    description: "Flowers, styling & decor",
  },
  {
    id: "music",
    name: "Music & DJ",
    icon: <Music4 className="h-5 w-5" />,
    description: "Bands, DJs & entertainment",
  },
  {
    id: "other",
    name: "Other services",
    icon: <PlusCircle className="h-5 w-5" />,
    description: "Cakes, rentals, beauty & more",
  },
] as const;

export const SRI_LANKA_CITIES = [
  "Colombo",
  "Kandy",
  "Galle",
  "Negombo",
  "Jaffna",
  "Matara",
  "Anuradhapura",
  "Trincomalee",
  "Batticaloa",
  "Ratnapura",
  "Dambulla",
  "Badulla",
  "Kalutara",
  "Kurunegala",
] as const;

export const SRI_LANKA_PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
] as const;

export type VendorSignupForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessName: string;
  category: string;
  city: string;
  contactPhone: string;
  agreeTerms: boolean;
};

export const INITIAL_VENDOR_SIGNUP_FORM: VendorSignupForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  businessName: "",
  category: "",
  city: "",
  contactPhone: "",
  agreeTerms: false,
};

export function getCategoryLabel(categoryId: string) {
  return VENDOR_CATEGORIES.find((c) => c.id === categoryId)?.name ?? categoryId;
}
