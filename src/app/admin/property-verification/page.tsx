"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminService, AdminPropertyRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, X, Eye } from "lucide-react";

export default function AdminPropertyVerificationQueuePage() {
  const [pendingProps, setPendingProps] = useState<AdminPropertyRecord[]>([]);

  const loadPending = async () => {
    const data = await adminService.getProperties();
    setPendingProps(data.filter((p) => p.verificationStatus === "PENDING_VERIFICATION" || p.verificationStatus === "DRAFT"));
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    await adminService.approveProperty(id);
    loadPending();
    alert("Property approved & Verified badge issued!");
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter audit rejection feedback:");
    if (reason) {
      await adminService.rejectProperty(id, reason);
      loadPending();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Verification Queue</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Property Audit & Verification Queue</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Review photos, owner details, address accuracy, and issue official RoomSplits Verified Badges.</p>
          </div>
        </div>

        <div className="space-y-4">
          {pendingProps.length === 0 ? (
            <Card className="p-8 text-center border-slate-800 text-slate-400 text-sm">
              All property verification requests have been audited!
            </Card>
          ) : (
            pendingProps.map((prop) => (
              <Card key={prop.id} className="border-slate-800 bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-24 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={prop.images[0]} alt="cover" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white">{prop.title}</h4>
                      <Badge variant="warning" className="uppercase text-[9px]">{prop.verificationStatus}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">Owner: {prop.ownerName} • {prop.city} ({prop.category})</p>
                    <p className="text-xs text-emerald-400 font-bold mt-1">Starting Rent: ₹{prop.startingPrice}/mo</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/property/${prop.id}`}>
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <Eye className="h-3.5 w-3.5" />
                      Inspect Listing
                    </Button>
                  </Link>

                  <Button size="sm" variant="default" onClick={() => handleApprove(prop.id)} className="gap-1 text-xs">
                    <Check className="h-3.5 w-3.5" />
                    Approve Badge
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => handleReject(prop.id)} className="gap-1 text-xs text-rose-400">
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
