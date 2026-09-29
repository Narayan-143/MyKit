import React from "react";
import Link from "next/link";
import { UtensilsCrossed, Phone, Mail, MapPin, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-400 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white">MyKit</span>
                <span className="text-[10px] font-bold text-orange-400 tracking-wider uppercase">
                  Good Food. Your Way.
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crafted with authentic ingredients and passionate culinary expertise.
              Experience fresh, made-to-order dishes delivered straight to your table.
            </p>
            <div className="text-[11px] pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Kitchen Open • Fresh Delivery
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-white transition">
                  Full Menu
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition">
                  Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Timings */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Hours of Service
            </h4>
            <div className="space-y-1 text-xs">
              <p className="text-slate-300 font-medium">Monday – Friday</p>
              <p className="text-slate-400">11:00 AM – 11:00 PM</p>
              <p className="text-slate-300 font-medium pt-2">Saturday – Sunday</p>
              <p className="text-slate-400">10:30 AM – 11:30 PM</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Connect
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span>124 Food Street, Indiranagar, Bengaluru</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>support@mykit.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MyKit. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/menu" className="hover:text-slate-300 transition">
              Menu
            </Link>
            <Link href="/cart" className="hover:text-slate-300 transition">
              Cart
            </Link>
            <Link href="/admin" className="hover:text-slate-300 transition">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
