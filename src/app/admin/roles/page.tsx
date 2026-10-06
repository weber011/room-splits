"use client";

import { useState, useEffect } from "react";
import { adminService, AdminRole } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, Plus } from "lucide-react";

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<AdminRole[]>([]);

  useEffect(() => {
    async function load() {
      const data = await adminService.getRoles();
      setRoles(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">RBAC Governance</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">System Roles & RBAC Matrix</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Configure role definitions, assign permission scopes, and enforce least-privilege security.</p>
          </div>

          <Button onClick={() => alert("Create New Role Modal")} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Role
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r) => (
            <Card key={r.id} className="border-slate-800 bg-slate-900/80 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    <span>{r.name}</span>
                  </h3>
                  <Badge variant="accent" className="text-[10px]">{r.permissionIds.length} Scope Rights</Badge>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => alert(`Editing permissions for ${r.name}`)}>
                  Configure Permissions
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
