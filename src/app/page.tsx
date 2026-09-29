import React from "react";
import Image from "next/image";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db/mongodb";
import MenuItemModel from "@/models/MenuItem";
import { MenuItem } from "@/types/menu";
import MenuCard from "@/components/menu/MenuCard";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Flame,
  Award,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getFeaturedDishes(): Promise<MenuItem[]> {
  try {
    await connectToDatabase();
    const items = await MenuItemModel.find({ featured: true })
      .limit(6)
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
    console.error("Failed to load featured dishes:", error);
    return [];
  }
}

export default async function HomePage() {
  const featuredDishes = await getFeaturedDishes();

  const categories = [
    { name: "Pizza", icon: "🍕", desc: "Hand-stretched sourdough pizzas" },
    { name: "Burgers", icon: "🍔", desc: "Artisan patties & toasted brioche" },
    { name: "Pasta", icon: "🍝", desc: "Silky alfredo & spicy arrabbiata" },
    { name: "Starters", icon: "🍟", desc: "Crispy fries & juicy poppers" },
    { name: "Indian", icon: "🍛", desc: "Tandoori tikkas & slow-dum biryani" },
    { name: "Beverages", icon: "🥤", desc: "Cold brews & freshly blended coolers" },
    { name: "Desserts", icon: "🍰", desc: "Molten brownies & cheesecakes" },
  ];

  const whyChooseUs = [
    {
      title: "Fresh, Sourced Ingredients",
      description: "We partner with responsible growers to bring farm-fresh produce and artisanal dairy straight into our kitchen.",
      icon: Flame,
    },
    {
      title: "Fast & Precise Preparation",
      description: "Optimized line operations ensure your meal is prepared hot and packed in tamper-evident containers within 15–20 mins.",
      icon: Clock,
    },
    {
      title: "Uncompromising Hygiene",
      description: "Our kitchen follows strict 5-star sanitization standards and contactless prep procedures for your absolute safety.",
      icon: ShieldCheck,
    },
    {
      title: "Handcrafted Recipes",
      description: "Every sauce, marinade, and dough is crafted from scratch by passionate culinary artists who obsess over flavor.",
      icon: Award,
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-amber-50/30 to-transparent pt-12 sm:pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Welcome to MyKit Culinary Kitchen</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Good Food. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                  Your Way.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Indulge in artisanal pizzas, flame-grilled burgers, authentic tikkas, and handcrafted desserts.
                Made with honest ingredients, served with perfection.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/menu">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-xl shadow-orange-600/25 px-8 text-base font-bold">
                    <span>Explore Menu</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 text-base">
                    View Shopping Cart
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0 text-left">
                <div>
                  <p className="text-2xl font-black text-slate-900">28+</p>
                  <p className="text-[11px] font-semibold text-slate-500">Chef Specials</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">4.8★</p>
                  <p className="text-[11px] font-semibold text-slate-500">Average Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">20m</p>
                  <p className="text-[11px] font-semibold text-slate-500">Avg Prep Time</p>
                </div>
              </div>
            </div>

            {/* Right Food Visual Hero Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85"
                  alt="Delicious MyKit pizza fresh from woodfired oven"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Dish Highlights */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white/50 text-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                        Trending Today
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">Paneer Tikka Supreme</h4>
                      <p className="text-xs text-slate-500 font-semibold">₹349 • 20-25 mins</p>
                    </div>
                    <Link href="/menu">
                      <span className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs hover:bg-orange-700 transition">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Restaurant Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-3">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              About MyKit
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Culinary Passion Meets Seamless Digital Convenience
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              At MyKit, we believe dining should be an unforgettable ritual. Whether you crave a crisp
              hand-tossed Margherita pizza after a busy day, a rich creamy Alfredo penne with friends,
              or slow-cooked Dal Makhani with warm butter naan, we curate every plate with precision, love,
              and supreme cleanliness.
            </p>
          </div>
          <div className="md:col-span-4 flex justify-start md:justify-end">
            <Link href="/menu">
              <Button variant="secondary" size="lg" className="font-bold text-slate-900">
                Discover The Story &amp; Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Browse By Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Explore Categories
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Something Special For Every Craving
          </h2>
          <p className="text-xs text-slate-500">
            Select a category to jump directly to our signature selections.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href="/menu"
              className="group p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-orange-300 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center space-y-2"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[10px] text-slate-400 line-clamp-2">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Chef's Dishes */}
      {featuredDishes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Signature Picks
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Featured Culinary Creations
              </h2>
              <p className="text-xs text-slate-500">
                The most loved recipes favored by our regular patrons.
              </p>
            </div>
            <Link
              href="/menu"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View complete menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDishes.map((dish) => (
              <MenuCard key={dish._id} item={dish} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Why Choose MyKit */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
            Our Quality Commitment
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Why Food Lovers Choose MyKit
          </h2>
          <p className="text-xs text-slate-500">
            We hold ourselves to elevated kitchen standards so you enjoy peace of mind with every bite.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseUs.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Bottom Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950 rounded-3xl p-8 sm:p-14 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              Hungry Right Now?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Order Your Favorite Dishes In Under 2 Minutes.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Explore our full menu, customize your order, and watch live status updates
              directly from our kitchen to your door.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link href="/menu">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-orange-600/30 px-8 font-bold">
                Order Food Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
