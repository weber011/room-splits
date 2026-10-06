"use client";

import { useEffect, useState, useCallback } from "react";
import { complaintService } from "@/services/complaint.service";
import {
  ComplaintTicket,
  ComplaintStatus,
  ComplaintPriority,
} from "@/types/complaint.types";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  Building,
  MessageSquare,
  Send,
} from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);

  // Intervention state
  const [adminResponse, setAdminResponse] = useState("");
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus>("IN_PROGRESS");
  const [targetPriority, setTargetPriority] = useState<ComplaintPriority>("URGENT");
  const [submitting, setSubmitting] = useState(false);

  const loadComplaints = useCallback(async () => {
    try {
      const data = await complaintService.getAdminComplaints();
      setComplaints(data);
      setSelectedTicket((prev) => (prev ? data.find((c) => c.id === prev.id) || null : null));
    } catch (err) {
      console.error("Failed to load admin complaints", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleAdminIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSubmitting(true);

    try {
      // 1. If priority changed, escalate priority
      if (targetPriority !== selectedTicket.priority) {
        await complaintService.escalateComplaintPriority(selectedTicket.id, targetPriority);
      }

      // 2. If response text provided, add admin directive
      if (adminResponse.trim()) {
        await complaintService.addComplaintResponse(
          selectedTicket.id,
          "ADMIN",
          "Platform Support Escalations",
          adminResponse
        );
      }

      // 3. Update status
      await complaintService.updateComplaintStatus(
        selectedTicket.id,
        targetStatus,
        targetStatus === "RESOLVED" ? "Resolved via Admin platform intervention." : undefined,
        "ADMIN"
      );

      setAdminResponse("");
      await loadComplaints();
    } catch (err) {
      console.error("Admin intervention error", err);
    } finally {
      setSubmitting(false);
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

  const getPriorityBadge = (p: ComplaintPriority) => {
    switch (p) {
      case "URGENT":
        return <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px]">URGENT</Badge>;
      case "HIGH":
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">HIGH</Badge>;
      case "MEDIUM":
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px]">MEDIUM</Badge>;
      case "LOW":
        return <Badge variant="outline" className="text-[10px]">LOW</Badge>;
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && c.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 mb-2">
              Admin Platform Desk
            </Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-7 w-7 text-rose-400" />
              <span>Master Complaint Audit & Escalations</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              System-wide oversight of tenant complaints, landlord response speed, priority escalation, and dispute resolution.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800/80 pb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING_FOR_USER">WAITING_FOR_USER</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold"
            >
              <option value="ALL">ALL PRIORITIES</option>
              <option value="URGENT">URGENT</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Tickets */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              System Tickets ({filteredComplaints.length})
            </h3>

            {loading ? (
              <p className="text-xs text-slate-400 py-6 text-center">Loading system complaints...</p>
            ) : filteredComplaints.length === 0 ? (
              <Card className="p-6 text-center border-slate-800 bg-slate-900/80 text-xs text-slate-400">
                No complaint tickets matched the selected audit filter.
              </Card>
            ) : (
              filteredComplaints.map((c) => {
                const isSelected = selectedTicket?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedTicket(c);
                      setTargetStatus(c.status);
                      setTargetPriority(c.priority);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? "bg-slate-900 border-rose-500/50 shadow-lg shadow-rose-500/5"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-rose-400 font-bold">{c.ticketNumber}</span>
                      <div className="flex items-center gap-1">
                        {getPriorityBadge(c.priority)}
                        {getStatusBadge(c.status)}
                      </div>
                    </div>

                    <h4 className="font-bold text-white text-xs leading-snug">{c.title}</h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      <span>{c.property.title}</span>
                      <span className="text-rose-400 font-bold">{c.room.roomNumber}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Admin Intervention & Audit Console */}
          <div className="lg:col-span-2 space-y-4">
            {selectedTicket ? (
              <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-rose-400 font-bold">{selectedTicket.ticketNumber}</span>
                      {getPriorityBadge(selectedTicket.priority)}
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedTicket.title}</h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{selectedTicket.property.title} &bull; {selectedTicket.room.roomNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Parties Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px] block font-semibold">Tenant / Student</span>
                    <p className="font-bold text-white">{selectedTicket.user.fullName}</p>
                    <p className="text-slate-400">{selectedTicket.user.phone}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px] block font-semibold">Property Landlord</span>
                    <p className="font-bold text-emerald-400">{selectedTicket.owner.name}</p>
                    <p className="text-slate-400">{selectedTicket.owner.phone}</p>
                  </div>
                </div>

                {/* Issue Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase">Complaint Description</h4>
                  <p className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Thread History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white border-b border-slate-800 pb-2">
                    Complete Audit Timeline ({selectedTicket.responses.length} Messages)
                  </h4>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedTicket.responses.map((resp) => {
                      const isAdmin = resp.senderRole === "ADMIN";
                      const isOwner = resp.senderRole === "OWNER";
                      return (
                        <div
                          key={resp.id}
                          className={`p-3.5 rounded-2xl text-xs space-y-1 border ${
                            isAdmin
                              ? "bg-rose-500/10 border-rose-500/30 font-semibold"
                              : isOwner
                              ? "bg-slate-950 border-amber-500/30"
                              : "bg-slate-800/60 border-slate-700"
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

                {/* Admin Intervention Console */}
                <form onSubmit={handleAdminIntervention} className="space-y-4 pt-4 border-t border-slate-800 text-xs">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                    Admin Platform Intervention & Escalation
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Set Priority Level</label>
                      <select
                        value={targetPriority}
                        onChange={(e) => setTargetPriority(e.target.value as ComplaintPriority)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT (Admin Escalation)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-semibold block">Set Status</label>
                      <select
                        value={targetStatus}
                        onChange={(e) => setTargetStatus(e.target.value as ComplaintStatus)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="WAITING_FOR_USER">WAITING_FOR_USER</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Official Admin Platform Response Directive</label>
                    <textarea
                      rows={3}
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Issue platform directive or notice to landlord and resident..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    size="sm"
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{submitting ? "Executing Intervention..." : "Execute Admin Intervention"}</span>
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="border-slate-800 bg-slate-900/90 p-12 text-center space-y-3">
                <MessageSquare className="h-10 w-10 text-slate-600 mx-auto" />
                <h3 className="font-bold text-white text-base">Select a Complaint Ticket to Inspect</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click on any system ticket on the left to audit investigation timeline, escalate priority, or issue admin platform directives.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
