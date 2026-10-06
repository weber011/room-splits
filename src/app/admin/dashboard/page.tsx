import { getAuthUserAction, signOutAction } from "@/app/actions/auth.actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { DashboardStatCard } from "@/components/common/DashboardStatCard";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  Building2,
  CheckCircle2,
  ShieldAlert,
  CalendarCheck,
  CreditCard,
  Wrench,
  Clock,
  LogOut,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getAuthUserAction();

  // Server-side authorization check (never trust client alone)
  if (user && user.role !== "admin") {
    redirect("/unauthorized");
  }

  const stats = await adminService.getDashboardStats();
  const pendingProps = await adminService.getProperties();
  const auditLogs = await adminService.getAuditLogs();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">Admin Console</Badge>
              <Badge variant="outline" className="text-[10px]">Super Administrator</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Master Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Welcome back, <strong className="text-white">{user?.fullName || "Administrator"}</strong>. Monitor platform health, KYC verifications, and property approvals.
            </p>
          </div>

          <form action={signOutAction}>
            <Button variant="danger" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>

        {/* 9 Admin Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
          <DashboardStatCard
            title="Total Platform Users"
            value={stats.totalUsers.toString()}
            change="Students & Owners"
            icon={Users}
          />
          <DashboardStatCard
            title="Registered Owners"
            value={stats.totalOwners.toString()}
            change="Property Managers"
            icon={Building2}
          />
          <DashboardStatCard
            title="Total Properties"
            value={stats.totalProperties.toString()}
            change="Listings"
            icon={Building2}
          />
          <DashboardStatCard
            title="Pending Property Verifications"
            value={stats.pendingVerification.toString()}
            change="Requires Audit"
            icon={ShieldAlert}
          />
          <DashboardStatCard
            title="Verified Properties"
            value={stats.verifiedProperties.toString()}
            change="Active Badges"
            icon={CheckCircle2}
          />
          <DashboardStatCard
            title="Total Scheduled Visits"
            value={stats.totalVisits.toString()}
            change="Tours"
            icon={CalendarCheck}
          />
          <DashboardStatCard
            title="Total Bookings"
            value={stats.totalBookings.toString()}
            change="Active Leases"
            icon={Users}
          />
          <DashboardStatCard
            title="Gross Revenue Volume"
            value={`₹${stats.grossRevenue.toLocaleString("en-IN")}`}
            change="Platform Total"
            icon={CreditCard}
          />
          <DashboardStatCard
            title="Pending Complaints"
            value={stats.pendingComplaints.toString()}
            change="Support Action"
            icon={Wrench}
          />
        </div>

        {/* Action Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Verification Queue */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <span>Property Verification Queue</span>
              </CardTitle>
              <Link href="/admin/property-verification" className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1">
                <span>View Full Audit Queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {pendingProps.filter((p) => p.verificationStatus === "PENDING_VERIFICATION").length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No properties waiting for audit.</p>
              ) : (
                pendingProps.filter((p) => p.verificationStatus === "PENDING_VERIFICATION").map((prop) => (
                  <div
                    key={prop.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{prop.title}</h4>
                      <p className="text-xs text-slate-400">{prop.ownerName} • {prop.city}</p>
                    </div>
                    <Link href="/admin/property-verification">
                      <Button size="sm" variant="warning">
                        Review Listing
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Audit Logs Trail Preview */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <CardHeader className="p-0 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span>Security Audit Logs</span>
              </CardTitle>
              <Link href="/admin/audit-logs" className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                <span>View All Logs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-white">
                    <span className="text-emerald-400">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp.split("T")[0]}</span>
                  </div>
                  <p className="text-slate-300">{log.metadata || `Entity: ${log.targetEntity} (${log.targetId})`}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Actor: {log.actorEmail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
