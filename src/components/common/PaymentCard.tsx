import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "./PriceDisplay";
import { CreditCard, Download } from "lucide-react";
import { PaymentTransaction } from "@/types";

export interface PaymentCardProps {
  payment: PaymentTransaction;
  onDownloadInvoice?: (id: string) => void;
  className?: string;
}

export function PaymentCard({ payment, onDownloadInvoice, className }: PaymentCardProps) {
  const isSuccess = payment.status === "SUCCESS";

  return (
    <Card className={`border-slate-800 bg-slate-900/90 p-5 space-y-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isSuccess ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm capitalize">
              {payment.paymentType.replace("_", " ")}
            </h4>
            <span className="text-[11px] text-slate-400">
              {payment.paidAt || payment.createdAt}
            </span>
          </div>
        </div>
        <Badge variant={isSuccess ? "default" : "warning"} className="capitalize">
          {payment.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <PriceDisplay amount={payment.amount} label="Amount Paid" size="sm" />
        {onDownloadInvoice && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownloadInvoice(payment.id)}
            className="gap-1.5 text-xs text-slate-300 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            Receipt
          </Button>
        )}
      </div>
    </Card>
  );
}
