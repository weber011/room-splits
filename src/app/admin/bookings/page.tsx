"use client";

import { useState, useEffect } from "react";
import { bookingService } from "@/services/booking.service";
import { Booking } from "@/types/booking.types";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Home, RefreshCw, CreditCard, ShieldCheck } from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error("Failed to load admin bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => (b.paymentStatus === "PAID" ? sum + b.totalAmount : sum), 0);
  const totalPlatformFees = bookings.reduce((sum, b) => (b.paymentStatus === "PAID" ? sum + b.platformCharges : sum), 0);
  const confirmedCount = bookings.filter((b) => b.bookingStatus === "CONFIRMED" || b.bookingStatus === "COMPLETED").length;

  const getStatusBadge = (status: Booking["bookingStatus"]) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px]">CONFIRMED</Badge>;
      case "PAYMENT_PENDING":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px]">PAYMENT PENDING</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[9px]">MOVED IN</Badge>;
      case "CANCELLED":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[9px]">CANCELLED</Badge>;
      default:
        return <Badge variant="outline" className="text-[9px]">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Tenancy Leases</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Home className="h-7 w-7 text-emerald-400" />
              <span>Master Platform Bookings</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Audit all student tenancy reservations, room sharing options, platform facilitation fees, and security deposits.
            </p>
          </div>

          <Button onClick={loadBookings} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4 text-emerald-400" />
            Refresh Data
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-slate-800 bg-slate-900/80 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Home className="h-4 w-4 text-emerald-400" /> Confirmed Leases
            </span>
            <strong className="text-2xl font-extrabold text-white">{confirmedCount}</strong>
          </Card>
          <Card className="p-4 border-slate-800 bg-slate-900/80 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-emerald-400" /> Gross Booking Volume
            </span>
            <strong className="text-2xl font-extrabold text-emerald-400">₹{totalRevenue.toLocaleString("en-IN")}</strong>
          </Card>
          <Card className="p-4 border-slate-800 bg-slate-900/80 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Platform Fees Earned
            </span>
            <strong className="text-2xl font-extrabold text-white">₹{totalPlatformFees.toLocaleString("en-IN")}</strong>
          </Card>
        </div>

        {/* Master Table */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <p className="text-sm text-slate-400">Loading master bookings...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Booking Code</th>
                    <th className="py-3 px-4">Student User</th>
                    <th className="py-3 px-4">Property & Room</th>
                    <th className="py-3 px-4">Move-In Date</th>
                    <th className="py-3 px-4">Monthly Rent</th>
                    <th className="py-3 px-4">Security Deposit</th>
                    <th className="py-3 px-4">Platform Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-950/50">
                      <td className="py-3 px-4 font-mono text-slate-400">{b.bookingCode}</td>
                      <td className="py-3 px-4 font-bold text-white">{b.user.fullName}</td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-200 block">{b.property.title}</strong>
                        <span className="text-[11px] text-slate-400">{b.room.sharingType} ({b.room.roomNumber})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{b.moveInDate}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">₹{b.monthlyRent.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 font-bold text-white">₹{b.securityDeposit.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">₹{b.platformCharges}</td>
                      <td className="py-3 px-4">{getStatusBadge(b.bookingStatus)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={b.paymentStatus === "PAID" ? "accent" : "danger"} className="capitalize text-[9px]">
                          {b.paymentStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
