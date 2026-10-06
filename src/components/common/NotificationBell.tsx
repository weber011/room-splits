"use client";

import { useEffect, useState, useRef } from "react";
import { notificationService } from "@/services/notification.service";
import { AppNotification, NotificationType } from "@/types/notification.types";
import { Badge } from "@/components/ui/badge";
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
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications("u-101");
      setNotifications(data);
      const count = await notificationService.getUnreadCount("u-101");
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    await loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead("u-101");
    await loadNotifications();
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "VISIT_CONFIRMED":
      case "VISIT_RESCHEDULED":
        return <CalendarCheck className="h-4 w-4 text-emerald-400" />;
      case "BOOKING_CONFIRMED":
        return <Building className="h-4 w-4 text-blue-400" />;
      case "PAYMENT_SUCCESS":
      case "RENT_DUE":
        return <CreditCard className="h-4 w-4 text-emerald-400" />;
      case "PAYMENT_FAILED":
        return <AlertCircle className="h-4 w-4 text-rose-400" />;
      case "COMPLAINT_UPDATED":
        return <Wrench className="h-4 w-4 text-amber-400" />;
      case "DEPOSIT_SETTLEMENT":
      case "CHECKOUT_UPDATED":
        return <LogOut className="h-4 w-4 text-purple-400" />;
      default:
        return <Sparkles className="h-4 w-4 text-emerald-400" />;
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
        return `/notifications`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden text-xs text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px]">
                  {unreadCount} Unread
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">No notifications found.</div>
            ) : (
              notifications.slice(0, 6).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-800/40 transition-colors cursor-pointer ${
                    !notif.read ? "bg-slate-950/60 border-l-2 border-l-emerald-400" : ""
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-xs">{notif.title}</h4>
                      {!notif.read && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <Link
                        href={getEntityLink(notif)}
                        onClick={() => setOpen(false)}
                        className="text-[10px] text-emerald-400 hover:underline flex items-center font-semibold"
                      >
                        <span>View</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-950 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-emerald-400 hover:underline block py-1"
            >
              View All Notifications Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
