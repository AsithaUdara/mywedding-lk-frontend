import "./globals.css";
import { AuthProvider } from "@/shared/context/AuthContext";
import { UIProvider } from "@/shared/context/UIContext";
import { NotificationProvider } from "@/shared/context/NotificationContext";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
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
