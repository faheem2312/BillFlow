"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, LayoutDashboard, Settings, LogOut, Receipt } from "lucide-react";
import { signOut } from "next-auth/react";

interface NavbarProps {
  userEmail?: string;
  userLogoUrl?: string | null;
}

export default function Navbar({ userEmail, userLogoUrl }: NavbarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="bg-black border-b border-neutral-800 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              {userLogoUrl ? (
                <img
                  src={userLogoUrl}
                  alt="Business Logo"
                  className="h-9 max-w-[140px] object-contain rounded-lg"
                />
              ) : (
                <div className="flex items-center space-x-2.5">
                  <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-black font-black shadow-md group-hover:scale-105 transition transform">
                    <Receipt className="h-5 w-5 text-black stroke-[2.5]" />
                  </div>
                  <span className="text-xl font-black tracking-tight text-white group-hover:text-neutral-300 transition">
                    BillFlow
                  </span>
                </div>
              )}
            </Link>

            <div className="hidden md:flex md:space-x-1 font-medium">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-lg transition ${
                      isActive
                        ? "bg-white text-black font-bold"
                        : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">{userEmail}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center px-3 py-1.5 border border-neutral-700 text-xs font-semibold rounded-lg text-neutral-300 hover:bg-neutral-900 hover:text-white transition"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}