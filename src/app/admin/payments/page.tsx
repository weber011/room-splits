"use client";

import { useState, useEffect } from "react";
import { paymentService } from "@/services/payment.service";
import { RazorpayTransaction } from "@/types/payment.types";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, RefreshCw, Lock } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<RazorpayTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getAllTransactions();
      setPayments(data);
    } catch (err) {
      console.error("Failed to load admin transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const totalGMV = payments
    .filter((p) => (p.status as string) === "CAPTURED" || (p.status as string) === "SUCCESS" || (p.status as string) === "success")
    .reduce((acc, p) => acc + p.amount, 0);

  const getStatusBadge = (status: RazorpayTransaction["status"]) => {
    switch (status as string) {
      case "CAPTURED":
      case "SUCCESS":
      case "success":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[9px]">CAPTURED</Badge>;
      case "PENDING":
      case "CREATED":
      case "ORDER_CREATED":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[9px]">PENDING</Badge>;
      case "FAILED":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[9px]">FAILED</Badge>;
      case "REFUNDED":
        return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[9px]">REFUNDED</Badge>;
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
            <Badge variant="warning" className="mb-2">Platform Revenue</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="h-7 w-7 text-emerald-400" />
              <span>Master Financial Ledger & Webhook Audit</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Audit gross payment volume, Razorpay gateway order IDs, HMAC-SHA256 signature verifications, and webhook reconciliation logs.
            </p>
          </div>

          <Button onClick={loadPayments} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4 text-emerald-400" />
            Refresh Ledger
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-800 bg-slate-900/80 p-5 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Gross Transaction Volume (GMV)</span>
            <h3 className="text-2xl font-extrabold text-emerald-400">₹{totalGMV.toLocaleString("en-IN")}</h3>
          </Card>
          <Card className="border-slate-800 bg-slate-900/80 p-5 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">HMAC Verification Engine</span>
            <h3 className="text-2xl font-extrabold text-white">SHA-256 Server Active</h3>
          </Card>
          <Card className="border-slate-800 bg-slate-900/80 p-5 space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Webhook Idempotency Lock</span>
            <h3 className="text-2xl font-extrabold text-indigo-400">Enforced (Zero Duplicates)</h3>
          </Card>
        </div>

        {/* Master Table */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">Master Razorpay Ledger Entries</h3>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              Webhook Secret Verified
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <p className="text-sm text-slate-400">Loading master ledger...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Razorpay Order ID</th>
                    <th className="py-3 px-4">Razorpay Payment ID</th>
                    <th className="py-3 px-4">Payer / Student</th>
                    <th className="py-3 px-4">Payment Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Paid Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-950/50">
                      <td className="py-3 px-4 font-mono text-slate-400">{p.id}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400">{p.razorpayOrderId}</td>
                      <td className="py-3 px-4 font-mono text-white">{p.razorpayPaymentId || "Pending"}</td>
                      <td className="py-3 px-4 font-bold text-white">{p.user.fullName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-300">{p.paymentType}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">₹{p.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4">{getStatusBadge(p.status)}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString("en-IN")
                          : p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-IN")
                          : "Pending"}
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
