"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/common/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [platformCommission, setPlatformCommission] = useState("5.0");
  const [minLockInMonths, setMinLockInMonths] = useState("3");
  const [requireAadhaarKyc, setRequireAadhaarKyc] = useState(true);
  const [enableAutoAuditAlerts, setEnableAutoAuditAlerts] = useState(true);

  const handleSave = () => {
    alert("System settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      <DashboardSidebar role="admin" />

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Badge variant="warning" className="mb-2">System Config</Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Master Settings</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Configure global platform commission rates, lock-in defaults, and security flags.</p>
          </div>

          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Financial & Booking Defaults</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Platform Convenience Commission (%)</label>
              <Input value={platformCommission} onChange={(e) => setPlatformCommission(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Default Lock-In Period (Months)</label>
              <Input value={minLockInMonths} onChange={(e) => setMinLockInMonths(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/80 p-6 space-y-6">
          <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">Security & Compliance Rules</h3>

          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">Mandatory Aadhaar / PAN KYC for Owners</span>
                <span className="text-slate-400 text-[11px]">Enforce document upload before property verification badge can be requested.</span>
              </div>
              <input
                type="checkbox"
                checked={requireAadhaarKyc}
                onChange={(e) => setRequireAadhaarKyc(e.target.checked)}
                className="rounded accent-emerald-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">Automated Security Audit Alerts</span>
                <span className="text-slate-400 text-[11px]">Send real-time alerts on sensitive admin mutations to security logs.</span>
              </div>
              <input
                type="checkbox"
                checked={enableAutoAuditAlerts}
                onChange={(e) => setEnableAutoAuditAlerts(e.target.checked)}
                className="rounded accent-emerald-500 h-4 w-4"
              />
            </label>
          </div>
        </Card>
      </main>
    </div>
  );
}
