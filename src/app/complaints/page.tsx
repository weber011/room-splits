"use client";

import { useEffect, useState, useCallback } from "react";
import { complaintService } from "@/services/complaint.service";
import {
  ComplaintTicket,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from "@/types/complaint.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wrench,
  Plus,
  MessageSquare,
  CheckCircle2,
  Send,
  Building,
  CheckCheck,
} from "lucide-react";
import Image from "next/image";

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintTicket | null>(null);

  // New Complaint Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [category, setCategory] = useState<ComplaintCategory>("MAINTENANCE");
  const [priority, setPriority] = useState<ComplaintPriority>("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reply Thread state
  const [replyText, setReplyText] = useState("");
  const [replyAttachment, setReplyAttachment] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const loadComplaints = useCallback(async () => {
    try {
      const data = await complaintService.getStudentComplaints("u-101");
      setComplaints(data);
      setSelectedComplaint((prev) => (prev ? data.find((c) => c.id === prev.id) || null : null));
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);

    try {
      const created = await complaintService.createComplaint({
        userId: "u-101",
        stayId: "stay-8001",
        category,
        priority,
        title,
        description,
        attachments: attachmentUrl ? [attachmentUrl] : [],
      });
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setAttachmentUrl("");
      await loadComplaints();
      setSelectedComplaint(created);
    } catch (err) {
      console.error("Failed to create complaint", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !replyText.trim()) return;
    setSendingReply(true);

    try {
      await complaintService.addComplaintResponse(
        selectedComplaint.id,
        "STUDENT",
        "Aditya Kumar",
        replyText,
        replyAttachment ? [replyAttachment] : undefined
      );
      setReplyText("");
      setReplyAttachment("");
      await loadComplaints();
    } catch (err) {
      console.error("Failed to add response", err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async (complaintId: string) => {
    try {
      await complaintService.updateComplaintStatus(complaintId, "CLOSED", "Closed by tenant after satisfaction.", "STUDENT");
      await loadComplaints();
    } catch (err) {
      console.error("Failed to close ticket", err);
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case "OPEN":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">OPEN</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">IN PROGRESS</Badge>;
      case "WAITING_FOR_USER":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">WAITING FOR YOUR RESPONSE</Badge>;
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
    if (statusFilter === "ALL") return true;
    return c.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading Student Helpdesk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-2">24/7 Residency Helpdesk</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="h-8 w-8 text-emerald-400" />
            <span>Support & Maintenance Tickets</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Report issues regarding Wi-Fi, electricity, plumbing, cleanliness, or security for your active stay.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-2 text-xs sm:text-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Lodge Complaint Ticket</span>
        </Button>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Tickets List */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            My Complaint Tickets ({filteredComplaints.length})
          </h3>

          {filteredComplaints.length === 0 ? (
            <Card className="p-6 text-center border-slate-800 bg-slate-900/80 text-xs text-slate-400">
              No complaint tickets found for this filter.
            </Card>
          ) : (
            filteredComplaints.map((c) => {
              const isSelected = selectedComplaint?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaint(c)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? "bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-emerald-400 font-bold">{c.ticketNumber}</span>
                    <div className="flex items-center gap-1.5">
                      {getPriorityBadge(c.priority)}
                      {getStatusBadge(c.status)}
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-xs leading-snug line-clamp-2">{c.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="uppercase text-emerald-400 font-semibold">{c.category}</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-slate-400" />
                      {c.responses.length} Replies
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Ticket Thread & Conversation Details */}
        <div className="md:col-span-2 space-y-4">
          {selectedComplaint ? (
            <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-6">
              {/* Ticket Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-emerald-400 font-bold">{selectedComplaint.ticketNumber}</span>
                    {getPriorityBadge(selectedComplaint.priority)}
                    {getStatusBadge(selectedComplaint.status)}
                  </div>
                  <h2 className="text-xl font-bold text-white leading-tight">{selectedComplaint.title}</h2>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{selectedComplaint.property.title} &bull; {selectedComplaint.room.roomNumber}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedComplaint.status !== "CLOSED" && (
                    <Button
                      onClick={() => handleCloseTicket(selectedComplaint.id)}
                      size="sm"
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                    >
                      <CheckCheck className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                      Close Ticket
                    </Button>
                  )}
                </div>
              </div>

              {/* Category & Resolution Banner */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[11px] block">Category</span>
                  <strong className="text-white font-semibold">{selectedComplaint.category}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Reported Landlord</span>
                  <strong className="text-white font-semibold">{selectedComplaint.owner.name}</strong>
                </div>
              </div>

              {selectedComplaint.resolution && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <strong className="block font-bold text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Official Resolution Summary
                  </strong>
                  <p>{selectedComplaint.resolution}</p>
                </div>
              )}

              {/* Complaint Attachments */}
              {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                <div className="space-y-2 border-b border-slate-800 pb-4">
                  <span className="text-xs font-semibold text-slate-400 block">Uploaded Attachments</span>
                  <div className="flex items-center gap-3 overflow-x-auto">
                    {selectedComplaint.attachments.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="relative h-20 w-28 rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-slate-950 block hover:border-emerald-500">
                        <Image src={url} alt="attachment" fill className="object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Thread Responses */}
              <div className="space-y-4">
                <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
                  Discussion Thread ({selectedComplaint.responses.length})
                </h3>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {selectedComplaint.responses.map((resp) => {
                    const isUser = resp.senderRole === "STUDENT";
                    const isAdmin = resp.senderRole === "ADMIN";
                    return (
                      <div
                        key={resp.id}
                        className={`p-4 rounded-2xl space-y-2 text-xs border ${
                          isUser
                            ? "bg-slate-950 border-slate-800 ml-4"
                            : isAdmin
                            ? "bg-purple-500/10 border-purple-500/30 mr-4"
                            : "bg-slate-800/60 border-slate-700 mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{resp.senderName}</span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] uppercase ${
                                isUser
                                  ? "border-emerald-500/30 text-emerald-400"
                                  : isAdmin
                                  ? "border-purple-500/30 text-purple-300"
                                  : "border-amber-500/30 text-amber-300"
                              }`}
                            >
                              {resp.senderRole}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-slate-400">{new Date(resp.createdAt).toLocaleString("en-IN")}</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{resp.message}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Response Form */}
              {selectedComplaint.status !== "CLOSED" && (
                <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-semibold block">Post Reply to Landlord / Support</label>
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response or update..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Input
                      type="url"
                      placeholder="Attachment URL (Image/Photo link)"
                      value={replyAttachment}
                      onChange={(e) => setReplyAttachment(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />

                    <Button
                      type="submit"
                      disabled={sendingReply}
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-1.5 shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{sendingReply ? "Sending..." : "Post Response"}</span>
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          ) : (
            <Card className="border-slate-800 bg-slate-900/90 p-12 text-center space-y-3">
              <MessageSquare className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-white text-base">Select a Ticket to View Details</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click on any complaint ticket on the left to read full investigation history, landlord responses, and post updates.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* New Complaint Drawer/Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="border-slate-800 bg-slate-900 p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wrench className="h-5 w-5 text-emerald-400" />
                Lodge New Maintenance Complaint Ticket
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Complaint Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold"
                  >
                    {[
                      "MAINTENANCE",
                      "ELECTRICITY",
                      "WATER",
                      "CLEANLINESS",
                      "SECURITY",
                      "ROOM",
                      "PAYMENT",
                      "OWNER",
                      "OTHER",
                    ].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold"
                  >
                    {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Complaint Title</label>
                <Input
                  placeholder="e.g. Geyser tripping circuit breaker in 204"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain when the issue started, frequency, and exact symptoms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Photo / Attachment URL (Optional)</label>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                >
                  {submitting ? "Submitting Ticket..." : "Submit Complaint Ticket"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
