import React from "react";
import { Metadata } from "next";
import { connectToDatabase } from "@/lib/db/mongodb";
import MenuItemModel from "@/models/MenuItem";
import { MenuItem } from "@/types/menu";
import MenuSection from "@/components/menu/MenuSection";
import { Clock, MapPin, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Menu — MyKit",
  description: "Browse our chef-crafted menu featuring artisanal pizzas, gourmet burgers, fresh pastas, and authentic Indian delicacies.",
};

export const dynamic = "force-dynamic";

async function getMenuItems(): Promise<MenuItem[]> {
  try {
    await connectToDatabase();
    const items = await MenuItemModel.find()
      .sort({ featured: -1, rating: -1, createdAt: -1 })
      .lean();

    return items.map((item) => ({
      _id: item._id.toString(),
      name: item.name,
      slug: item.slug,
      description: item.description,
      category: item.category,
      price: item.price,
      image: item.image,
      available: item.available,
      featured: item.featured,
      preparationTime: item.preparationTime,
      rating: item.rating,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
    }));
  } catch (error) {
    console.error("Failed to load menu items in server component:", error);
    return [];
  }
}

export default async function MenuPage() {
  const items = await getMenuItems();

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Restaurant Header Banner */}
        <section aria-labelledby="restaurant-info-heading" className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-orange-600/10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gourmet Kitchen & Dining</span>
            </div>
            <h1 id="restaurant-info-heading" className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Our Culinary Menu
            </h1>
            <p className="text-orange-100 text-sm sm:text-base leading-relaxed">
              Every dish is freshly prepared to order with hand-selected ingredients,
              authentic spices, and uncompromised culinary passion.
            </p>

            {/* Quick Restaurant Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/20 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-200 shrink-0" />
                <span>Open: 11:00 AM – 11:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-200 shrink-0" />
                <span>Indiranagar, Bengaluru</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-200 shrink-0" />
                <span>100% Contactless &amp; Hygienic</span>
              </div>
            </div>
          </div>
        </section>

        {/* Client Interactive Menu Section */}
        <MenuSection initialItems={items} />
      </div>
    </div>
  );
}
