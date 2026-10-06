"use client";

import { useState, useEffect } from "react";
import { bookingService } from "@/services/booking.service";
import { checkoutService } from "@/services/checkout.service";
import { Booking } from "@/types/booking.types";
import { CheckoutRecord, DeductionCategory } from "@/types/checkout.types";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Home,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Plus,
  Trash2,
  FileCheck,
} from "lucide-react";

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [checkouts, setCheckouts] = useState<CheckoutRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Settlement Form Modal State
  const [selectedCheckout, setSelectedCheckout] = useState<CheckoutRecord | null>(null);
  const [deductions, setDeductions] = useState<
    { category: DeductionCategory; description: string; amount: number; evidenceUrl?: string }[]
  >([
    {
      category: "DEEP_CLEANING",
      description: "End of tenancy room deep cleaning & sanitization",
      amount: 1500,
    },
  ]);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [submittingSettlement, setSubmittingSettlement] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const bkData = await bookingService.getOwnerBookings("owner-1");
      setBookings(bkData);

      const chkData = await checkoutService.getOwnerCheckouts("owner-1");
      setCheckouts(chkData);
    } catch (err) {
      console.error("Failed to load owner leases & checkouts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteMoveIn = async (id: string) => {
    await bookingService.completeBooking(id);
    loadData();
  };

  const handleAddDeductionRow = () => {
    setDeductions([
      ...deductions,
      { category: "DAMAGE_REPAIR", description: "", amount: 0 },
    ]);
  };

  const handleRemoveDeductionRow = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index));
  };

  const handleSettlementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCheckout) return;
    setSubmittingSettlement(true);

    try {
      await checkoutService.submitOwnerSettlement({
        checkoutId: selectedCheckout.id,
        deductions,
        ownerNotes,
      });
      setSelectedCheckout(null);
      await loadData();
    } catch (err) {
      console.error("Failed to submit settlement", err);
    } finally {
      setSubmittingSettlement(false);
    }
  };

  const totalDeductions = deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const originalDeposit = selectedCheckout ? 32000 : 0;
  const estimatedRefund = Math.max(0, originalDeposit - totalDeductions);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="owner" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-2">Tenancy Leases</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Home className="h-7 w-7 text-emerald-400" />
              <span>Bookings & Security Deposit Settlements</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage student room reservations, verify security deposit payments, process move-ins, and issue deposit settlements.
            </p>
          </div>

          <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4 text-emerald-400" />
            Refresh Data
          </Button>
        </div>

        {/* Section 1: Active Move-Out & Settlement Requests */}
        {checkouts.length > 0 && (
          <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <LogOut className="h-5 w-5 text-rose-400" />
              Pending Move-Out Requests & Deposit Settlements ({checkouts.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checkouts.map((chk) => (
                <div key={chk.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{chk.tenant.fullName}</h4>
                      <p className="text-xs text-slate-400">{chk.property.title} &bull; {chk.room.roomNumber}</p>
                    </div>
                    <Badge variant="outline" className="text-purple-300 border-purple-500/30 text-[10px]">
                      {chk.status}
                    </Badge>
                  </div>

                  <div className="text-xs space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <p className="text-slate-300"><strong className="text-white">Checkout Date:</strong> {chk.requestedCheckoutDate}</p>
                    <p className="text-slate-300"><strong className="text-white">Reason:</strong> {chk.reason}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Security Deposit: <strong className="text-white">₹32,000</strong></span>
                    <Button
                      size="sm"
                      onClick={() => setSelectedCheckout(chk)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5"
                    >
                      <FileCheck className="h-3.5 w-3.5" />
                      Submit Deposit Settlement
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Section 2: Bookings List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Active Leases & Bookings ({bookings.length})</h3>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading leases...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((b) => (
                <Card key={b.id} className="border-slate-800 bg-slate-900/80 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-base text-white flex items-center gap-2">
                          <User className="h-4 w-4 text-emerald-400" />
                          <span>{b.user.fullName}</span>
                        </h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                          <Phone className="h-3 w-3 text-emerald-400" />
                          <span>{b.user.phone}</span>
                        </p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        {b.bookingStatus}
                      </Badge>
                    </div>

                    <div className="text-xs space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <p className="text-white font-bold">{b.property.title}</p>
                      <p className="text-slate-400">Room: {b.room.sharingType} ({b.room.roomNumber})</p>
                      <div className="flex justify-between pt-2 text-[11px] border-t border-slate-800/60 mt-1">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Calendar className="h-3 w-3 text-emerald-400" /> Move-In: <strong className="text-white">{b.moveInDate}</strong>
                        </span>
                        <span>Rent: <strong className="text-emerald-400">₹{b.monthlyRent.toLocaleString("en-IN")}/mo</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Deposit: <strong className="text-white">₹{b.securityDeposit.toLocaleString("en-IN")}</strong></span>
                    <div className="flex items-center gap-2">
                      {b.bookingStatus === "CONFIRMED" && (
                        <Button size="sm" onClick={() => handleCompleteMoveIn(b.id)} className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark Moved-In
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Submit Deposit Settlement Modal */}
        {selectedCheckout && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <Card className="border-slate-800 bg-slate-900 p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-emerald-400" />
                    Security Deposit Settlement Console
                  </h3>
                  <p className="text-xs text-slate-400">Resident: {selectedCheckout.tenant.fullName} &bull; Room: {selectedCheckout.room.roomNumber}</p>
                </div>
                <button onClick={() => setSelectedCheckout(null)} className="text-slate-400 hover:text-white text-sm">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSettlementSubmit} className="space-y-4 text-xs">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Itemized Deductions</h4>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddDeductionRow} className="h-7 text-[11px] gap-1 text-emerald-400 border-emerald-500/30">
                      <Plus className="h-3 w-3" />
                      Add Deduction Line
                    </Button>
                  </div>

                  {deductions.map((row, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Category</label>
                          <select
                            value={row.category}
                            onChange={(e) => {
                              const updated = [...deductions];
                              updated[idx].category = e.target.value as DeductionCategory;
                              setDeductions(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs font-semibold"
                          >
                            <option value="DEEP_CLEANING">DEEP_CLEANING</option>
                            <option value="DAMAGE_REPAIR">DAMAGE_REPAIR</option>
                            <option value="PENDING_RENT">PENDING_RENT</option>
                            <option value="KEY_REPLACEMENT">KEY_REPLACEMENT</option>
                            <option value="NOTICE_DEFICIT">NOTICE_DEFICIT</option>
                            <option value="UTILITY_DUES">UTILITY_DUES</option>
                            <option value="OTHER">OTHER</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Deduction Description</label>
                          <Input
                            placeholder="Reason description..."
                            value={row.description}
                            onChange={(e) => {
                              const updated = [...deductions];
                              updated[idx].description = e.target.value;
                              setDeductions(updated);
                            }}
                            className="bg-slate-900 border-slate-800 text-white text-xs"
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-400 block mb-1">Amount (₹)</label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={row.amount}
                              onChange={(e) => {
                                const updated = [...deductions];
                                updated[idx].amount = Number(e.target.value);
                                setDeductions(updated);
                              }}
                              className="bg-slate-900 border-slate-800 text-white text-xs font-bold"
                              required
                            />
                          </div>

                          {deductions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDeductionRow(idx)}
                              className="text-rose-400 hover:text-rose-300 mt-4 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <Input
                          type="url"
                          placeholder="Evidence URL / Photo Proof link (Optional)"
                          value={row.evidenceUrl || ""}
                          onChange={(e) => {
                            const updated = [...deductions];
                            updated[idx].evidenceUrl = e.target.value;
                            setDeductions(updated);
                          }}
                          className="bg-slate-900 border-slate-800 text-white text-[11px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Formula Callout */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-slate-400 text-xs">
                    <span>Original Security Deposit</span>
                    <span className="font-bold text-white">₹{originalDeposit.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-rose-400 text-xs">
                    <span>Total Line-Item Deductions</span>
                    <span className="font-bold">-₹{totalDeductions.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-extrabold">
                    <span className="text-white">Refundable Amount to Student</span>
                    <span className="text-emerald-400 text-base">₹{estimatedRefund.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Inspection Summary & Owner Notes</label>
                  <textarea
                    rows={2}
                    value={ownerNotes}
                    onChange={(e) => setOwnerNotes(e.target.value)}
                    placeholder="Enter move-out room inspection notes..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCheckout(null)} className="border-slate-800 text-slate-300">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submittingSettlement} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
                    {submittingSettlement ? "Submitting Settlement..." : "Issue Settlement Statement"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
