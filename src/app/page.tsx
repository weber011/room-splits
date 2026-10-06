"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { propertyService } from "@/services/property.service";
import { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocationSelector, SearchBar, PropertyCard, CompareFloatingBar } from "@/components/common";
import {
  Building2,
  Users,
  Sparkles,
  KeyRound,
  Clock,
  ArrowRight,
} from "lucide-react";

const POPULAR_LOCATIONS = [
  { city: "Bengaluru", locality: "HSR Layout", count: "120+ PGs", tag: "Tech Hub" },
  { city: "Bengaluru", locality: "Koramangala", count: "95+ PGs", tag: "Student Fav" },
  { city: "Hyderabad", locality: "Gachibowli", count: "80+ Hostels", tag: "IT Corridor" },
  { city: "Pune", locality: "Hinjewadi", count: "75+ Co-Living", tag: "Phase 1 & 2" },
  { city: "Delhi NCR", locality: "Gurugram Cyber City", count: "110+ Stays", tag: "Corporate" },
  { city: "Chennai", locality: "OMR Road", count: "60+ PGs", tag: "Near Colleges" },
];

const PROPERTY_CATEGORIES = [
  {
    id: "pg",
    name: "Paying Guest (PG)",
    count: "240+ Locations",
    description: "Fully furnished rooms with food, wifi & housekeeping included.",
    icon: Building2,
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    id: "hostel",
    name: "Student Hostels",
    count: "150+ Hostels",
    description: "Budget-friendly, secure accommodations near major universities.",
    icon: Users,
    gradient: "from-indigo-500/20 to-purple-500/10",
  },
  {
    id: "coliving",
    name: "Premium Co-Living",
    count: "90+ Hubs",
    description: "Modern vibrant living with gaming zones, community events & gyms.",
    icon: Sparkles,
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  {
    id: "flats",
    name: "Shared Flat Rooms",
    count: "180+ Private Rooms",
    description: "Private bedroom in 2/3 BHK apartments with like-minded roommates.",
    icon: KeyRound,
    gradient: "from-amber-500/20 to-orange-500/10",
  },
];

export default function LandingPage() {
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function loadData() {
      const [featured, recommended] = await Promise.all([
        propertyService.getFeaturedProperties(),
        propertyService.getRecommendedProperties(),
      ]);
      setFeaturedProperties(featured);
      setRecommendedProperties(recommended);
      setRecentlyViewed(recommended.slice(0, 2));
    }
    loadData();
  }, []);

  const handleToggleCompare = (property: Property) => {
    setComparedProperties((prev) => {
      const exists = prev.some((p) => p.id === property.id);
      if (exists) {
        return prev.filter((p) => p.id !== property.id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 properties at a time.");
        return prev;
      }
      return [...prev, property];
    });
  };

  const handleRemoveCompare = (id: string) => {
    setComparedProperties((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100 min-h-screen pb-16">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-glow pointer-events-none opacity-80" />

      {/* Hero Section */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-400 backdrop-blur-md shadow-lg shadow-emerald-500/10">
            <Sparkles className="h-4 w-4" />
            <span>Next-Gen PG & Rental Discovery Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Find Verified PGs & Hostels With <br className="hidden sm:inline" />
            <span className="text-gradient">Zero Brokerage & Hassle</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Discover fully-furnished PG rooms, schedule physical visits in 1 click, complete digital lease agreements, and manage your monthly rent effortlessly.
          </p>

          {/* Search & Location Bar */}
          <div className="pt-4 max-w-3xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <LocationSelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
              <SearchBar placeholder={`Search locality in ${selectedCity}...`} />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Locations in India */}
      <section className="py-12 bg-slate-900/30 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge variant="default" className="mb-2">Top Destinations</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Popular Locations across India</h2>
            </div>
            <Link href="/discover" className="text-xs text-emerald-400 font-semibold hover:underline hidden sm:inline-flex items-center gap-1">
              <span>View all cities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_LOCATIONS.map((loc, idx) => (
              <Link key={idx} href={`/discover?city=${loc.city}&locality=${loc.locality}`}>
                <Card className="p-4 bg-slate-900/80 border-slate-800 hover:border-emerald-500/40 hover:scale-[1.02] transition-all cursor-pointer space-y-2 text-left">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    {loc.tag}
                  </span>
                  <h4 className="font-bold text-sm text-white">{loc.locality}</h4>
                  <p className="text-xs text-slate-400">{loc.city}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">{loc.count}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section id="properties" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <Badge variant="default" className="mb-2">Categories</Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Explore Stay Options Fits Your Lifestyle
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROPERTY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.id} href={`/discover?category=${cat.id}`}>
                <Card className="group relative overflow-hidden hover:scale-[1.02] transition-all duration-300 border-slate-800 hover:border-emerald-500/40 cursor-pointer h-full">
                  <CardHeader className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="w-fit text-[11px]">
                      {cat.count}
                    </Badge>
                    <CardTitle className="text-xl group-hover:text-emerald-400 transition-colors">
                      {cat.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 leading-relaxed">
                      {cat.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between">
            <div>
              <Badge variant="default" className="mb-2">Featured</Badge>
              <h2 className="text-3xl font-bold text-white">Featured Verified Properties</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Handpicked PGs audited for safety, food quality, and high-speed Wi-Fi.</p>
            </div>
            <Link href="/discover" className="mt-4 sm:mt-0">
              <Button variant="outline" size="sm" className="gap-1.5">
                Explore All PGs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onToggleCompare={handleToggleCompare}
                isCompared={comparedProperties.some((p) => p.id === prop.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recommended & Recently Viewed Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div>
          <div className="mb-8">
            <Badge variant="accent" className="mb-2">Top Rated</Badge>
            <h2 className="text-3xl font-bold text-white">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onToggleCompare={handleToggleCompare}
                isCompared={comparedProperties.some((p) => p.id === prop.id)}
              />
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="pt-8 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-6 text-slate-300 font-semibold text-base">
              <Clock className="h-5 w-5 text-emerald-400" />
              <span>Recently Viewed Stays</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recentlyViewed.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onToggleCompare={handleToggleCompare}
                  isCompared={comparedProperties.some((p) => p.id === prop.id)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Floating Compare Bar */}
      <CompareFloatingBar
        comparedProperties={comparedProperties}
        onRemove={handleRemoveCompare}
        onClear={() => setComparedProperties([])}
      />
    </div>
  );
}
