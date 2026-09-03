"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface NavbarProps {
  userEmail?: string;
  userLogoUrl?: string | null;
}

export default function Navbar({ userEmail, userLogoUrl }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients",   href: "/clients",   icon: Users },
    { name: "Invoices",  href: "/invoices",  icon: FileText },
    { name: "Settings",  href: "/settings",  icon: Settings },
  ];

  return (
    <div className="w-full flex justify-center pt-4 pb-2 px-4 sticky top-3 z-50">
      {/* Floating Pill Container with generous max-width */}
      <nav className="w-full max-w-5xl bg-black rounded-full shadow-2xl shadow-black/40 border border-neutral-800 flex items-center justify-between h-14 px-4">

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

        {/* Right — Email pill + Sign out */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {userEmail && (
            <div className="hidden sm:flex items-center px-3.5 py-1.5 rounded-full border border-neutral-800 bg-neutral-900 text-xs font-mono text-neutral-300 max-w-[200px] truncate">
              {userEmail}
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

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-black rounded-2xl border border-neutral-800 shadow-2xl py-3 px-2 z-50 md:hidden">
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
    </div>
  );
}