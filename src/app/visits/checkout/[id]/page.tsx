"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { visitService } from "@/services/visit.service";
import { VisitPass } from "@/types/visit.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShieldCheck, Ticket, Calendar, Clock, MapPin, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function VisitCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [visitPass, setVisitPass] = useState<VisitPass | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPass() {
      try {
        const pass = await visitService.getVisitPassById(resolvedParams.id);
        if (pass) {
          setVisitPass(pass);
        }
      } catch (err) {
        console.error("Failed to load visit pass", err);
      } finally {
        setLoading(false);
      }
    }
    loadPass();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading Visit Pass Checkout...</p>
        </div>
      </div>
    );
  }

  if (!visitPass) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="border-slate-800 bg-slate-900/90 p-8 max-w-md text-center space-y-4">
          <Ticket className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Visit Pass Not Found</h2>
          <p className="text-xs text-slate-400">The visit pass request you are looking for does not exist or has expired.</p>
          <Link href="/discover">
            <Button size="sm">Browse Properties</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handlePayVisitPass = async () => {
    setProcessingPayment(true);
    setPaymentError(null);

    try {
      const updatedPass = await visitService.payVisitPass(visitPass.id);
      if (updatedPass) {
        router.push(`/visits/${updatedPass.id}?confirmed=true`);
      } else {
        setPaymentError("Payment process failed. Please try again.");
      }
    } catch {
      setPaymentError("An error occurred during payment simulation.");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href={`/property/${visitPass.property.id}`} className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Property</span>
        </Link>
        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
          Step 2 of 3: Pay Visit Pass
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Details (Left 2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Ticket className="h-7 w-7 text-emerald-400" />
              <span>Confirm & Pay Visit Pass</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Unlock exact property location address, navigation route, and verified owner direct phone number.
            </p>
          </div>

          {/* Property Summary Card */}
          <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-24 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                <Image
                  src={visitPass.property?.coverImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"}
                  alt={visitPass.property?.title || "Property"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <Badge variant="secondary" className="text-[10px] uppercase font-bold">Physical Visit Pass</Badge>
                <h3 className="font-bold text-white text-base leading-snug">{visitPass.property?.title || "Property"}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{visitPass.property?.locality || "Locality"}, {visitPass.property?.city || "City"}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Date
                </span>
                <span className="font-bold text-white block">{visitPass.preferredDate}</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" /> Time Slot
                </span>
                <span className="font-bold text-white block truncate">{visitPass.preferredTime}</span>
              </div>
            </div>
          </Card>

          {/* Guarantee / Privacy Benefits */}
          <Card className="border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              What happens after you pay?
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant Digital Ticket with QR Verification Code.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Exact Google Maps directions & building number revealed.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Owner direct mobile phone & WhatsApp contact unmasked.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100% Visit Pass fee (₹{visitPass.visitPassAmount}) adjusted into your first month rent deposit upon move-in.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Order Summary & Payment Box (Right col) */}
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900 p-6 space-y-5">
            <h3 className="font-bold text-white text-lg border-b border-slate-800 pb-3">Payment Summary</h3>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Visit Pass Token Fee</span>
                <span className="font-semibold text-white">₹{visitPass.visitPassAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>GST / Service Tax</span>
                <span className="font-semibold text-emerald-400">₹0 (Waived)</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-bold text-white">
                <span>Total Amount Payable</span>
                <span className="text-emerald-400 text-lg">₹{visitPass.visitPassAmount}</span>
              </div>
            </div>

            {paymentError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {paymentError}
              </div>
            )}

            <Button
              onClick={handlePayVisitPass}
              disabled={processingPayment}
              size="lg"
              className="w-full gap-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950"
            >
              {processingPayment ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Pay ₹{visitPass.visitPassAmount} & Confirm Visit</span>
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Razorpay Abstracted Payment Simulation</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
