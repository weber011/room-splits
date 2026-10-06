import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { Building2, Heart, Mail, Phone, MapPin, Shield, CheckCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Branding */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Room<span className="text-emerald-400">Splits</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The modern discovery, visit scheduling, instant booking, and rent management platform for PGs, Hostels, and Co-living spaces across India.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Verified Owners</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>Zero Brokerage Options</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Discovery
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="#pg" className="hover:text-emerald-400 transition-colors">Boys PG & Hostels</Link></li>
              <li><Link href="#girls-pg" className="hover:text-emerald-400 transition-colors">Girls PG & Hostels</Link></li>
              <li><Link href="#coliving" className="hover:text-emerald-400 transition-colors">Premium Co-living</Link></li>
              <li><Link href="#flats" className="hover:text-emerald-400 transition-colors">Shared Flats & Rooms</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Platform & Features
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="#schedule-visit" className="hover:text-emerald-400 transition-colors">Schedule Physical Visits</Link></li>
              <li><Link href="#rental-agreement" className="hover:text-emerald-400 transition-colors">Digital Rent Agreements</Link></li>
              <li><Link href="#complaints" className="hover:text-emerald-400 transition-colors">Maintenance Ticketing</Link></li>
              <li><Link href="#owners" className="hover:text-emerald-400 transition-colors">Owner Dashboard</Link></li>
            </ul>
          </div>

          {/* Col 5: Contact & Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
              Contact & Support
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>{siteConfig.contact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>{siteConfig.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>Bengaluru | Delhi NCR | Pune | Hyderabad</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RoomSplits Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>for seamless urban living.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
