"use client";

import React, { useState, useMemo } from "react";
import { MenuItem } from "@/types/menu";
import CategoryFilter from "./CategoryFilter";
import SearchBar from "./SearchBar";
import MenuCard from "./MenuCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Utensils, Sparkles } from "lucide-react";

interface MenuSectionProps {
  initialItems: MenuItem[];
}

export default function MenuSection({ initialItems }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter items based on selected category and search query
  const filteredItems = useMemo(() => {
    return initialItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [initialItems, selectedCategory, searchQuery]);

  // Featured items
  const featuredItems = useMemo(() => {
    return initialItems.filter((i) => i.featured);
  }, [initialItems]);

  return (
    <div className="space-y-10">
      {/* Featured Section (if browsing All and no search) */}
      {selectedCategory === "All" && !searchQuery && featuredItems.length > 0 && (
        <section aria-labelledby="featured-dishes-heading" className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="featured-dishes-heading" className="text-xl font-black text-slate-900">
                Chef&apos;s Specials
              </h2>
              <p className="text-xs text-slate-500">
                Handcrafted favorites handpicked by our master culinary team
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredItems.slice(0, 4).map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Main Menu Controls: Search + Categories */}
      <div className="space-y-5 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {selectedCategory === "All" ? "All Culinary Creations" : `${selectedCategory} Specials`}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredItems.length} {filteredItems.length === 1 ? "dish" : "dishes"}
            </p>
          </div>

          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Category Navigation Pills */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* Food Cards Grid or Empty State */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Utensils}
          title="No culinary matches found"
          description={
            searchQuery
              ? `We couldn't find any dishes matching "${searchQuery}" in ${selectedCategory}. Try another keyword or browse all categories.`
              : `There are currently no items available in "${selectedCategory}".`
          }
          actionLabel="Reset Filters"
          onAction={() => {
            setSelectedCategory("All");
            setSearchQuery("");
          }}
        />
      )}
    </div>
  );
}
