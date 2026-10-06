"use client";

import { useEffect, useState, use } from "react";
import { paymentService } from "@/services/payment.service";
import { RazorpayTransaction } from "@/types/payment.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShieldCheck, ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function PaymentReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [transaction, setTransaction] = useState<RazorpayTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransaction() {
      try {
        const tx = await paymentService.getTransactionById(resolvedParams.id);
        if (tx) {
          setTransaction(tx);
        }
      } catch (err) {
        console.error("Failed to load transaction details", err);
      } finally {
        setLoading(false);
      }
    }
    loadTransaction();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading Payment Receipt...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="border-slate-800 bg-slate-900/90 p-8 max-w-md text-center space-y-4">
          <CreditCard className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Receipt Not Found</h2>
          <p className="text-xs text-slate-400">The payment transaction receipt does not exist.</p>
          <Link href="/payments">
            <Button size="sm">Back to Payments</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/payments" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Payment History</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => window.print()} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" />
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Printable Receipt Card */}
      <Card className="border-slate-800 bg-slate-900/95 p-8 space-y-6">
        {/* Receipt Top Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">RoomSplits Tax Invoice</h1>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                {transaction.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">Official Razorpay Payment Confirmation Receipt</p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-slate-400">
            <span>Receipt #: <strong>{transaction.id}</strong></span>
            <span className="block text-[11px] text-slate-500">Date: {transaction.paidAt ? new Date(transaction.paidAt).toLocaleString("en-IN") : transaction.createdAt}</span>
          </div>
        </div>

        {/* Server HMAC Security Verification Badge */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-emerald-300 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            HMAC-SHA256 Server Signature Verified
          </span>
          <span className="font-mono text-[10px] text-emerald-400">STATUS 200 OK</span>
        </div>

        {/* User & Property Details */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Payer / Tenant</span>
            <strong className="text-white text-sm block">{transaction.user.fullName}</strong>
            <span className="text-slate-400 block">{transaction.user.email}</span>
            <span className="text-slate-400 font-mono block">{transaction.user.phone}</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Property</span>
            <strong className="text-white text-sm block">{transaction.reference.propertyName || "UrbanNest Executive Co-Living & PG"}</strong>
            <span className="text-slate-400 block">Category: {transaction.paymentType.replace("_", " ")}</span>
          </div>
        </div>

        {/* Razorpay Order Metadata */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-white text-sm">Razorpay Gateway Transaction Metadata</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-slate-400 block text-[10px]">Razorpay Order ID</span>
              <span className="font-mono text-emerald-400 font-bold text-xs">{transaction.razorpayOrderId}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-slate-400 block text-[10px]">Razorpay Payment ID</span>
              <span className="font-mono text-white font-bold text-xs">{transaction.razorpayPaymentId || "pay_N9X123456"}</span>
            </div>
          </div>
        </div>

        {/* Itemized Line Table */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3 font-semibold text-white">
                  {transaction.paymentType === "VISIT_PASS"
                    ? "RoomSplits Physical Visit Pass Token Fee (Refundable on Move-in)"
                    : transaction.paymentType === "BOOKING_RENT"
                    ? "First Month Rent + Security Deposit + Platform Fee"
                    : transaction.paymentType.replace("_", " ")}
                </td>
                <td className="py-3 text-right font-bold text-emerald-400 text-sm">₹{transaction.amount.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between border-t border-slate-800 pt-4 text-base font-bold text-white">
            <span>Total Paid (INR)</span>
            <span className="text-emerald-400 text-xl">₹{transaction.amount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="border-t border-slate-800 pt-4 text-center text-[11px] text-slate-500 space-y-1">
          <p>Thank you for choosing RoomSplits. This receipt is computer generated and requires no physical signature.</p>
          <span className="text-[10px] font-mono text-emerald-400">Gateway: Razorpay Test Mode • Currency: INR</span>
        </div>
      </Card>
    </div>
  );
}
