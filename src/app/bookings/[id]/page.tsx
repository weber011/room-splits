"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { stayService } from "@/services/stay.service";
import { Booking } from "@/types/booking.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Calendar,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  FileText,
  Download,
  AlertTriangle,
  User,
  Key,
  CreditCard
} from "lucide-react";
import Link from "next/link";

function BookingDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const justConfirmed = searchParams.get("confirmed") === "true";
  const justPaid = searchParams.get("paid") === "true";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Move-in action states
  const [movingIn, setMovingIn] = useState(false);
  const [moveInMessage, setMoveInMessage] = useState<string | null>(null);
  const [moveInError, setMoveInError] = useState<string | null>(null);
  const [isMovedIn, setIsMovedIn] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      try {
        const bk = await bookingService.getBookingById(resolvedParams.id);
        if (bk) {
          setBooking(bk);
          if (bk.bookingStatus === "COMPLETED" || (bk.bookingStatus as string) === "MOVED_IN") {
            setIsMovedIn(true);
          }
          // Also check if a stay record already exists
          const existingStay = await stayService.getStayByBookingId(bk.id);
          if (existingStay && (existingStay.status === "ACTIVE" || (existingStay.status as string) === "active")) {
            setIsMovedIn(true);
          }
        }
      } catch (err) {
        console.error("Failed to load booking details", err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading Tenancy Booking Details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="border-slate-800 bg-slate-900/90 p-8 max-w-md text-center space-y-4">
          <Home className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Booking Record Not Found</h2>
          <p className="text-xs text-slate-400">The room reservation you are looking for does not exist.</p>
          <Link href="/bookings">
            <Button size="sm">View My Bookings</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleCancelBooking = async () => {
    setActionLoading(true);
    try {
      const updated = await bookingService.cancelBooking(booking.id, cancelReason || "Cancelled by user");
      if (updated) {
        setBooking(updated);
        setIsCancelling(false);
      }
    } catch {
      alert("Failed to cancel booking.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmMoveIn = async () => {
    setMovingIn(true);
    setMoveInError(null);
    setMoveInMessage(null);

    try {
      // 1. Try server API route first
      const res = await fetch("/api/stays/move-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setIsMovedIn(true);
        setMoveInMessage(data.message || "Move-in confirmed! Your stay is now active.");
        const updated = await bookingService.getBookingById(booking.id);
        if (updated) setBooking(updated);
      } else {
        // Direct service fallback (e.g. standalone test mode or dev offline mode)
        const directRes = await stayService.confirmMoveIn({ bookingId: booking.id });
        if (directRes.success) {
          setIsMovedIn(true);
          setMoveInMessage(directRes.message);
          const updated = await bookingService.getBookingById(booking.id);
          if (updated) setBooking(updated);
        } else {
          setMoveInError(data.error || directRes.message || "Failed to confirm move-in.");
        }
      }
    } catch {
      // Fallback directly via service
      const directRes = await stayService.confirmMoveIn({ bookingId: booking.id });
      if (directRes.success) {
        setIsMovedIn(true);
        setMoveInMessage(directRes.message);
        const updated = await bookingService.getBookingById(booking.id);
        if (updated) setBooking(updated);
      } else {
        setMoveInError(directRes.message || "An error occurred while confirming move-in.");
      }
    } finally {
      setMovingIn(false);
    }
  };

  const getStatusBadge = () => {
    if (isMovedIn) {
      return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">ACTIVE STAY / MOVED IN</Badge>;
    }
    switch (booking.bookingStatus) {
      case "CONFIRMED":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">CONFIRMED</Badge>;
      case "COMPLETED":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">MOVED IN</Badge>;
      case "PAYMENT_PENDING":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">PENDING PAYMENT</Badge>;
      case "CANCELLED":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30">CANCELLED</Badge>;
      default:
        return <Badge variant="secondary">{booking.bookingStatus}</Badge>;
    }
  };

  const isPaid = booking.paymentStatus === "PAID";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/bookings" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to My Bookings</span>
        </Link>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Confirmation & Notification Banners */}
      {justConfirmed && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <strong className="block text-white">Room Reservation Created Successfully!</strong>
            <span className="text-xs text-emerald-400/90">
              {isPaid
                ? "Your booking is paid. Complete move-in when ready to activate your stay."
                : "Please proceed with initial Rent + Security Deposit payment to secure your stay."}
            </span>
          </div>
        </div>
      )}

      {justPaid && isPaid && !isMovedIn && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <strong className="block text-white">Rent & Security Deposit Payment Captured!</strong>
            <span className="text-xs text-emerald-400/90">
              Your room is reserved and fully paid. You are now READY FOR MOVE-IN. Click below to activate your residency.
            </span>
          </div>
        </div>
      )}

      {moveInMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between gap-3 text-emerald-200 text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span>{moveInMessage}</span>
          </div>
          <Link href="/my-stay">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
              Go to Active Stay
            </Button>
          </Link>
        </div>
      )}

      {moveInError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-center gap-3 text-rose-300 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{moveInError}</span>
        </div>
      )}

      {/* Main Booking Pass & Key Details */}
      <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest block">
              OFFICIAL ROOM RESERVATION PASS
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Pass #{booking.bookingCode}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Booked on {booking.bookingDate} • Tenant: <span className="text-white font-medium">{booking.user.fullName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-slate-700 text-slate-300">
              Sharing: {booking.room.sharingType}
            </Badge>
          </div>
        </div>

        {/* PROMPT 38 — MOVE-IN ACTION BANNER FOR PAID BOOKINGS */}
        {isPaid && !isMovedIn && (
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border-2 border-emerald-500/50 p-5 rounded-2xl space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Ready for Move-In</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">PAYMENT VERIFIED</Badge>
                </div>
                <p className="text-xs text-slate-300">
                  Initial Rent & Security Deposit are paid. Perform move-in confirmation to activate your active residency.
                </p>
              </div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={handleConfirmMoveIn}
                disabled={movingIn}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 h-11 px-6 shadow-lg shadow-emerald-500/20"
              >
                {movingIn ? "Activating Active Stay..." : "Confirm Move-In & Activate Stay"}
              </Button>
              <span className="text-[11px] text-slate-400">
                Move-in Date scheduled for: <strong className="text-white">{booking.moveInDate}</strong>
              </span>
            </div>
          </div>
        )}

        {isMovedIn && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white text-sm block">Active Residency Dashboard Available</strong>
                <span className="text-slate-300">Move-in confirmed. Manage active stay, rent history, roommates, and complaints.</span>
              </div>
            </div>
            <Link href="/my-stay">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold whitespace-nowrap">
                Go to /my-stay
              </Button>
            </Link>
          </div>
        )}

        {!isPaid && booking.bookingStatus !== "CANCELLED" && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-white text-sm block">Initial Payment Required</strong>
                <span className="text-slate-300">Complete Rent + Security Deposit payment to enable Move-In activation.</span>
              </div>
            </div>
            <Link href={`/bookings/checkout/${booking.id}`}>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold whitespace-nowrap">
                Pay Rent + Deposit (₹{booking.totalAmount.toLocaleString("en-IN")})
              </Button>
            </Link>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Columns */}
          <div className="md:col-span-2 space-y-6">
            {/* Property Card Summary */}
            <div className="flex gap-4 items-start p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="relative h-20 w-28 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                <img
                  src={booking.property.coverImage}
                  alt={booking.property.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="space-y-1">
                <Link href={`/property/${booking.property.id}`} className="font-bold text-white text-lg hover:text-emerald-400 transition-colors leading-snug">
                  {booking.property.title}
                </Link>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{booking.property.locality}, {booking.property.city}</span>
                </p>
              </div>
            </div>

            {/* Room & Payment Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Assigned Room</span>
                <strong className="text-white block text-sm font-bold">{booking.room.sharingType} ({booking.room.roomNumber})</strong>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Booking Period
                </span>
                <strong className="text-white block text-xs font-bold">{booking.moveInDate} &rarr; {booking.moveOutDate}</strong>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Monthly Rent Snapshot</span>
                <strong className="text-emerald-400 block text-sm font-bold">₹{booking.monthlyRent.toLocaleString("en-IN")} / mo</strong>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Security Deposit Snapshot</span>
                <strong className="text-white block text-sm font-bold">₹{booking.securityDeposit.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {/* Owner & Caretaker Contact Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400" />
                Property Manager & Move-in Contacts
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="text-white text-sm block">{booking.owner.name}</strong>
                  <span className="text-slate-400">{booking.owner.email}</span>
                </div>
                <a
                  href={`tel:${booking.owner.phone}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Property Manager ({booking.owner.phone})</span>
                </a>
              </div>
            </div>

            {/* Key Handover Instructions */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
              <h5 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Move-In & Key Handover Steps
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 pt-1">
                <li>Arrive at property address on <strong>{booking.moveInDate}</strong>.</li>
                <li>Present this Digital Move-In Pass or confirm move-in above.</li>
                <li>Inspect room condition, sign physical check-in log, and receive key fob.</li>
              </ol>
            </div>
          </div>

          {/* Right Column: QR Code & Actions */}
          <div className="space-y-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-6">
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Move-in Pass QR</span>
                <div className="bg-white p-3 rounded-xl inline-block mx-auto border border-slate-200">
                  <div className="w-28 h-28 bg-slate-900 rounded flex items-center justify-center text-emerald-400 text-xs font-mono font-bold p-2 text-center leading-tight">
                    BOOKING PASS #{booking.bookingCode}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">Present to property manager</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <strong className={isPaid ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                    {booking.paymentStatus}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Paid:</span>
                  <strong className="text-white font-bold">₹{booking.totalAmount.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              {/* PDF Documents */}
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs justify-start">
                  <FileText className="h-4 w-4 text-emerald-400" />
                  <span>Tenancy Agreement (PDF)</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs justify-start">
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>Payment Receipt Slip</span>
                </Button>
              </div>
            </div>

            {/* Cancel Button */}
            {booking.bookingStatus !== "CANCELLED" && booking.bookingStatus !== "COMPLETED" && (
              <div className="pt-4 border-t border-slate-800">
                <Button
                  onClick={() => setIsCancelling(!isCancelling)}
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel Reservation
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Cancel Panel */}
      {isCancelling && (
        <Card className="border-rose-900/40 bg-slate-900 p-6 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Cancel Room Reservation</span>
          </h3>
          <p className="text-xs text-slate-400">
            Cancelling your confirmed booking will release room <strong>{booking.room.roomNumber}</strong> inventory bed.
          </p>
          <input
            type="text"
            placeholder="Reason for cancellation (optional)..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full h-10 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 outline-none"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCancelling(false)}>
              Back
            </Button>
            <Button size="sm" onClick={handleCancelBooking} disabled={actionLoading} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
              {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function BookingDetailsPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    }>
      <BookingDetailsContent {...props} />
    </Suspense>
  );
}
