"use client";

import { useEffect, useState } from "react";
import { bookingService } from "@/services/booking.service";
import { Booking } from "@/types/booking.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Calendar, MapPin, ArrowRight, Plus, RefreshCw, CreditCard, Key } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "CONFIRMED" | "PENDING" | "PAST">("ALL");

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getUserBookings("u-101");
      setBookings(data);
    } catch (err) {
      console.error("Failed to load user bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "CONFIRMED") return b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED";
    if (activeTab === "PENDING") return b.bookingStatus === "DRAFT" || b.bookingStatus === "PAYMENT_PENDING" || b.paymentStatus === "UNPAID" || b.paymentStatus === "PAYMENT_PENDING";
    if (activeTab === "PAST") return b.bookingStatus === "CANCELLED" || b.bookingStatus === "EXPIRED";
    return true;
  });

  const getStatusBadge = (status: Booking["bookingStatus"]) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">CONFIRMED</Badge>;
      case "PAYMENT_PENDING":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">PAYMENT PENDING</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">MOVED IN</Badge>;
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
            <Home className="h-8 w-8 text-emerald-400" />
            <span>My Room Reservations & Leases</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your confirmed PG & hostel room bookings, move-in passes, and tenancy details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={loadBookings} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4 text-emerald-400" />
            Refresh
          </Button>
          <Link href="/bookings/new">
            <Button size="sm" className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
              <Plus className="h-4 w-4" />
              Book New Room
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
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
            {tab === "ALL" && `All Reservations (${bookings.length})`}
            {tab === "CONFIRMED" && `Confirmed & Active (${bookings.filter((b) => b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED").length})`}
            {tab === "PENDING" && `Pending Payment (${bookings.filter((b) => b.paymentStatus === "UNPAID" || b.paymentStatus === "PAYMENT_PENDING" || b.bookingStatus === "DRAFT").length})`}
            {tab === "PAST" && `Past & Cancelled (${bookings.filter((b) => b.bookingStatus === "CANCELLED" || b.bookingStatus === "EXPIRED").length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading room reservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 p-12 text-center space-y-4 max-w-md mx-auto">
          <Home className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400">You do not have any room reservations matching the selected tab.</p>
          <Link href="/discover">
            <Button size="sm">Explore PG & Hostels</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => (
            <Card key={b.id} className="border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-colors">
              {/* Card Top */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-16 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      <Image
                        src={b.property.coverImage || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
                        alt={b.property.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-1">{b.property.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{b.property.locality}, {b.property.city}</span>
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(b.bookingStatus)}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 block text-[10px]">Room Number</span>
                    <strong className="text-white block text-xs">{b.room.sharingType} ({b.room.roomNumber})</strong>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                    <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                      <Calendar className="h-3 w-3 text-emerald-400" /> Move-In Date
                    </span>
                    <strong className="text-white block text-xs">{b.moveInDate}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Monthly Rent: <strong className="text-emerald-400 font-bold">₹{b.monthlyRent.toLocaleString("en-IN")}</strong></span>
                  <span className="text-slate-400">Deposit: <strong className="text-white font-bold">₹{b.securityDeposit.toLocaleString("en-IN")}</strong></span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-slate-950/80 p-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400">Code: #{b.bookingCode}</span>

                <div className="flex items-center gap-2">
                  {b.paymentStatus === "UNPAID" || b.paymentStatus === "PAYMENT_PENDING" || b.bookingStatus === "DRAFT" ? (
                    <Link href={`/bookings/checkout/${b.id}`}>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay Booking (₹{b.totalAmount.toLocaleString("en-IN")})
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/bookings/${b.id}`}>
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5">
                        <Key className="h-3.5 w-3.5" />
                        Move-in Pass
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
