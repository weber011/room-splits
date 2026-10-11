"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ownerService, OwnerProperty } from "@/services/owner.service";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2, Plus, Edit, Eye } from "lucide-react";

export default function OwnerPropertiesPage() {
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const loadProperties = async () => {
    setIsLoading(true);
    const data = await ownerService.getProperties();
    setProperties(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    try {
      await ownerService.togglePublish(id, !currentPublished);
      loadProperties();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle publication status.";
      alert(msg);
    }
  };

  const handleRequestVerification = async (id: string) => {
    try {
      await ownerService.submitForVerification(id);
      alert("Property submitted for Admin Verification.");
      loadProperties();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit verification.";
      alert(msg);
    }
  };

  const filteredProperties = properties.filter((p) => {
    if (statusFilter === "ALL") return true;
    return p.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="owner" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="accent" className="mb-2">Property Catalog</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Managed Properties</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage listings, edit pricing, add rooms, configure rules and request admin verification.</p>
          </div>

          <Link href="/owner/properties/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Property
            </Button>
          </Link>
        </div>

        {/* Status Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {["ALL", "DRAFT", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", "SUSPENDED"].map((st) => (
            <Button
              key={st}
              size="sm"
              variant={statusFilter === st ? "default" : "outline"}
              onClick={() => setStatusFilter(st)}
              className="uppercase text-[10px]"
            >
              {st === "ALL" ? "All Properties" : st.replace("_", " ")}
            </Button>
          ))}
        </div>

        {/* Properties Grid / Table */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <EmptyState
            title="No Properties Found"
            description="You don't have any properties matching this filter."
            actionLabel="Add Property"
            onAction={() => window.location.href = "/owner/properties/new"}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => (
              <Card key={prop.id} className="border-slate-800 bg-slate-900/80 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-white line-clamp-1">{prop.title}</h3>
                    <Badge
                      variant={
                        prop.status === "VERIFIED"
                          ? "accent"
                          : prop.status === "PENDING_VERIFICATION"
                          ? "warning"
                          : prop.status === "REJECTED"
                          ? "danger"
                          : "secondary"
                      }
                      className="text-[9px] uppercase shrink-0"
                    >
                      {prop.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{prop.location.address}, {prop.location.locality}, {prop.location.city}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Starting Rent</span>
                      <strong className="text-emerald-400 font-bold">₹{prop.startingPrice}/mo</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Lock-In Period</span>
                      <strong className="text-white font-bold">{prop.lockInMonths} Months</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  {/* Action row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Visibility:</span>
                      <button
                        onClick={() => handleTogglePublish(prop.id, prop.isPublished)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prop.isPublished
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {prop.isPublished ? "Published" : "Draft (Hidden)"}
                      </button>
                    </div>

                    {prop.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() => handleRequestVerification(prop.id)}
                        className="text-[10px]"
                      >
                        Submit Verification
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link href={`/owner/properties/${prop.id}/edit`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full gap-1.5">
                        <Edit className="h-3.5 w-3.5" />
                        Edit Property
                      </Button>
                    </Link>
                    <Link href={`/property/${prop.id}`}>
                      <Button size="sm" variant="ghost" className="gap-1">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
