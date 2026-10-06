"use client";

import { useEffect, useState } from "react";
import { paymentService } from "@/services/payment.service";
import { RazorpayTransaction } from "@/types/payment.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowRight, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";

export default function StudentPaymentsPage() {
  const [transactions, setTransactions] = useState<RazorpayTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getUserTransactions("u-101");
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load payment transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const getStatusBadge = (status: RazorpayTransaction["status"]) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">SUCCESS</Badge>;
      case "PENDING":
      case "CREATED":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">PENDING</Badge>;
      case "FAILED":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30">FAILED</Badge>;
      case "REFUNDED":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">REFUNDED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: RazorpayTransaction["paymentType"]) => {
    switch (type) {
      case "VISIT_PASS":
        return <Badge variant="secondary" className="text-[10px]">VISIT PASS (₹9)</Badge>;
      case "BOOKING_RENT":
        return <Badge variant="default" className="text-[10px]">BOOKING RENT & DEPOSIT</Badge>;
      case "SECURITY_DEPOSIT":
        return <Badge variant="outline" className="text-[10px]">SECURITY DEPOSIT</Badge>;
      case "MONTHLY_RENT":
        return <Badge variant="outline" className="text-[10px]">MONTHLY RENT</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-emerald-400" />
            <span>Payment History & Receipts</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            View verified Razorpay transactions, download official PDF payment receipts, and audit visit fees.
          </p>
        </div>

        <Button onClick={loadTransactions} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4 text-emerald-400" />
          Refresh Ledger
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading payment ledger...</p>
        </div>
      ) : transactions.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 p-12 text-center space-y-4 max-w-md mx-auto">
          <CreditCard className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Transactions Found</h3>
          <p className="text-xs text-slate-400">You do not have any payment transactions yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <Card key={tx.id} className="border-slate-800 bg-slate-900/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {getTypeBadge(tx.paymentType)}
                  {getStatusBadge(tx.status)}
                  <span className="text-[11px] font-mono text-slate-400">ID: #{tx.id}</span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-base">{tx.reference.propertyName || "UrbanNest Executive Co-Living & PG"}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Razorpay Order: <span className="text-emerald-400">{tx.razorpayOrderId}</span>
                    {tx.razorpayPaymentId && <> | Pay ID: <span className="text-white">{tx.razorpayPaymentId}</span></>}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-slate-400 text-[11px] block">Amount Paid</span>
                  <strong className="text-xl font-bold text-emerald-400">₹{tx.amount.toLocaleString("en-IN")}</strong>
                  <span className="text-[10px] text-slate-500 block">{tx.paidAt ? new Date(tx.paidAt).toLocaleDateString("en-IN") : tx.createdAt}</span>
                </div>

                <Link href={`/payments/${tx.id}`}>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-slate-700 hover:bg-slate-800">
                    <FileText className="h-3.5 w-3.5 text-emerald-400" />
                    Receipt
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
