import * as React from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { RatingDisplay } from "./RatingDisplay";
import { VerifiedBadge } from "./VerifiedBadge";
import { User } from "lucide-react";
import { PropertyReview } from "@/types";

export interface ReviewCardProps {
  review: PropertyReview;
  className?: string;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <Card className={`border-slate-800 bg-slate-900/90 p-5 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 overflow-hidden">
            {review.tenantAvatar ? (
              <Image src={review.tenantAvatar} alt={review.tenantName} fill className="object-cover" />
            ) : (
              <User className="h-4 w-4 text-emerald-400" />
            )}
          </div>
          <div>
            <h5 className="font-semibold text-white text-sm">{review.tenantName}</h5>
            {review.isVerifiedResident && <VerifiedBadge type="resident" />}
          </div>
        </div>
        <RatingDisplay rating={review.rating} />
      </div>

      <p className="text-xs text-slate-300 leading-relaxed italic">
        &ldquo;{review.comment}&rdquo;
      </p>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
        <span>Food: {review.foodRating}/5 | Hygiene: {review.cleanlinessRating}/5</span>
        <span>{review.createdAt}</span>
      </div>
    </Card>
  );
}
