"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error Boundary caught exception:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <Card className="border-rose-500/30 bg-slate-900/90 p-8 sm:p-10 max-w-lg text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-rose-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Something Went Wrong</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            An unexpected error occurred while processing your request. Our team has been notified.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={() => reset()}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-2 text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
