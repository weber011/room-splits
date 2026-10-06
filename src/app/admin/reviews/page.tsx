"use client";

import { useState, useEffect } from "react";
import { adminService, AdminReviewRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star, Flag, Trash2, CheckCircle2 } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewRecord[]>([]);

  const loadReviews = async () => {
    const data = await adminService.getReviews();
    setReviews(data);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerate = async (id: string, action: "approve" | "flag" | "remove") => {
    await adminService.moderateReview(id, action);
    loadReviews();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Content Moderation</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Resident Reviews & Moderation</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Audit resident rating scores, flag inappropriate content, and enforce platform feedback guidelines.</p>
          </div>
        </div>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <Card key={rev.id} className="border-slate-800 bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span>{rev.rating} / 5.0</span>
                  </div>
                  <Badge variant={rev.status === "approved" ? "accent" : rev.status === "flagged" ? "warning" : "danger"} className="uppercase text-[9px]">
                    {rev.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-200 italic font-serif">&ldquo;{rev.comment}&rdquo;</p>
                <p className="text-[11px] text-slate-400">By: <strong className="text-white">{rev.tenantName}</strong> • {rev.propertyTitle} ({rev.createdAt})</p>
              </div>

              <div className="flex items-center gap-2">
                {rev.status !== "approved" && (
                  <Button size="sm" variant="default" onClick={() => handleModerate(rev.id, "approve")} className="gap-1 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                )}
                {rev.status !== "flagged" && (
                  <Button size="sm" variant="outline" onClick={() => handleModerate(rev.id, "flag")} className="gap-1 text-xs text-amber-400">
                    <Flag className="h-3.5 w-3.5" />
                    Flag
                  </Button>
                )}
                {rev.status !== "removed" && (
                  <Button size="sm" variant="danger" onClick={() => handleModerate(rev.id, "remove")} className="gap-1 text-xs">
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
