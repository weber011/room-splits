"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { visitService } from "@/services/visit.service";
import { Property } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarCheck, Ticket } from "lucide-react";

export interface VisitScheduleWidgetProps {
  property: Property;
}

export function VisitScheduleWidget({ property }: VisitScheduleWidgetProps) {
  const router = useRouter();
  const [date, setDate] = useState("2026-10-08");
  const [timeSlot, setTimeSlot] = useState("Evening (05:00 PM - 07:00 PM)");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fee = visitService.getVisitPassFee();

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const pass = await visitService.createVisitPassRequest({
        userId: "u-101",
        userName: "Aditya Kumar",
        userEmail: "aditya@example.com",
        userPhone: "+91 98765 43210",
        propertyId: property.id,
        propertyTitle: property.title,
        locality: property.location.locality,
        city: property.location.city,
        coverImage: property.coverImage,
        address: property.location.address,
        preferredDate: date,
        preferredTime: timeSlot,
      });

      router.push(`/visits/checkout/${pass.id}`);
    } catch {
      alert("Failed to create Visit Pass. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card id="schedule-visit" className="border-slate-800 bg-slate-900/90 p-6 space-y-4 sticky top-24">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-bold text-white text-lg flex items-center gap-2">
            <Ticket className="h-5 w-5 text-emerald-400" />
            <span>Schedule Physical Visit</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Verified visit pass includes direct owner contact & exact map pin.</p>
        </div>
      </div>

      <form onSubmit={handleScheduleVisit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-semibold">Select Preferred Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-semibold">Select Time Slot</label>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
            <option value="Afternoon (02:00 PM - 04:00 PM)">Afternoon (02:00 PM - 04:00 PM)</option>
            <option value="Evening (05:00 PM - 07:00 PM)">Evening (05:00 PM - 07:00 PM)</option>
          </select>
        </div>

        {/* Configurable Fee Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-300 block">Visit Pass Token Fee</span>
            <span className="text-[10px] text-slate-400">100% Refundable on Move-in</span>
          </div>
          <strong className="text-lg font-bold text-emerald-400">₹{fee}</strong>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full gap-2" size="lg">
          <CalendarCheck className="h-4 w-4" />
          Get Visit Pass (₹{fee})
        </Button>
      </form>
    </Card>
  );
}
