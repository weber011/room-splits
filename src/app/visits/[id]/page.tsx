"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { visitService } from "@/services/visit.service";
import { VisitPass, computeVisitPassVisibility } from "@/types/visit.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  QrCode,
  CalendarDays,
  Lock,
  Navigation
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function VisitPassDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const justConfirmed = searchParams.get("confirmed") === "true";

  const [visitPass, setVisitPass] = useState<VisitPass | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals / State for Reschedule & Cancel
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("Evening (05:00 PM - 07:00 PM)");
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadPass() {
      try {
        const pass = await visitService.getVisitPassById(resolvedParams.id);
        if (pass) {
          setVisitPass(pass);
          setNewDate(pass.preferredDate);
          setNewTime(pass.preferredTime);
        }
      } catch (err) {
        console.error("Failed to load visit pass details", err);
      } finally {
        setLoading(false);
      }
    }
    loadPass();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading Visit Ticket Details...</p>
        </div>
      </div>
    );
  }

  if (!visitPass) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="border-slate-800 bg-slate-900/90 p-8 max-w-md text-center space-y-4">
          <Ticket className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Visit Ticket Not Found</h2>
          <p className="text-xs text-slate-400">The visit pass request you are looking for does not exist.</p>
          <Link href="/visits">
            <Button size="sm">View My Visits</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const visibility = computeVisitPassVisibility(visitPass.status, visitPass.paymentStatus);

  const handleReschedule = async () => {
    if (!newDate) return;
    setActionLoading(true);
    try {
      const updated = await visitService.rescheduleVisitPass(visitPass.id, newDate, newTime);
      if (updated) {
        setVisitPass(updated);
        setIsRescheduling(false);
      }
    } catch {
      alert("Failed to reschedule visit.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const updated = await visitService.cancelVisitPass(visitPass.id, cancelReason || "Cancelled by user");
      if (updated) {
        setVisitPass(updated);
        setIsCancelling(false);
      }
    } catch {
      alert("Failed to cancel visit.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (visitPass.status) {
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
        return <Badge variant="outline">{visitPass.status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/visits" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>My Visit Passes</span>
        </Link>
        <span className="text-xs text-slate-500 font-mono">ID: {visitPass.id}</span>
      </div>

      {justConfirmed && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <strong className="block font-bold">Visit Pass Payment Confirmed!</strong>
            <span className="text-xs opacity-90">Your digital visit pass is active. Exact property location and owner contact are unlocked below.</span>
          </div>
        </div>
      )}

      {/* Main Digital Ticket Card */}
      <Card className="border-slate-800 bg-slate-900/90 overflow-hidden relative">
        {/* Ticket Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-indigo-900/40 p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Digital Visit Ticket</h2>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Present this ticket upon arriving at the property.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
            <QrCode className="h-4 w-4 text-emerald-400" />
            <span>Pass Token: {visitPass.id.slice(-6).toUpperCase()}</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                <Image
                  src={visitPass.property?.coverImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"}
                  alt={visitPass.property?.title || "Property"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <Link href={`/property/${visitPass.property.id}`} className="font-bold text-white text-lg hover:text-emerald-400 transition-colors leading-snug">
                  {visitPass.property?.title || "Property"}
                </Link>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{visitPass.property?.locality || "Locality"}, {visitPass.property?.city || "City"}</span>
                </p>
              </div>
            </div>

            {/* Visit Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Visit Date
                </span>
                <span className="font-bold text-white block text-sm">{visitPass.preferredDate}</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" /> Time Slot
                </span>
                <span className="font-bold text-white block text-sm truncate">{visitPass.preferredTime}</span>
              </div>
            </div>

            {/* Privacy Section: Exact Location & Contact Visibility */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Verified Visit Contact & Navigation
              </h4>

              {visibility.exactLocationVisibility ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                    <span className="text-slate-400 block text-[11px]">Exact Location Address:</span>
                    <strong className="text-white text-sm block">{visitPass.property?.address || "Address"}</strong>
                  </div>

                  {visibility.contactVisibility && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <a
                        href={`tel:${visitPass.owner?.phone || "+91 98765 00000"}`}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call Owner ({visitPass.owner?.phone || "+91 98765 00000"})</span>
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(visitPass.property?.address || visitPass.property?.locality || "Bengaluru")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                      >
                        <Navigation className="h-4 w-4 text-emerald-400" />
                        <span>Open Google Maps</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-3 text-center">
                  <div className="flex justify-center">
                    <Lock className="h-8 w-8 text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-white text-sm block">Contact & Address Locked</strong>
                    <p className="text-xs text-slate-400">
                      Complete your ₹{visitPass.visitPassAmount} Visit Pass payment to unlock direct owner contact and exact location pin.
                    </p>
                  </div>
                  <Link href={`/visits/checkout/${visitPass.id}`}>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2">
                      <Ticket className="h-4 w-4" />
                      Pay Visit Pass (₹{visitPass.visitPassAmount})
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Owner Proposed Time Notice (if owner proposed a new time) */}
            {visitPass.ownerConfirmation === "PROPOSED_NEW_TIME" && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <CalendarDays className="h-4 w-4 text-purple-400" />
                  <span>Owner Proposed Another Time</span>
                </div>
                <p className="text-xs text-slate-300">
                  The property manager proposed: <strong>{visitPass.preferredDate}</strong> at <strong>{visitPass.preferredTime}</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Actions & QR Ticket Simulation */}
          <div className="space-y-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-6">
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Ticket Verification</span>
                <div className="bg-white p-3 rounded-xl inline-block mx-auto border border-slate-200">
                  {/* Mock SVG QR Code */}
                  <div className="w-28 h-28 bg-slate-900 rounded flex items-center justify-center text-emerald-400 text-xs font-mono font-bold p-2 text-center leading-tight">
                    ROOMSPLITS PASS #{visitPass.id.slice(-4)}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">Present to caretaker on arrival</span>
              </div>

              {/* Status and Fee Summary */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <strong className={visitPass.paymentStatus === "PAID" ? "text-emerald-400" : "text-amber-400"}>
                    {visitPass.paymentStatus}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Visit Pass Fee:</span>
                  <strong className="text-white">₹{visitPass.visitPassAmount}</strong>
                </div>
              </div>
            </div>

            {/* Reschedule & Cancel Controls */}
            {visitPass.status !== "CANCELLED" && visitPass.status !== "COMPLETED" && (
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <Button
                  onClick={() => setIsRescheduling(!isRescheduling)}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-xs"
                >
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-400" />
                  {isRescheduling ? "Close Reschedule" : "Reschedule Visit"}
                </Button>

                <Button
                  onClick={() => setIsCancelling(!isCancelling)}
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel Visit
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Reschedule Form Drawer/Panel */}
      {isRescheduling && (
        <Card className="border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-400" />
            <span>Select New Date & Time</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">New Preferred Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold">New Time Slot</label>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 outline-none"
              >
                <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
                <option value="Afternoon (02:00 PM - 04:00 PM)">Afternoon (02:00 PM - 04:00 PM)</option>
                <option value="Evening (05:00 PM - 07:00 PM)">Evening (05:00 PM - 07:00 PM)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsRescheduling(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleReschedule} disabled={actionLoading} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
              {actionLoading ? "Updating..." : "Confirm Reschedule"}
            </Button>
          </div>
        </Card>
      )}

      {/* Cancel Confirmation Panel */}
      {isCancelling && (
        <Card className="border-rose-900/40 bg-slate-900 p-6 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Cancel Visit Request</span>
          </h3>
          <p className="text-xs text-slate-400">Please share a reason for cancellation (optional):</p>
          <input
            type="text"
            placeholder="e.g. Found another property, Schedule conflict..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 outline-none"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCancelling(false)}>
              Back
            </Button>
            <Button size="sm" onClick={handleCancel} disabled={actionLoading} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
              {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function VisitPassDetailsPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    }>
      <VisitPassDetailsContent {...props} />
    </Suspense>
  );
}
