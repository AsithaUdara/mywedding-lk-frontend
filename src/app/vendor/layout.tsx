"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/shared/components/layout/Header";
import { RegalFrostShell } from "@/modules/design-system/regal-frost/RegalFrostShell";
import { cn } from "@/shared/lib/cn";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/vendor/dashboard");
  const isLoginPage = pathname === "/vendor/login";
  const isSignupPage = pathname === "/vendor/signup";
  const isPublicProfile =
    pathname.startsWith("/vendor/") && !isDashboard && !isLoginPage && !isSignupPage;
  const hidePublicHeader = isDashboard || isLoginPage || isSignupPage || isPublicProfile;

  return (
    <RegalFrostShell
      marketing={!isDashboard}
      className={cn("flex min-h-screen flex-col", isDashboard && "bg-transparent")}
    >
      {!hidePublicHeader && <Header />}

      <main className={cn("flex-grow", isDashboard && "min-h-screen")}>{children}</main>

      {!hidePublicHeader && (
        <footer className="border-t border-border bg-white py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} MyWedding.lk · Vendor solutions</p>
            <div className="flex flex-wrap justify-center gap-6 font-medium">
              <Link href="/" className="hover:text-primary transition-colors">
                Consumer site
              </Link>
              <Link href="/vendor/login" className="hover:text-primary transition-colors">
                Vendor sign in
              </Link>
              <Link href="/vendor/signup" className="hover:text-primary transition-colors">
                Join as vendor
              </Link>
            </div>
          </div>
        </footer>
      )}
    </RegalFrostShell>
  );
}
