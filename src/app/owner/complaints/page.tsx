"use client";

import { useEffect, useState, useCallback } from "react";
import { complaintService } from "@/services/complaint.service";
import {
  ComplaintTicket,
  ComplaintStatus,
} from "@/types/complaint.types";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wrench,
  MessageSquare,
  Building,
  Send,
} from "lucide-react";

export default function OwnerComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);

  // Response & Status Update State
  const [responseText, setResponseText] = useState("");
  const [statusInput, setStatusInput] = useState<ComplaintStatus>("IN_PROGRESS");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadComplaints = useCallback(async () => {
    try {
      const data = await complaintService.getOwnerComplaints("owner-1");
      setComplaints(data);
      setSelectedTicket((prev) => (prev ? data.find((c) => c.id === prev.id) || null : null));
    } catch (err) {
      console.error("Failed to load owner complaints", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleUpdateStatusAndRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setUpdating(true);

    try {
      // If response text provided, add response
      if (responseText.trim()) {
        await complaintService.addComplaintResponse(
          selectedTicket.id,
          "OWNER",
          "Vikram Malhotra (Landlord)",
          responseText
        );
      }

      // Update status & resolution if changed
      await complaintService.updateComplaintStatus(
        selectedTicket.id,
        statusInput,
        statusInput === "RESOLVED" ? resolutionNotes || responseText : undefined,
        "OWNER"
      );

      setResponseText("");
      setResolutionNotes("");
      await loadComplaints();
    } catch (err) {
      console.error("Failed to update complaint", err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">OPEN</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">IN PROGRESS</Badge>;
      case "WAITING_FOR_USER":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">WAITING FOR RESIDENT</Badge>;
      case "RESOLVED":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">RESOLVED</Badge>;
      case "CLOSED":
        return <Badge variant="secondary">CLOSED</Badge>;
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === "ALL") return true;
    return c.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="owner" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-2">
              Landlord Support Portal
            </Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Wrench className="h-7 w-7 text-emerald-400" />
              <span>Tenant Maintenance Complaints</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review, assign technicians, communicate progress, and mark resolution for tenant reported issues.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 no-scrollbar">
          {["ALL", "OPEN", "IN_PROGRESS", "WAITING_FOR_USER", "RESOLVED", "CLOSED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                statusFilter === st
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-md"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Complaints List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Assigned Tickets ({filteredComplaints.length})
            </h3>

            {loading ? (
              <p className="text-xs text-slate-400 py-6 text-center">Loading assigned tickets...</p>
            ) : filteredComplaints.length === 0 ? (
              <Card className="p-6 text-center border-slate-800 bg-slate-900/80 text-xs text-slate-400">
                No tenant tickets reported for this status filter.
              </Card>
            ) : (
              filteredComplaints.map((c) => {
                const isSelected = selectedTicket?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedTicket(c);
                      setStatusInput(c.status);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-emerald-400 font-bold">{c.ticketNumber}</span>
                      {getStatusBadge(c.status)}
                    </div>

                    <h4 className="font-bold text-white text-xs leading-snug">{c.title}</h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      <span>Resident: <strong className="text-white">{c.user.fullName}</strong></span>
                      <span className="text-emerald-400 font-bold">{c.room.roomNumber}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Ticket Detail & Resolution Console */}
          <div className="lg:col-span-2 space-y-4">
            {selectedTicket ? (
              <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-emerald-400 font-bold">{selectedTicket.ticketNumber}</span>
                      {getStatusBadge(selectedTicket.status)}
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-300 border-amber-500/30">
                        {selectedTicket.priority} PRIORITY
                      </Badge>
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedTicket.title}</h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{selectedTicket.property.title} &bull; {selectedTicket.room.roomNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Resident Contact Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[11px]">Reporting Resident</span>
                    <p className="font-bold text-white text-sm">{selectedTicket.user.fullName}</p>
                    <p className="text-slate-400">{selectedTicket.user.phone} &bull; {selectedTicket.user.email}</p>
                  </div>
                  <a href={`tel:${selectedTicket.user.phone}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs text-emerald-400 border-emerald-500/30">
                      Call Resident
                    </Button>
                  </a>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">Issue Description</h4>
                  <p className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Discussion Thread */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-2">
                    Resident & Landlord Discussion Thread ({selectedTicket.responses.length})
                  </h4>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedTicket.responses.map((resp) => {
                      const isOwner = resp.senderRole === "OWNER";
                      return (
                        <div
                          key={resp.id}
                          className={`p-3.5 rounded-2xl text-xs space-y-1 border ${
                            isOwner
                              ? "bg-slate-950 border-emerald-500/30 ml-4"
                              : "bg-slate-800/60 border-slate-700 mr-4"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{resp.senderName} ({resp.senderRole})</span>
                            <span className="text-[10px] text-slate-400">{new Date(resp.createdAt).toLocaleString("en-IN")}</span>
                          </div>
                          <p className="text-slate-300">{resp.message}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resolution & Progress Form */}
                <form onSubmit={handleUpdateStatusAndRespond} className="space-y-4 pt-4 border-t border-slate-800 text-xs">
                  <h4 className="font-bold text-white text-sm">Update Progress & Respond</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Update Ticket Status</label>
                      <select
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value as ComplaintStatus)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS (Technician Dispatched)</option>
                        <option value="WAITING_FOR_USER">WAITING_FOR_USER (Awaiting tenant info)</option>
                        <option value="RESOLVED">RESOLVED (Issue Fixed)</option>
                        <option value="CLOSED">CLOSED (Archived)</option>
                      </select>
                    </div>

                    {statusInput === "RESOLVED" && (
                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold block">Resolution Summary Notes</label>
                        <Input
                          placeholder="e.g. Technician replaced geyser thermostat filter..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="bg-slate-950 border-slate-800 text-white"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Landlord Update / Response Message</label>
                    <textarea
                      rows={3}
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Share progress update or technician arrival time..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updating}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{updating ? "Saving Progress..." : "Update Progress & Send Reply"}</span>
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="border-slate-800 bg-slate-900/90 p-12 text-center space-y-3">
                <MessageSquare className="h-10 w-10 text-slate-600 mx-auto" />
                <h3 className="font-bold text-white text-base">Select a Ticket to Manage</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click on any tenant complaint ticket on the left to review details, communicate progress, or mark resolution.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
