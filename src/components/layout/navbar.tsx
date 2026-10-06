"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/common/NotificationBell";
import { Building2, Menu, X, ShieldCheck, Sparkles } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
            <Building2 className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Room<span className="text-emerald-400">Splits</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              PG & Co-Living Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <NotificationBell />
          <Link href="#login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="#owners">
            <Button variant="outline" size="sm" className="gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              List Property
            </Button>
          </Link>
          <Link href="#explore">
            <Button size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Find Room
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden items-center justify-center p-2 rounded-xl text-slate-300 hover:bg-slate-800"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {siteConfig.navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-200 hover:text-emerald-400 py-1.5"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <Link href="#login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Log In
              </Button>
            </Link>
            <Link href="#explore" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Find Room
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
