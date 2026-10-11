"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Calendar, ArrowLeft, AlertCircle, Home } from "lucide-react";
import Link from "next/link";

function NewBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRoomId = searchParams.get("roomId") || "r-single";
  const propertyId = searchParams.get("propertyId") || "prop-1";

  const [roomId, setRoomId] = useState(selectedRoomId);
  const [moveInDate, setMoveInDate] = useState("2026-10-15");
  const [moveOutDate, setMoveOutDate] = useState("2027-01-15");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const room = bookingService.getRoomInventory(roomId);
  const platformFee = bookingService.getPlatformFee();

  const monthlyRent = room ? room.monthlyRent : 16000;
  const securityDeposit = room ? room.securityDeposit : 32000;
  const totalAmount = monthlyRent + securityDeposit + platformFee;

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const booking = await bookingService.createBooking({
        userId: "u-101",
        userName: "Aditya Kumar",
        userEmail: "aditya@example.com",
        userPhone: "+91 98765 43210",
        propertyId,
        roomId,
        moveInDate,
        moveOutDate,
      });

      router.push(`/bookings/${booking.id}?confirmed=true`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to process room booking request.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href={`/property/${propertyId}`} className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Property Details</span>
        </Link>
        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
          Step 1 of 2: Room Selection & Confirmation
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form & Room Selector */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Home className="h-7 w-7 text-emerald-400" />
              <span>Book Property / Room</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select room category, choose your target move-in & move-out dates, and review rent breakdown.
            </p>
          </div>

          {/* Double Booking Guard Warning if error */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-rose-200">Room Booking Guard Triggered</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <Card className="border-slate-800 bg-slate-900 p-6 space-y-5">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3">
              1. Room & Inventory Selection
            </h3>

            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold block">Select Available Room Option</label>

              {/* Room Option 1: Single Sharing AC */}
              <label
                onClick={() => setRoomId("r-single")}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  roomId === "r-single"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">Single Sharing AC (Room A-101)</strong>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                      1 Bed Left
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">Attached Bathroom, Balcony View, AC included</p>
                </div>
                <div className="text-right">
                  <strong className="text-emerald-400 font-bold block text-sm">₹16,000 / mo</strong>
                  <span className="text-[10px] text-slate-400">Deposit: ₹32,000</span>
                </div>
              </label>

              {/* Room Option 2: Double Sharing Non-AC */}
              <label
                onClick={() => setRoomId("r-double")}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  roomId === "r-double"
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">Double Sharing Non-AC (Room B-204)</strong>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">
                      3 Beds Left
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">Shared attached bathroom, 3x daily meals included</p>
                </div>
                <div className="text-right">
                  <strong className="text-emerald-400 font-bold block text-sm">₹11,500 / mo</strong>
                  <span className="text-[10px] text-slate-400">Deposit: ₹23,000</span>
                </div>
              </label>

              {/* Room Option 3: Full Private Room (Unavailable Test Case) */}
              <label
                onClick={() => setRoomId("r-full-room")}
                className={`flex items-center justify-between p-4 rounded-xl border opacity-60 cursor-not-allowed transition-all ${
                  roomId === "r-full-room"
                    ? "border-rose-500 bg-rose-500/10"
                    : "border-slate-800 bg-slate-950/30"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">Private Executive Room (Room C-305)</strong>
                    <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[10px]">
                      SOLD OUT (0 Beds)
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">Full private flat option - currently unavailable</p>
                </div>
                <div className="text-right">
                  <strong className="text-slate-400 font-bold block text-sm">₹22,000 / mo</strong>
                  <span className="text-[10px] text-rose-400 font-semibold">Unavailable</span>
                </div>
              </label>
            </div>

            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 pt-4">
              2. Target Move-in & Move-out Period
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  Target Move-in Date
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  Target Move-out Date
                </label>
                <input
                  type="date"
                  value={moveOutDate}
                  onChange={(e) => setMoveOutDate(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Pricing Breakdown & Submit */}
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900 p-6 space-y-5">
            <h3 className="font-bold text-white text-lg border-b border-slate-800 pb-3">
              Booking Snapshot
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Monthly Rent</span>
                <span className="font-semibold text-white">₹{monthlyRent.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit</span>
                <span className="font-semibold text-white">₹{securityDeposit.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Facilitation Fee</span>
                <span className="font-semibold text-emerald-400">₹{platformFee}</span>
              </div>

              <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-bold text-white">
                <span>Total Snapshot Amount</span>
                <span className="text-emerald-400 text-xl font-bold">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <form onSubmit={handleCreateBooking}>
              <Button
                type="submit"
                disabled={loading || (room ? room.availableBeds <= 0 : false)}
                size="lg"
                className="w-full gap-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950"
              >
                {loading ? "Creating Booking..." : "Confirm Booking"}
              </Button>
            </form>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Double Booking Protection Active
              </span>
              <p>Your room beds will be locked atomically upon confirmation. Rent & deposit payment will be settled in the next step.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    }>
      <NewBookingContent />
    </Suspense>
  );
}
