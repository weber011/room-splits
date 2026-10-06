"use client";

import { useState, useEffect } from "react";
import { adminService, AuditLogRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";


export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);

  useEffect(() => {
    async function load() {
      const data = await adminService.getAuditLogs();
      setLogs(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Security Audit Trail</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">System Security & Action Logs</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Immutable security log trail tracking all sensitive administrative state mutations.</p>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Admin Actor</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Metadata / Reason</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-950/50">
                    <td className="py-3 px-4 font-mono text-slate-400">{l.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{l.actorEmail}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 uppercase">{l.action}</td>
                    <td className="py-3 px-4 text-slate-300">{l.targetEntity} ({l.targetId})</td>
                    <td className="py-3 px-4 text-slate-400">{l.metadata || "N/A"}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{l.timestamp}</td>
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
