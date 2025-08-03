// src/components/Footer.tsx
import React from 'react';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Logo from '@/assets/MyWedding.png'; // Assuming your logo has a transparent background

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--color-primary)' }} className="text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Column 1: Branding & Socials */}
          <div className="md:col-span-1">
            <a href="#">
              {/* Use a version of your logo suitable for dark backgrounds */}
              <Image
                src={Logo}
                alt="MyWedding.lk Logo"
                width={150}
                height={38}
                className="brightness-0 invert" // CSS filter to make the PNG logo white
              />
            </a>
            <p className="mt-4 text-cream/70 text-sm">
              Crafting memorable moments. Your dream wedding, simplified.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Column 2: Company Links */}
          <div>
            <h3 className="text-lg font-bold text-cream mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Column 3: For Vendors */}
          <div>
            <h3 className="text-lg font-bold text-cream mb-4">For Vendors</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-accent transition-colors">List Your Business</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Vendor Login</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Advertising</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <h3 className="text-lg font-bold text-cream mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-accent transition-colors">Inspiration Gallery</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Checklists</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Budget Calculator</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Real Weddings</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-cream/50">
          <p>© {new Date().getFullYear()} MyWedding.lk. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;