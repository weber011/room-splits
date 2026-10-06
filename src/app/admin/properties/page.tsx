"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminService, AdminPropertyRecord } from "@/services/admin.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eye } from "lucide-react";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<AdminPropertyRecord[]>([]);
  const [filter, setFilter] = useState("ALL");

  const loadProperties = async () => {
    const data = await adminService.getProperties();
    setProperties(data);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleApprove = async (id: string) => {
    await adminService.approveProperty(id);
    loadProperties();
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for property rejection:");
    if (reason) {
      await adminService.rejectProperty(id, reason);
      loadProperties();
    }
  };

  const handleSuspend = async (id: string) => {
    await adminService.suspendProperty(id);
    loadProperties();
  };

  const filtered = properties.filter((p) => {
    if (filter === "ALL") return true;
    return p.verificationStatus === filter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">Property Audit</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Properties Management</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Audit listings, issue official Verified badges, or suspend non-compliant stays.</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "PENDING_VERIFICATION", "VERIFIED", "DRAFT", "REJECTED", "SUSPENDED"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={filter === st ? "default" : "outline"}
              onClick={() => setFilter(st)}
              className="uppercase text-[10px]"
            >
              {st === "ALL" ? "All Properties" : st.replace("_", " ")}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prop) => (
            <Card key={prop.id} className="border-slate-800 bg-slate-900/80 p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-white line-clamp-1">{prop.title}</h3>
                  <Badge
                    variant={
                      prop.verificationStatus === "VERIFIED"
                        ? "accent"
                        : prop.verificationStatus === "PENDING_VERIFICATION"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[9px] uppercase shrink-0"
                  >
                    {prop.verificationStatus}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400">Owner: <strong className="text-white">{prop.ownerName}</strong> • {prop.city}</p>
                <p className="text-xs font-bold text-emerald-400">Starting Rent: ₹{prop.startingPrice}/mo</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Link href={`/property/${prop.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full gap-1 text-xs">
                      <Eye className="h-3.5 w-3.5" />
                      View Listing
                    </Button>
                  </Link>
                </div>

                <div className="flex gap-2">
                  {prop.verificationStatus !== "VERIFIED" && (
                    <Button size="sm" variant="default" onClick={() => handleApprove(prop.id)} className="flex-1 text-xs">
                      Approve Badge
                    </Button>
                  )}
                  {prop.verificationStatus !== "REJECTED" && (
                    <Button size="sm" variant="outline" onClick={() => handleReject(prop.id)} className="text-xs text-amber-400">
                      Reject
                    </Button>
                  )}
                  {prop.verificationStatus !== "SUSPENDED" && (
                    <Button size="sm" variant="danger" onClick={() => handleSuspend(prop.id)} className="text-xs">
                      Suspend
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
