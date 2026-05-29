import { Roboto, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/shared/context/AuthContext";
import { UIProvider } from "@/shared/context/UIContext";
import { NotificationProvider } from "@/shared/context/NotificationContext";


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
  title: "MyWedding.lk — Scale your planning agency",
  description: "B2B wedding planning SaaS for Sri Lankan agencies. Manage clients, vendors, timelines, and payments in one workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${roboto.variable} ${playfairDisplay.variable} antialiased`} suppressHydrationWarning={true}>
        <AuthProvider>
          <NotificationProvider>
            <UIProvider>
              {children}
            </UIProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
