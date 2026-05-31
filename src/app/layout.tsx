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
