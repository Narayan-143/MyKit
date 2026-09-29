"use client";

import React from "react";
import { MENU_CATEGORIES, MenuCategory } from "@/lib/constants/order";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {MENU_CATEGORIES.map((category: MenuCategory) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/25 scale-[1.02]"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
