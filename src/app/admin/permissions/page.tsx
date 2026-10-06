"use client";

import { useState, useEffect } from "react";
import { adminService, AdminPermission } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);

  useEffect(() => {
    async function load() {
      const data = await adminService.getPermissions();
      setPermissions(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Security Definitions</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Granular System Permissions</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Audit permission code strings enforced by server-side authorization middleware.</p>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Permission Code</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Enforcement Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {permissions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-950/50">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      {p.code}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">{p.name}</td>
                    <td className="py-3 px-4 text-slate-400">{p.category}</td>
                    <td className="py-3 px-4">
                      <Badge variant="warning" className="uppercase text-[9px]">Server Enforced</Badge>
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
