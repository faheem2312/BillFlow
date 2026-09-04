"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

interface NavbarProps {
  userEmail?: string;
  businessName?: string | null;
  userLogoUrl?: string | null;
}

export default function Navbar({ userEmail, businessName, userLogoUrl }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients",   href: "/clients",   icon: Users },
    { name: "Invoices",  href: "/invoices",  icon: FileText },
    { name: "Settings",  href: "/settings",  icon: Settings },
  ];

  const displayName = businessName?.trim() || userEmail || "";
  const displayAvatar = userLogoUrl || "/logo.png";

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 relative ${
        scrolled
          ? "bg-[#FAFAFA]/85 backdrop-blur-md border-b border-neutral-200/70 shadow-sm py-2 px-4"
          : "bg-[#FAFAFA]/60 backdrop-blur-sm border-b border-transparent pt-3.5 pb-2.5 px-4"
      }`}
    >
      <div className="w-full max-w-5xl mx-auto flex justify-center">
        {/* Floating Pill Container with generous max-width */}
        <nav className="w-full bg-black/95 backdrop-blur-xl rounded-full shadow-2xl shadow-black/30 border border-neutral-800 flex items-center justify-between h-14 px-4">

        {/* Left — Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2.5 group flex-shrink-0">
          {userLogoUrl ? (
            <img
              src={userLogoUrl}
              alt="Logo"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-200">
              <img src="/logo.png" alt="BillFlow" className="h-6 w-6 object-contain" />
            </div>
          )}
        </Link>

        {/* Center — Nav links */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-150 ${
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right — Business Name / Email Pill with Logo Avatar */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {displayName && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900 text-xs font-semibold text-neutral-200 max-w-[220px]">
              <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 border border-neutral-700">
                <img src={displayAvatar} alt="User Avatar" className="h-full w-full object-contain" />
              </div>
              <span className="truncate">{displayName}</span>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            className="h-8 w-8 flex items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors duration-150 flex-shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden h-8 w-8 flex items-center justify-center rounded-full border border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors duration-150"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="absolute top-[4.75rem] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-black rounded-2xl border border-neutral-800 shadow-2xl py-3 px-2 z-50 md:hidden">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-colors w-full ${
                  isActive
                    ? "bg-white text-black"
                    : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                }`}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                {link.name}
              </Link>
            );
          })}
          <div className="mt-2 pt-2 border-t border-neutral-800 px-4">
            <p className="text-xs text-neutral-500 font-mono truncate">{userEmail}</p>
          </div>
        </div>
      )}
    </header>
  );
}