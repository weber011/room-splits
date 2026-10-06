"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminService, AdminOwnerRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Ban, FileText, Check, X } from "lucide-react";

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState<AdminOwnerRecord[]>([]);

  const loadOwners = async () => {
    const data = await adminService.getOwners();
    setOwners(data);
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const handleVerify = async (id: string) => {
    await adminService.verifyOwner(id);
    loadOwners();
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter reason for owner rejection:");
    if (reason) {
      await adminService.rejectOwner(id, reason);
      loadOwners();
    }
  };

  const handleSuspend = async (id: string) => {
    await adminService.suspendOwner(id);
    loadOwners();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Property Managers</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Owner Verification & Management</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Audit owner business profiles, GSTINs, bank accounts, and document submissions.</p>
          </div>
        </div>

        <div className="space-y-4">
          {owners.map((o) => (
            <Card key={o.id} className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-white">{o.name}</h3>
                    <Badge
                      variant={
                        o.verificationStatus === "VERIFIED"
                          ? "accent"
                          : o.verificationStatus === "PENDING"
                          ? "warning"
                          : "danger"
                      }
                      className="uppercase text-[9px]"
                    >
                      {o.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{o.businessName} • GSTIN: {o.gstin || "N/A"}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href="/admin/owner-verification">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5 text-emerald-400" />
                      View {o.documentsCount} Documents
                    </Button>
                  </Link>

                  {o.verificationStatus !== "VERIFIED" && (
                    <Button size="sm" variant="default" onClick={() => handleVerify(o.id)} className="gap-1 text-xs">
                      <Check className="h-3.5 w-3.5" />
                      Verify Owner
                    </Button>
                  )}

                  {o.verificationStatus !== "REJECTED" && (
                    <Button size="sm" variant="outline" onClick={() => handleReject(o.id)} className="gap-1 text-xs text-amber-400">
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  )}

                  {o.verificationStatus !== "SUSPENDED" && (
                    <Button size="sm" variant="danger" onClick={() => handleSuspend(o.id)} className="gap-1 text-xs">
                      <Ban className="h-3.5 w-3.5" />
                      Suspend
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] block">Contact Phone</span>
                  <strong className="text-white font-mono">{o.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Email Address</span>
                  <strong className="text-slate-200 font-mono">{o.email}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Properties Count</span>
                  <strong className="text-emerald-400">{o.propertiesCount} Managed Stays</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Joined Date</span>
                  <strong className="text-white">{o.joinedAt}</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
