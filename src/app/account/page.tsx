import { getAuthUserAction, signOutAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/common";
import { User, Mail, Phone, Shield, LogOut } from "lucide-react";

export default async function AccountPage() {
  const user = await getAuthUserAction();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <Badge variant="default" className="mb-2">User Profile</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Account & Settings
          </h1>
          <p className="text-sm text-slate-400">Manage your identity, role privileges, and active sessions.</p>
        </div>

        <form action={signOutAction}>
          <Button variant="danger" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-slate-800 bg-slate-900/90 text-center p-6 space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-emerald-400 font-extrabold text-2xl border border-slate-700">
            {user?.fullName?.[0] || "U"}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{user?.fullName || "Student Resident"}</h3>
            <p className="text-xs text-slate-400">{user?.email || "guest@roomsplits.com"}</p>
          </div>
          <div className="pt-2">
            <VerifiedBadge type="resident" />
          </div>
        </Card>

        <Card className="md:col-span-2 border-slate-800 bg-slate-900/90 p-6 space-y-6">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-white">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="flex items-center gap-2 text-slate-400">
                <User className="h-4 w-4 text-emerald-400" /> Full Name
              </span>
              <span className="font-semibold text-white">{user?.fullName || "Aarav Sharma"}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4 text-emerald-400" /> Email
              </span>
              <span className="font-semibold text-white">{user?.email || "aarav@example.com"}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4 text-emerald-400" /> Phone
              </span>
              <span className="font-semibold text-white">{user?.phone || "+91 98765 43210"}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="flex items-center gap-2 text-slate-400">
                <Shield className="h-4 w-4 text-emerald-400" /> Account Role
              </span>
              <Badge variant="accent" className="capitalize">
                {user?.role || "tenant"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
