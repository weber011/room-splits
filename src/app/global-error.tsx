"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught exception:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen p-4 font-sans">
        <div className="border border-rose-500/30 bg-slate-900 p-8 rounded-3xl max-w-md text-center space-y-4 shadow-2xl">
          <h1 className="text-2xl font-bold text-white">System Error (500)</h1>
          <p className="text-xs text-slate-400">
            A critical server error occurred. Please refresh or try again later.
          </p>
          <Button
            onClick={() => reset()}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
          >
            Reload Application
          </Button>
        </div>
      </body>
    </html>
  );
}
