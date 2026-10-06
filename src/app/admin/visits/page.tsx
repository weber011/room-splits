"use client";

import { useState, useEffect } from "react";
import { adminService, AdminVisitRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";


export default function AdminVisitsPage() {
  const [visits, setVisits] = useState<AdminVisitRecord[]>([]);

  useEffect(() => {
    async function load() {
      const data = await adminService.getVisits();
      setVisits(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Tours Ledger</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Master Visit Requests</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Audit all student physical property visit appointments across the platform.</p>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Visit ID</th>
                  <th className="py-3 px-4">Student User</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Visit Status</th>
                  <th className="py-3 px-4">Fee Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-950/50">
                    <td className="py-3 px-4 font-mono text-slate-400">{v.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{v.userName}</div>
                      <div className="text-[10px] text-emerald-400 font-mono">{v.userPhone}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{v.propertyTitle}</td>
                    <td className="py-3 px-4 text-slate-400">{v.ownerName}</td>
                    <td className="py-3 px-4 text-slate-300">{v.visitDate} ({v.visitSlot})</td>
                    <td className="py-3 px-4">
                      <Badge variant={v.status === "confirmed" ? "accent" : "warning"} className="capitalize text-[9px]">
                        {v.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="uppercase text-[9px] text-emerald-400 border-emerald-500/30">
                        {v.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}
