"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { Booking } from "@/types/booking.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShieldCheck, Home, Calendar, MapPin, ArrowLeft, CheckCircle2, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BookingCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooking() {
      try {
        const bk = await bookingService.getBookingById(resolvedParams.id);
        if (bk) {
          setBooking(bk);
        }
      } catch (err) {
        console.error("Failed to load booking details", err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading Booking Checkout...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="border-slate-800 bg-slate-900/90 p-8 max-w-md text-center space-y-4">
          <Home className="h-12 w-12 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
          <p className="text-xs text-slate-400">The booking reservation request you are looking for does not exist.</p>
          <Link href="/discover">
            <Button size="sm">Explore Properties</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as unknown as { Razorpay: unknown }).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayBooking = async () => {
    if (booking?.paymentStatus === "PAID") {
      router.push(`/bookings/${booking.id}?confirmed=true`);
      return;
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      // 1. Create Server-Side Razorpay Order
      const res = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentType: "ROOM_BOOKING",
          relatedBookingId: booking.id,
          relatedPropertyId: booking.property.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to create payment order.");
      }

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();

      if (scriptLoaded && typeof window !== "undefined" && (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay) {
        const options = {
          key: data.razorpayKeyId,
          amount: data.amountInPaise,
          currency: data.currency || "INR",
          name: "RoomSplits",
          description: `Initial Rent & Deposit — ${booking.property.title}`,
          order_id: data.razorpayOrderId,
          handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
            try {
              const verifyRes = await fetch("/api/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                router.push(`/bookings/${booking.id}?confirmed=true&paid=true`);
              } else {
                setPaymentError(verifyData.error || "Payment verification failed.");
                setProcessingPayment(false);
              }
            } catch {
              setPaymentError("Network error during payment verification.");
              setProcessingPayment(false);
            }
          },
          modal: {
            ondismiss: function () {
              setProcessingPayment(false);
            },
          },
          prefill: {
            name: booking.user.fullName,
            email: booking.user.email,
            contact: booking.user.phone,
          },
          theme: {
            color: "#10b981",
          },
        };

        const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay(options);
        rzp.open();
      } else {
        // Fallback for offline/test environments
        const updated = await bookingService.payBooking(booking.id);
        if (updated) {
          router.push(`/bookings/${updated.id}?confirmed=true&paid=true`);
        } else {
          setPaymentError("Payment verification failed.");
        }
        setProcessingPayment(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPaymentError(err.message);
      } else {
        setPaymentError("An error occurred during payment processing.");
      }
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/bookings/new" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Room Selection</span>
        </Link>
        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
          Step 2 of 3: Payment Checkout
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="h-7 w-7 text-emerald-400" />
              <span>Pay & Complete Room Booking</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Complete payment of monthly rent, security deposit, and platform fee to lock your room.
            </p>
          </div>

          {paymentError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-rose-200">Payment Process Alert</strong>
                <span>{paymentError}</span>
              </div>
            </div>
          )}

          {/* Property & Room Summary Card */}
          <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                <Image
                  src={booking.property.coverImage || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
                  alt={booking.property.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1">
                <Badge variant="secondary" className="text-[10px] uppercase font-bold">Room Reservation</Badge>
                <h3 className="font-bold text-white text-base leading-snug">{booking.property.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{booking.property.locality}, {booking.property.city}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Room Sharing & Number</span>
                <strong className="text-white font-bold block">{booking.room.sharingType} ({booking.room.roomNumber})</strong>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Target Move-In Date
                </span>
                <strong className="text-white font-bold block">{booking.moveInDate}</strong>
              </div>
            </div>
          </Card>

          {/* Booking Protection Benefits */}
          <Card className="border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              RoomSplits Tenancy Guarantee
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant bed reservation lock preventing double booking.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Digitally signed tenancy agreement receipt generated immediately.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Security deposit held safely until official move-in check.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Right Column: Payment Box */}
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900 p-6 space-y-5">
            <h3 className="font-bold text-white text-lg border-b border-slate-800 pb-3">Order Summary</h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>First Month Rent</span>
                <span className="font-semibold text-white">₹{booking.monthlyRent.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit</span>
                <span className="font-semibold text-white">₹{booking.securityDeposit.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Facilitation Fee</span>
                <span className="font-semibold text-emerald-400">₹{booking.platformCharges}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-bold text-white">
                <span>Total Amount Payable</span>
                <span className="text-emerald-400 text-xl">₹{booking.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {booking.paymentStatus === "PAID" ? (
              <Button
                onClick={() => router.push(`/bookings/${booking.id}?confirmed=true`)}
                size="lg"
                className="w-full gap-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Payment Completed — View Digital Pass</span>
              </Button>
            ) : (
              <Button
                onClick={handlePayBooking}
                disabled={processingPayment}
                size="lg"
                className="w-full gap-2 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950"
              >
                {processingPayment ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    <span>Processing Razorpay Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Pay ₹{booking.totalAmount.toLocaleString("en-IN")} via Razorpay</span>
                  </>
                )}
              </Button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Razorpay Abstraction Payment Gateway</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
