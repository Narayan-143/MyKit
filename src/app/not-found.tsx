import React from "react";
import Link from "next/link";
import { UtensilsCrossed, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center mx-auto text-orange-600 shadow-lg shadow-orange-600/10">
          <UtensilsCrossed className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Dish Not On The Menu
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            The page or recipe you are looking for might have been retired, had its name changed,
            or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button variant="secondary">Go to Homepage</Button>
          </Link>
          <Link href="/menu">
            <Button variant="primary">
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
