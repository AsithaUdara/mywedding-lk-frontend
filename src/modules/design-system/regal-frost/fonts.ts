import { Cinzel, Cormorant_Garamond, DM_Sans } from "next/font/google";

export const luxuryDisplay = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-luxury-display",
});

export const luxurySection = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-luxury-section",
});

export const glassBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-glass-body",
});

export const glassFontVariables = [
  glassBody.variable,
  luxuryDisplay.variable,
  luxurySection.variable,
].join(" ");
