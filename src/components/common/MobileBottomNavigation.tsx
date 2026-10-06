"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, CalendarCheck, Home, User, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Explore", href: "/", icon: Search },
  { name: "Visits", href: "/#schedule-visit", icon: CalendarCheck },
  { name: "My Stay", href: "/my-stay", icon: Home },
  { name: "Support", href: "/#complaints", icon: Wrench },
  { name: "Profile", href: "/#profile", icon: User },
];

export function MobileBottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-2 py-2">
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-[11px] font-semibold transition-all min-w-[56px]",
                isActive
                  ? "text-emerald-400"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                  isActive && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
