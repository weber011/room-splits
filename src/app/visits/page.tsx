"use client";

import { useEffect, useState } from "react";
import { visitService } from "@/services/visit.service";
import { VisitPass } from "@/types/visit.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Calendar, Clock, MapPin, ArrowRight, Plus, RefreshCw, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StudentVisitsPage() {
  const [visits, setVisits] = useState<VisitPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "CONFIRMED" | "PENDING" | "PAST">("ALL");

  const loadVisits = async () => {
    setLoading(true);
    try {
      // Load student visits (mock user "u-101")
      const data = await visitService.getUserVisits("u-101");
      setVisits(data);
    } catch (err) {
      console.error("Failed to load user visits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const filteredVisits = visits.filter((v) => {
    if (activeTab === "CONFIRMED") return v.status === "CONFIRMED" || v.status === "RESCHEDULED";
    if (activeTab === "PENDING") return v.status === "PAYMENT_PENDING" || v.paymentStatus === "PENDING";
    if (activeTab === "PAST") return v.status === "COMPLETED" || v.status === "CANCELLED" || v.status === "EXPIRED";
    return true;
  });

  const getStatusBadge = (status: VisitPass["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">CONFIRMED</Badge>;
      case "PAYMENT_PENDING":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">PAYMENT PENDING</Badge>;
      case "REQUESTED":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">REQUESTED</Badge>;
      case "RESCHEDULED":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">RESCHEDULED</Badge>;
      case "COMPLETED":
        return <Badge className="bg-slate-700 text-slate-300">COMPLETED</Badge>;
      case "CANCELLED":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Ticket className="h-8 w-8 text-emerald-400" />
            <span>My Visit Passes & Tickets</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage scheduled property tours, access verified digital tickets, and view visit history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={loadVisits} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4 text-emerald-400" />
            Refresh
          </Button>
          <Link href="/discover">
            <Button size="sm" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
              <Plus className="h-4 w-4" />
              Schedule New Visit
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {(["ALL", "CONFIRMED", "PENDING", "PAST"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            {tab === "ALL" && `All Visits (${visits.length})`}
            {tab === "CONFIRMED" && `Active & Confirmed (${visits.filter((v) => v.status === "CONFIRMED" || v.status === "RESCHEDULED").length})`}
            {tab === "PENDING" && `Pending Payment (${visits.filter((v) => v.paymentStatus === "PENDING").length})`}
            {tab === "PAST" && `Past & Cancelled (${visits.filter((v) => v.status === "COMPLETED" || v.status === "CANCELLED").length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading visit passes...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 p-12 text-center space-y-4 max-w-md mx-auto">
          <Ticket className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Visit Passes Found</h3>
          <p className="text-xs text-slate-400">You do not have any visit passes matching the selected filter tab.</p>
          <Link href="/discover">
            <Button size="sm">Explore PG & Hostels</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVisits.map((pass) => (
            <Card key={pass.id} className="border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-colors">
              {/* Card Top */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-16 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      <Image
                        src={pass.property?.coverImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"}
                        alt={pass.property?.title || "Property"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-1">{pass.property?.title || "Property"}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{pass.property?.locality || "Locality"}, {pass.property?.city || "City"}</span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(pass.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                      <Calendar className="h-3 w-3 text-emerald-400" /> Date
                    </span>
                    <strong className="text-white block text-xs">{pass.preferredDate}</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                      <Clock className="h-3 w-3 text-emerald-400" /> Time Slot
                    </span>
                    <strong className="text-white block text-xs truncate">{pass.preferredTime}</strong>
                  </div>
                </div>

                {pass.paymentStatus === "PENDING" && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                    <span className="text-amber-300">Visit Pass Token Unpaid</span>
                    <strong className="text-amber-400 font-bold">₹{pass.visitPassAmount}</strong>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="bg-slate-950/80 p-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400">Token: #{pass.id.slice(-6).toUpperCase()}</span>

                <div className="flex items-center gap-2">
                  {pass.paymentStatus === "PENDING" ? (
                    <Link href={`/visits/checkout/${pass.id}`}>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay Pass (₹{pass.visitPassAmount})
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/visits/${pass.id}`}>
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5">
                        <Ticket className="h-3.5 w-3.5" />
                        View Pass Ticket
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
