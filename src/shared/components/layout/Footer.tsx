import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import Logo from "@/assets/MyWedding.png";

const footerLinks = {
  product: [
    { label: "Planner workspace", href: "/planner/signup" },
    { label: "Vendor directory", href: "/vendors" },
    { label: "Pricing", href: "/#pricing" },
    { label: "How it works", href: "/#how-it-works" },
  ],
  vendors: [
    { label: "List your business", href: "/vendor/signup" },
    { label: "Vendor login", href: "/vendor/login" },
    { label: "Venues", href: "/venues" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src={Logo}
                alt="MyWedding.lk"
                width={140}
                height={36}
                className="brightness-0 invert"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sidebar-muted">
              The B2B2C wedding platform for Sri Lankan planners, vendors, and couples — heritage-grade
              tools with enterprise clarity.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="rounded-full bg-sidebar-border p-2.5 text-sidebar-muted transition-colors duration-200 hover:bg-accent/20 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Product</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-muted transition-colors duration-200 hover:text-sidebar-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-accent">For vendors</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.vendors.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-muted transition-colors duration-200 hover:text-sidebar-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-muted transition-colors duration-200 hover:text-sidebar-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-sidebar-border pt-8 flex flex-col gap-4 text-sm text-sidebar-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} MyWedding.lk. All rights reserved.</p>
          <p className="text-xs">Colombo · Kandy · Galle</p>
        </div>
      </div>
    </footer>
  );
}
