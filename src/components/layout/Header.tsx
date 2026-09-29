"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, UtensilsCrossed, Menu, X, ShieldCheck } from "lucide-react";
import { useAppSelector } from "@/store";
import { selectCartItemCount, selectIsCartHydrated } from "@/store/cartSlice";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const itemCount = useAppSelector(selectCartItemCount);
  const isHydrated = useAppSelector(selectIsCartHydrated);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Cart", href: "/cart" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg p-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                MyKit
              </span>
              <span className="text-[11px] font-semibold text-orange-600 tracking-wider uppercase -mt-1">
                Good Food. Your Way.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors duration-150 relative py-1 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-md px-2 ${
                    isActive
                      ? "text-orange-600 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-orange-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Cart & Admin */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 transition flex items-center gap-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              aria-label={`Open shopping cart with ${isHydrated ? itemCount : 0} items`}
            >
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <span className="hidden sm:inline font-bold">Cart</span>
              {isHydrated && itemCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Admin Portal Shortcut */}
            <Link
              href="/admin"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
              title="Admin Portal"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>Admin</span>
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-semibold transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold text-slate-600 hover:bg-slate-50"
              >
                <ShieldCheck className="w-5 h-5 text-slate-500" />
                <span>Admin Portal</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Cart Slide-over Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  );
}
