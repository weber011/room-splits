"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
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
  QrCode
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function BookingDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const justConfirmed = searchParams.get("confirmed") === "true";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      try {
        const bk = await bookingService.getBookingById(resolvedParams.id);
        if (bk) {
          setBooking(bk);
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

  const getStatusBadge = () => {
    switch (booking.bookingStatus) {
      case "CONFIRMED":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">CONFIRMED</Badge>;
      case "PAYMENT_PENDING":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">PAYMENT PENDING</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">COMPLETED / MOVED IN</Badge>;
      case "CANCELLED":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{booking.bookingStatus}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/bookings" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>My Room Reservations</span>
        </Link>
        <span className="text-xs text-slate-500 font-mono">Code: {booking.bookingCode}</span>
      </div>

      {justConfirmed && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <strong className="block font-bold">Room Reservation Confirmed!</strong>
            <span className="text-xs opacity-90">Your room and bed have been locked atomically. Move-in pass details and property manager contacts are ready below.</span>
          </div>
        </div>
      )}

      {/* Main Digital Ticket Card */}
      <Card className="border-slate-800 bg-slate-900/90 overflow-hidden">
        {/* Ticket Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-indigo-900/40 p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Digital Move-In Pass</h2>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Present this confirmation pass to caretaker upon key handover.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
            <QrCode className="h-4 w-4 text-emerald-400" />
            <span>Pass Code: {booking.bookingCode}</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                <Image
                  src={booking.property.coverImage || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
                  alt={booking.property.title}
                  fill
                  className="object-cover"
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
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Target Move-In Date
                </span>
                <strong className="text-white block text-sm font-bold">{booking.moveInDate}</strong>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Monthly Rent</span>
                <strong className="text-emerald-400 block text-sm font-bold">₹{booking.monthlyRent.toLocaleString("en-IN")} / mo</strong>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Security Deposit Paid</span>
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
                <li>Present this Digital Move-In Pass to caretaker at front desk.</li>
                <li>Inspect room condition, sign physical check-in log, and receive key fob.</li>
              </ol>
            </div>
          </div>

          {/* Right Column: PDF Receipts & Actions */}
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
                  <strong className="text-emerald-400 font-bold">{booking.paymentStatus}</strong>
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
