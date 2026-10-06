"use client";

import { useState, useEffect } from "react";
import { ownerService, OwnerReviewRecord } from "@/services/owner.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { ReviewCard } from "@/components/common/ReviewCard";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<OwnerReviewRecord[]>([]);

  useEffect(() => {
    async function load() {
      const data = await ownerService.getReviews();
      setReviews(data);
    }
    load();
  }, []);

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="owner" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="accent" className="mb-2">Resident Reputation</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Resident Reviews & Feedback</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Verified resident feedback regarding cleanliness, food quality, WiFi, and value.</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <div>
              <span className="text-xs text-slate-400 block">Average Rating</span>
              <strong className="text-lg font-bold text-white">{avgRating.toFixed(1)} / 5.0</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={{
                id: rev.id,
                propertyId: "prop-1",
                tenantId: "t-1",
                tenantName: rev.tenantName,
                rating: rev.rating,
                cleanlinessRating: rev.cleanlinessRating,
                foodRating: rev.foodRating,
                amenitiesRating: rev.amenitiesRating,
                valueForMoneyRating: rev.valueRating,
                comment: rev.comment,
                isVerifiedResident: true,
                createdAt: rev.createdAt,
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
