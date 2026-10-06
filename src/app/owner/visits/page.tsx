"use client";

import { useState, useEffect } from "react";
import { visitService } from "@/services/visit.service";
import { VisitPass } from "@/types/visit.types";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, X, Phone, Clock, Calendar, Ticket, CalendarDays, CheckCircle2, User } from "lucide-react";

export default function OwnerVisitsPage() {
  const [visits, setVisits] = useState<VisitPass[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Modal for Propose Another Time
  const [proposeVisitId, setProposeVisitId] = useState<string | null>(null);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("Evening (05:00 PM - 07:00 PM)");

  const loadVisits = async () => {
    setLoading(true);
    try {
      const data = await visitService.getOwnerVisits("owner-1");
      setVisits(data);
    } catch (err) {
      console.error("Failed to load owner visits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const handleAccept = async (visitId: string) => {
    await visitService.ownerAcceptVisit(visitId);
    loadVisits();
  };

  const handleReject = async (visitId: string) => {
    await visitService.ownerRejectVisit(visitId, "Owner busy / Not available");
    loadVisits();
  };

  const handleMarkCompleted = async (visitId: string) => {
    await visitService.ownerMarkCompleted(visitId);
    loadVisits();
  };

  const handleConfirmProposeTime = async () => {
    if (!proposeVisitId || !proposedDate) return;
    await visitService.ownerProposeTime(proposeVisitId, proposedDate, proposedTime);
    setProposeVisitId(null);
    loadVisits();
  };

  const filteredVisits = visits.filter((v) => {
    if (filter === "ALL") return true;
    if (filter === "REQUESTED") return v.status === "REQUESTED" || v.status === "PAYMENT_PENDING";
    if (filter === "CONFIRMED") return v.status === "CONFIRMED" || v.status === "RESCHEDULED";
    if (filter === "COMPLETED") return v.status === "COMPLETED";
    if (filter === "CANCELLED") return v.status === "CANCELLED";
    return v.status === filter;
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="owner" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="accent" className="mb-2">Physical Tours</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Ticket className="h-7 w-7 text-emerald-400" />
              <span>Incoming Visit Requests</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review student visit pass appointments, accept tours, or propose alternative date/time slots.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={filter === st ? "default" : "outline"}
              onClick={() => setFilter(st)}
              className="capitalize text-[10px]"
            >
              {st}
            </Button>
          ))}
        </div>

        {/* Visits List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            <p className="text-sm text-slate-400">Loading visit requests...</p>
          </div>
        ) : filteredVisits.length === 0 ? (
          <Card className="p-12 text-center border-slate-800 bg-slate-900/50 text-slate-400 text-sm">
            No visit requests found for this filter tab.
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVisits.map((v) => (
              <Card key={v.id} className="border-slate-800 bg-slate-900/80 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-emerald-400" />
                      <h4 className="font-bold text-base text-white">{v.user?.fullName || "Student User"}</h4>
                      {getStatusBadge(v.status)}
                      <Badge variant="outline" className="text-[10px]">
                        Payment: {v.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold">{v.property?.title || "Property"}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="flex items-center gap-1 text-white font-medium">
                      <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                      {v.preferredDate}
                    </span>
                    <span className="flex items-center gap-1 text-white font-medium">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      {v.preferredTime}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-emerald-400">
                      <Phone className="h-3.5 w-3.5" />
                      {v.user?.phone || "+91 98765 43210"}
                    </span>
                    <span className="text-slate-400">Visit Fee: ₹{v.visitPassAmount}</span>
                  </div>

                  {/* Owner Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(v.status === "REQUESTED" || v.status === "PAYMENT_PENDING" || v.status === "RESCHEDULED") && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(v.id)}
                          className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Accept Visit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setProposeVisitId(v.id);
                            setProposedDate(v.preferredDate);
                          }}
                          className="gap-1.5 text-xs text-slate-200"
                        >
                          <CalendarDays className="h-3.5 w-3.5 text-purple-400" />
                          Propose Another Time
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(v.id)}
                          className="gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </>
                    )}

                    {v.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkCompleted(v.id)}
                        className="gap-1.5 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal for Propose Another Time */}
        {proposeVisitId && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="border-slate-800 bg-slate-900 p-6 space-y-4 max-w-md w-full">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-purple-400" />
                <span>Propose Alternative Visit Time</span>
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">Proposed Date</label>
                  <input
                    type="date"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-semibold">Proposed Time Slot</label>
                  <select
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 outline-none"
                  >
                    <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (02:00 PM - 04:00 PM)">Afternoon (02:00 PM - 04:00 PM)</option>
                    <option value="Evening (05:00 PM - 07:00 PM)">Evening (05:00 PM - 07:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button variant="ghost" size="sm" onClick={() => setProposeVisitId(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleConfirmProposeTime} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                  Send Proposal
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
