// src/app/layout.tsx
import { Roboto, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import AIChatbotSidebar from "@/features/ai/AIChatbotSidebar";

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto', 
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata = {
  title: "MyWedding.lk - Your Dream Wedding, Simplified",
  description: "Discover the best vendors, venues, and inspiration for your perfect day in Sri Lanka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${roboto.variable} ${playfairDisplay.variable} antialiased`}>
        <AuthProvider>
          <UIProvider>
            {children}
            <AIChatbotSidebar />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}