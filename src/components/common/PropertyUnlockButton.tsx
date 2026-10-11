"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

export interface PropertyUnlockButtonProps {
  propertyId: string;
  propertyTitle: string;
  isUnlocked: boolean;
  isLoggedIn: boolean;
  onUnlockSuccess?: () => void;
  variant?: "banner" | "button" | "card";
}

export function PropertyUnlockButton({
  propertyId,
  propertyTitle,
  isUnlocked: initialIsUnlocked,
  isLoggedIn,
  onUnlockSuccess,
  variant = "banner",
}: PropertyUnlockButtonProps) {
  const router = useRouter();

  const [isUnlocked, setIsUnlocked] = useState(initialIsUnlocked);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelledMessage, setCancelledMessage] = useState<string | null>(null);

  // Helper: Dynamically load Razorpay Checkout SDK Script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      // If already loaded
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUnlockClick = async () => {
    setErrorMessage(null);
    setCancelledMessage(null);

    // 1. Check Authentication
    if (!isLoggedIn) {
      router.push(`/login?redirect=/property/${propertyId}`);
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Load Razorpay SDK
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setErrorMessage("Payment service is temporarily unavailable. Please try again.");
        setIsProcessing(false);
        return;
      }

      // 3. Request Server to Create Razorpay Order for ₹9
      const orderRes = await fetch("/api/payments/property-unlock/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || orderData.error) {
        setErrorMessage(orderData.error || "Failed to initiate ₹9 Property Unlock payment.");
        setIsProcessing(false);
        return;
      }

      // If user already holds an active unlock
      if (orderData.isAlreadyUnlocked) {
        setIsUnlocked(true);
        setIsProcessing(false);
        if (onUnlockSuccess) onUnlockSuccess();
        router.refresh();
        return;
      }

      const { razorpayOrderId, razorpayKeyId, amountInPaise, currency } = orderData;

      // 4. Open Official Razorpay Checkout Modal
      const options = {
        key: razorpayKeyId,
        amount: amountInPaise || 900,
        currency: currency || "INR",
        name: "RoomSplits",
        description: `₹9 Property Access Pass: ${propertyTitle}`,
        order_id: razorpayOrderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            // 5. Verify Signature & Amount on Server
            const verifyRes = await fetch("/api/payments/property-unlock/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setIsUnlocked(true);
              setIsProcessing(false);
              if (onUnlockSuccess) onUnlockSuccess();
              router.refresh();
            } else {
              setErrorMessage(verifyData.error || "Payment verification failed. Your property has not been unlocked.");
              setIsProcessing(false);
            }
          } catch {
            setErrorMessage("Network error during payment verification. Please try again.");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setCancelledMessage("Payment cancelled. The property is still locked.");
          },
        },
        theme: {
          color: "#10b981", // Emerald 500
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", function (failResponse: any) {
        setIsProcessing(false);
        const failMsg = failResponse?.error?.description || "Payment failed. Your property has not been unlocked.";
        setErrorMessage(failMsg);
      });

      rzp.open();
    } catch (err: unknown) {
      console.error("Unlock Error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  // STATE: ALREADY UNLOCKED
  if (isUnlocked) {
    if (variant === "button") {
      return (
        <Button disabled variant="outline" size="sm" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 gap-1 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>✓ Property Unlocked</span>
        </Button>
      );
    }

    return (
      <Card className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>✓ Property Unlocked — Access Pass Active</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Your ₹9 Property Unlock gives you full access to property details and visit information. It does not reserve or book a room.
          </p>
        </div>
        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/20 shrink-0">
          Active Pass
        </Badge>
      </Card>
    );
  }

  // STATE: LOCKED (BEFORE PAYMENT)
  return (
    <div className="space-y-3">
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button onClick={handleUnlockClick} size="sm" variant="ghost" className="h-7 text-xs text-rose-300 hover:text-white underline gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {cancelledMessage && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{cancelledMessage}</span>
          </div>
          <Button onClick={handleUnlockClick} size="sm" variant="ghost" className="h-7 text-xs text-amber-200 hover:text-white underline gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Try Again</span>
          </Button>
        </div>
      )}

      {variant === "banner" ? (
        <Card className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/30 text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-base">
              <Lock className="h-5 w-5 text-amber-400 shrink-0" />
              <span>🔒 Exact Location &amp; Owner Contact Details Locked</span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Unlock exact street address, landlord phone number, WhatsApp contact &amp; visit instructions for <strong>₹9</strong>.
            </p>
            <p className="text-[11px] text-amber-400/90 font-medium italic">
              Note: ₹9 Property Unlock gives you access to property details and visit information. It does not reserve or book a room.
            </p>
          </div>
          <Button
            onClick={handleUnlockClick}
            disabled={isProcessing}
            size="lg"
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold gap-2 whitespace-nowrap text-xs sm:text-sm shadow-lg shrink-0"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Unlock for ₹9</span>
              </>
            )}
          </Button>
        </Card>
      ) : (
        <Button
          onClick={handleUnlockClick}
          disabled={isProcessing}
          size="lg"
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold gap-2 text-xs shadow-lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Unlock for ₹9</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
