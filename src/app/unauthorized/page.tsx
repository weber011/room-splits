import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6 glass-panel rounded-3xl p-8 sm:p-10 border border-rose-500/30 shadow-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
            403 - Access Restricted
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Unauthorized Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            You do not have the required permissions or role to view this page. If you are an Owner or Admin, please sign in with your registered account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Sign In with Another Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
