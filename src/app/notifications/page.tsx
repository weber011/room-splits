"use client";

import { useEffect, useState } from "react";
import { notificationService } from "@/services/notification.service";
import { AppNotification, NotificationType } from "@/types/notification.types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCheck,
  CreditCard,
  CalendarCheck,
  Building,
  Wrench,
  LogOut,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Mail,
  MessageSquare,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const loadData = async () => {
    try {
      const data = await notificationService.getNotifications("u-101");
      setNotifications(data);
      const count = await notificationService.getUnreadCount("u-101");
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to load notifications page data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    await loadData();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead("u-101");
    await loadData();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "VISIT_CONFIRMED":
      case "VISIT_RESCHEDULED":
        return <CalendarCheck className="h-5 w-5 text-emerald-400" />;
      case "BOOKING_CONFIRMED":
        return <Building className="h-5 w-5 text-blue-400" />;
      case "PAYMENT_SUCCESS":
      case "RENT_DUE":
        return <CreditCard className="h-5 w-5 text-emerald-400" />;
      case "PAYMENT_FAILED":
        return <AlertCircle className="h-5 w-5 text-rose-400" />;
      case "COMPLAINT_UPDATED":
        return <Wrench className="h-5 w-5 text-amber-400" />;
      case "DEPOSIT_SETTLEMENT":
      case "CHECKOUT_UPDATED":
        return <LogOut className="h-5 w-5 text-purple-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-emerald-400" />;
    }
  };

  const getEntityLink = (notif: AppNotification) => {
    switch (notif.relatedEntity) {
      case "payment":
        return `/payments/${notif.relatedEntityId}`;
      case "visit":
        return `/visits/${notif.relatedEntityId}`;
      case "booking":
        return `/bookings/${notif.relatedEntityId}`;
      case "complaint":
        return `/complaints`;
      case "stay":
      case "checkout":
        return `/my-stay`;
      default:
        return `#`;
    }
  };

  const filtered = notifications.filter((n) => {
    if (typeFilter === "UNREAD") return !n.read;
    if (typeFilter === "PAYMENTS") return n.type === "PAYMENT_SUCCESS" || n.type === "RENT_DUE" || n.type === "PAYMENT_FAILED";
    if (typeFilter === "VISITS") return n.type === "VISIT_CONFIRMED" || n.type === "BOOKING_CONFIRMED" || n.type === "VISIT_RESCHEDULED";
    if (typeFilter === "SUPPORT") return n.type === "COMPLAINT_UPDATED";
    if (typeFilter === "SETTLEMENT") return n.type === "DEPOSIT_SETTLEMENT" || n.type === "CHECKOUT_UPDATED";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-2">Notification Center</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="h-8 w-8 text-emerald-400" />
            <span>In-App & Multi-Channel Alerts</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time notifications for rent dues, payment receipts, visit confirmations, and complaint updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-1.5 text-xs self-start sm:self-auto"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark All ({unreadCount}) As Read</span>
          </Button>
        )}
      </div>

      {/* External Multi-Channel Dispatcher Banner */}
      <Card className="border-slate-800 bg-slate-900/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Multi-Channel Delivery Providers Connected</h4>
            <p className="text-[11px] text-slate-400">All notifications auto-dispatched to In-App, Email, SMS & WhatsApp adapters.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 gap-1">
            <Mail className="h-3 w-3" /> Email (AWS SES)
          </Badge>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 gap-1">
            <Smartphone className="h-3 w-3" /> SMS (Twilio)
          </Badge>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 gap-1">
            <MessageSquare className="h-3 w-3" /> WhatsApp Business API
          </Badge>
        </div>
      </Card>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80 no-scrollbar">
        {[
          { id: "ALL", label: "All Alerts" },
          { id: "UNREAD", label: `Unread (${unreadCount})` },
          { id: "PAYMENTS", label: "Payments & Rent" },
          { id: "VISITS", label: "Visits & Bookings" },
          { id: "SUPPORT", label: "Support & Maintenance" },
          { id: "SETTLEMENT", label: "Deposit & Settlement" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              typeFilter === tab.id
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-md"
                : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center border-slate-800 bg-slate-900/80 text-xs text-slate-400">
            No notifications found for this filter tab.
          </Card>
        ) : (
          filtered.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !notif.read
                  ? "bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                  : "bg-slate-900/50 border-slate-800/80"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-white text-sm">{notif.title}</h4>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono border-slate-700 text-slate-400">
                      {notif.type.replace("_", " ")}
                    </Badge>
                    {!notif.read && (
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[9px]">
                        UNREAD
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>

                  <span className="text-[11px] text-slate-500 block pt-0.5">
                    {new Date(notif.created_at).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-center">
                {!notif.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="h-8 text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Mark Read
                  </Button>
                )}

                <Link href={getEntityLink(notif)}>
                  <Button size="sm" variant="outline" className="h-8 text-xs text-slate-300 border-slate-700 hover:bg-slate-800 gap-1">
                    <span>View</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
