import { getAuthUserAction, signOutAction } from "@/app/actions/auth.actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ownerService } from "@/services/owner.service";
import { Button } from "@/components/ui/button";
import { DashboardStatCard } from "@/components/common/DashboardStatCard";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Building2,
  CheckCircle2,
  Home,
  Bed,
  CalendarCheck,
  Users,
  CreditCard,
  Wrench,
  Plus,
  LogOut,
  ArrowRight,
  Clock,
  ShieldAlert,
} from "lucide-react";

export default async function OwnerDashboardPage() {
  const user = await getAuthUserAction();

  // Server-side authorization check (never trust client alone)
  if (user && user.role !== "owner" && user.role !== "admin") {
    redirect("/unauthorized");
  }

  const stats = await ownerService.getDashboardStats();
  const properties = await ownerService.getProperties();
  const visits = await ownerService.getVisits();
  const complaints = await ownerService.getComplaints();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="owner" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="accent">Owner Portal</Badge>
              <Badge variant="outline" className="text-[10px]">Verified Partner</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Property Manager Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Welcome back, <strong className="text-white">{user?.fullName || "Property Owner"}</strong>. Overview of listings, room occupancy & rent collection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/owner/properties/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Property
              </Button>
            </Link>

            <form action={signOutAction}>
              <Button variant="danger" size="sm" className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>

        {/* Top 8 Dashboard Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <DashboardStatCard
            title="Total Properties"
            value={stats.totalProperties.toString()}
            change="Listings"
            icon={Building2}
          />
          <DashboardStatCard
            title="Active Properties"
            value={stats.activeProperties.toString()}
            change="Live Stays"
            icon={CheckCircle2}
          />
          <DashboardStatCard
            title="Total Rooms"
            value={stats.totalRooms.toString()}
            change="Capacity"
            icon={Home}
          />
          <DashboardStatCard
            title="Available Rooms"
            value={stats.availableRooms.toString()}
            change="Vacant Beds"
            icon={Bed}
          />
          <DashboardStatCard
            title="Pending Visits"
            value={stats.pendingVisits.toString()}
            change="Action Needed"
            icon={CalendarCheck}
          />
          <DashboardStatCard
            title="Confirmed Bookings"
            value={stats.confirmedBookings.toString()}
            change="Active Leases"
            icon={Users}
          />
          <DashboardStatCard
            title="Total Rent Collected"
            value={`₹${stats.totalCollectedRent.toLocaleString("en-IN")}`}
            change="This Month"
            icon={CreditCard}
          />
          <DashboardStatCard
            title="Pending Complaints"
            value={stats.pendingComplaints.toString()}
            change="Support Required"
            icon={Wrench}
          />
        </div>

        {/* Quick Action Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Property Summary */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                <span>My Properties Overview</span>
              </CardTitle>
              <Link href="/owner/properties" className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                <span>Manage All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {properties.slice(0, 3).map((prop) => (
                <div
                  key={prop.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{prop.title}</h4>
                      <Badge
                        variant={prop.status === "VERIFIED" ? "accent" : prop.status === "PENDING_VERIFICATION" ? "warning" : "secondary"}
                        className="text-[9px] uppercase px-1.5 py-0.5"
                      >
                        {prop.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{prop.location.locality}, {prop.location.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-400">₹{prop.startingPrice}/mo</p>
                    <Link href={`/owner/properties/${prop.id}/edit`}>
                      <span className="text-[11px] text-slate-400 hover:text-white underline">Edit Property</span>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending Visit Requests */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" />
                <span>Pending Visit Requests</span>
              </CardTitle>
              <Link href="/owner/visits" className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                <span>View All Visits</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {visits.filter((v) => v.status === "pending").length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No pending visit requests right now.</p>
              ) : (
                visits.filter((v) => v.status === "pending").map((visit) => (
                  <div
                    key={visit.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{visit.tenantName}</h4>
                      <p className="text-xs text-slate-400">{visit.propertyTitle}</p>
                      <p className="text-[11px] text-emerald-400 mt-0.5">{visit.visitDate} • {visit.visitSlot}</p>
                    </div>
                    <Link href="/owner/visits">
                      <Button size="sm" variant="outline" className="shrink-0">
                        Review Request
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Complaints Alert Banner */}
        {complaints.filter((c) => c.status === "open").length > 0 && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Action Required: Open Tenant Complaints</h4>
                <p className="text-xs opacity-90">You have {complaints.filter((c) => c.status === "open").length} open complaint requiring resolution.</p>
              </div>
            </div>
            <Link href="/owner/complaints">
              <Button size="sm" variant="warning">Resolve Now</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
