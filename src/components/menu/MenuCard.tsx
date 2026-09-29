"use client";

import React from "react";
import Image from "next/image";
import { Plus, Check, Star, Clock } from "lucide-react";
import { MenuItem } from "@/types/menu";
import { formatINR } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { addItem, selectCartItems } from "@/store/cartSlice";
import { useToast } from "@/components/ui/toast-context";

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const toast = useToast();

  const cartItem = cartItems.find((ci) => ci.menuItemId === item._id);
  const inCartCount = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    dispatch(
      addItem({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
      })
    );
    toast.success(`Added ${item.name} to cart`);
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col h-full">
      {/* Food Image with Featured Badge & Prep Time */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          {item.featured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-orange-600 text-white shadow-md">
              Chef&apos;s Pick
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 text-white backdrop-blur-md">
            {item.category}
          </span>
        </div>

        {/* Rating & Prep Time Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white drop-shadow-md">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full font-bold text-amber-300">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{item.preparationTime}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1.5">
          {item.name}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-1">
          {item.description}
        </p>

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-lg font-black text-slate-900">
              {formatINR(item.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!item.available}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              !item.available
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : inCartCount > 0
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                : "bg-orange-600 text-white hover:bg-orange-700 shadow-sm shadow-orange-600/20 active:scale-95"
            }`}
            aria-label={`Add ${item.name} to cart`}
          >
            {inCartCount > 0 ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>In Cart ({inCartCount})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
