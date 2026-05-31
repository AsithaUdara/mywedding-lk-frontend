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
    <footer className="border-t border-border/60 bg-background text-foreground">
      <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" aria-hidden />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image src={Logo} alt="MyWedding.lk" width={140} height={36} className="object-contain" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
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
                  className="rounded-full border border-border/60 bg-white/50 p-2.5 text-muted-foreground backdrop-blur-sm transition-colors duration-200 hover:border-primary/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-glass-body text-xs font-bold uppercase tracking-[0.16em] text-accent">
              Product
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-glass-body text-xs font-bold uppercase tracking-[0.16em] text-accent">
              For vendors
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.vendors.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-glass-body text-xs font-bold uppercase tracking-[0.16em] text-accent">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} MyWedding.lk. All rights reserved.</p>
          <p className="text-xs">Colombo · Kandy · Galle</p>
        </div>
      </div>
    </footer>
  );
}
