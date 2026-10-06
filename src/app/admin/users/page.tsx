"use client";

import { useState, useEffect } from "react";
import { adminService, AdminUserRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";


export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const loadUsers = async () => {
    const data = await adminService.getUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleSuspension = async (id: string) => {
    await adminService.toggleUserSuspension(id);
    loadUsers();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">User Control</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Users Directory</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage accounts, audit roles, and suspend problematic users across RoomSplits.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["ALL", "tenant", "owner", "admin"].map((r) => (
              <Button
                key={r}
                size="sm"
                variant={roleFilter === r ? "default" : "outline"}
                onClick={() => setRoleFilter(r)}
                className="capitalize text-xs"
              >
                {r}
              </Button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">KYC Status</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-950/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{u.fullName}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 capitalize font-semibold">{u.role}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.isVerified ? "accent" : "secondary"} className="text-[9px]">
                        {u.isVerified ? "KYC Verified" : "Unverified"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.isSuspended ? "danger" : "default"} className="text-[9px]">
                        {u.isSuspended ? "Suspended" : "Active"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{u.createdAt}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant={u.isSuspended ? "default" : "danger"}
                        onClick={() => handleToggleSuspension(u.id)}
                      >
                        {u.isSuspended ? "Reactivate User" : "Suspend Account"}
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
