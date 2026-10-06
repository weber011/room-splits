"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  Home,
  CalendarCheck,
  CreditCard,
  Wrench,
  Star,
  Users,
  Shield,
  Settings,
  LogOut,
} from "lucide-react";

export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export interface DashboardSidebarProps {
  role?: "tenant" | "owner" | "admin";
  className?: string;
}

const TENANT_NAV: SidebarItem[] = [
  { name: "My Account", href: "/account", icon: LayoutDashboard },
  { name: "My Active Stay", href: "/my-stay", icon: Home },
  { name: "Scheduled Visits", href: "/visits", icon: CalendarCheck },
  { name: "Bookings", href: "/bookings", icon: Building2 },
  { name: "Rent Payments", href: "/payments", icon: CreditCard },
  { name: "Support Complaints", href: "/complaints", icon: Wrench },
  { name: "Reviews & Feedback", href: "/reviews", icon: Star },
];

const OWNER_NAV: SidebarItem[] = [
  { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { name: "My Properties", href: "/owner/properties", icon: Building2, badge: "Manage" },
  { name: "Rooms & Beds", href: "/owner/rooms", icon: Home },
  { name: "Visit Requests", href: "/owner/visits", icon: CalendarCheck },
  { name: "Bookings", href: "/owner/bookings", icon: Users },
  { name: "Rent Collections", href: "/owner/payments", icon: CreditCard },
  { name: "Complaints", href: "/owner/complaints", icon: Wrench },
  { name: "Resident Reviews", href: "/owner/reviews", icon: Star },
  { name: "Account Verification", href: "/owner/account", icon: Shield },
];

const ADMIN_NAV: SidebarItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Owners", href: "/admin/owners", icon: Building2 },
  { name: "Owner Verification", href: "/admin/owner-verification", icon: Shield, badge: "KYC" },
  { name: "Properties", href: "/admin/properties", icon: Building2 },
  { name: "Property Verification", href: "/admin/property-verification", icon: Shield, badge: "Audit" },
  { name: "Visits", href: "/admin/visits", icon: CalendarCheck },
  { name: "Bookings", href: "/admin/bookings", icon: Users },
  { name: "Payments & Financials", href: "/admin/payments", icon: CreditCard },
  { name: "Complaints Center", href: "/admin/complaints", icon: Wrench },
  { name: "Reviews Moderation", href: "/admin/reviews", icon: Star },
  { name: "Admin Staff", href: "/admin/admin-users", icon: Users },
  { name: "Roles", href: "/admin/roles", icon: Shield },
  { name: "Permissions", href: "/admin/permissions", icon: Settings },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: Shield },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function DashboardSidebar({ role = "tenant", className }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navMap = {
    tenant: TENANT_NAV,
    owner: OWNER_NAV,
    admin: ADMIN_NAV,
  };

  const navItems = navMap[role];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col justify-between w-64 border-r border-slate-800 bg-slate-950 p-6 min-h-[calc(100vh-5rem)]",
        className
      )}
    >
      <div className="space-y-6">
        {/* Role Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200 capitalize tracking-wide">
            {role} Portal
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Settings & Sign Out */}
      <div className="pt-6 border-t border-slate-800 space-y-1.5">
        <Link
          href="#settings"
          className="flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-all"
        >
          <Settings className="h-4 w-4" />
          <span>Account Settings</span>
        </Link>
        <button
          className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
