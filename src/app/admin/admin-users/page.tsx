"use client";

import { useState, useEffect } from "react";
import { adminService, AdminUserRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, Plus } from "lucide-react";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<AdminUserRecord[]>([]);

  useEffect(() => {
    async function load() {
      const data = await adminService.getAdminStaff();
      setStaff(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Admin Governance</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Users & Internal Staff</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage platform system administrators, auditors, and support specialists.</p>
          </div>

          <Button onClick={() => alert("Invite Admin Staff modal launched")} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Admin User
          </Button>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Admin Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">KYC Verified</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {staff.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-950/50">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-400" />
                      {u.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                    <td className="py-3 px-4 capitalize font-semibold text-emerald-400">{u.role}</td>
                    <td className="py-3 px-4">
                      <Badge variant="accent" className="text-[9px]">Verified</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default" className="text-[9px]">Active</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => alert(`Edit staff ${u.fullName}`)}>
                        Edit Privileges
                      </Button>
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
