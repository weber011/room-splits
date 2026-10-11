"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { visitService } from "@/services/visit.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Ticket, Calendar, Clock, Lock, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { PropertyUnlockButton } from "@/components/common/PropertyUnlockButton";

export interface VisitRequestSectionProps {
  propertyId: string;
  propertyTitle: string;
  isUnlocked: boolean;
  isLoggedIn: boolean;
  onTriggerUnlock?: () => void;
}

export function VisitRequestSection({
  propertyId,
  propertyTitle = "Property Access Pass",
  isUnlocked,
  isLoggedIn,
  onTriggerUnlock,
}: VisitRequestSectionProps) {
  const router = useRouter();

  // Get Today's date YYYY-MM-DD for min date picker restriction
  const todayStr = new Date().toISOString().split("T")[0];

  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("Evening (05:00 PM - 07:00 PM)");
  const [alternateDate, setAlternateDate] = useState("");
  const [alternateTime, setAlternateTime] = useState("");
  const [studentMessage, setStudentMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!preferredDate) {
      setErrorMessage("Please select a preferred visit date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await visitService.createVisitRequest({
        propertyId,
        preferredDate,
        preferredTime,
        alternateDate: alternateDate || undefined,
        alternateTime: alternateTime || undefined,
        studentMessage: studentMessage.trim() || undefined,
      });

      setSuccessMessage(`Visit request sent successfully! Token #${result.passCode}`);
      // Redirect to /visits after 1.5 seconds
      setTimeout(() => {
        router.push("/visits");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create visit request.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="h-6 w-6 text-emerald-400" />
            <span>Request a Property Visit Tour</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Schedule an in-person physical room inspection with the property owner.
          </p>
        </div>

        {isUnlocked ? (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs gap-1 self-start sm:self-auto">
            <CheckCircle2 className="h-3.5 w-3.5" />
            ₹9 Unlock Active
          </Badge>
        ) : (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs gap-1 self-start sm:self-auto">
            <Lock className="h-3.5 w-3.5" />
            Unlock Required
          </Badge>
        )}
      </div>

      {/* STATE 1: Logged Out User */}
      {!isLoggedIn && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 text-center space-y-4">
          <Lock className="h-10 w-10 text-slate-500 mx-auto" />
          <div>
            <h4 className="font-bold text-white text-base">Login Required</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Login to request a visit, view visit instructions, and contact the property owner.
            </p>
          </div>
          <Link href={`/login?redirect=/property/${propertyId}`}>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-2">
              <span>Login to Request Visit</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* STATE 2: Logged In Student WITHOUT ₹9 Unlock */}
      {isLoggedIn && !isUnlocked && (
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-center space-y-4">
          <Lock className="h-10 w-10 text-amber-400 mx-auto" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-200 text-base">Property Unlock Required</h4>
            <p className="text-xs text-amber-300/90 max-w-md mx-auto">
              Unlock this property for <strong>₹9</strong> to request a visit, view exact location, owner contact numbers, and visit instructions.
            </p>
          </div>
          <PropertyUnlockButton
            propertyId={propertyId}
            propertyTitle={propertyTitle}
            isUnlocked={isUnlocked}
            isLoggedIn={isLoggedIn}
            onUnlockSuccess={onTriggerUnlock}
            variant="button"
          />
        </div>
      )}

      {/* STATE 3: Logged In Student WITH Active ₹9 Unlock */}
      {isLoggedIn && isUnlocked && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Preferred Date */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>Preferred Date *</span>
              </label>
              <Input
                type="date"
                min={todayStr}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Preferred Time Slot */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Preferred Time Slot *</span>
              </label>
              <Select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                options={[
                  { value: "Morning (10:00 AM - 12:00 PM)", label: "Morning (10:00 AM - 12:00 PM)" },
                  { value: "Afternoon (02:00 PM - 04:00 PM)", label: "Afternoon (02:00 PM - 04:00 PM)" },
                  { value: "Evening (05:00 PM - 07:00 PM)", label: "Evening (05:00 PM - 07:00 PM)" },
                ]}
              />
            </div>

            {/* Alternate Date */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Alternate Date (Optional)</span>
              </label>
              <Input
                type="date"
                min={todayStr}
                value={alternateDate}
                onChange={(e) => setAlternateDate(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Alternate Time Slot */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Alternate Time Slot (Optional)</span>
              </label>
              <Select
                value={alternateTime}
                onChange={(e) => setAlternateTime(e.target.value)}
                options={[
                  { value: "", label: "No Alternate Time" },
                  { value: "Morning (10:00 AM - 12:00 PM)", label: "Morning (10:00 AM - 12:00 PM)" },
                  { value: "Afternoon (02:00 PM - 04:00 PM)", label: "Afternoon (02:00 PM - 04:00 PM)" },
                  { value: "Evening (05:00 PM - 07:00 PM)", label: "Evening (05:00 PM - 07:00 PM)" },
                ]}
              />
            </div>

            {/* Note/Message to Owner */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs text-slate-300 font-semibold">Message / Note to Owner (Optional)</label>
              <textarea
                rows={3}
                placeholder="e.g. I am a student at Ranchi University and would like to see the single room sharing options."
                value={studentMessage}
                onChange={(e) => setStudentMessage(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-slate-800">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Ticket className="h-4 w-4" />
                  <span>Submit Visit Request</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
