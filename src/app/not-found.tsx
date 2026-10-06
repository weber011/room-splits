import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <Card className="border-slate-800 bg-slate-900/90 p-8 sm:p-12 max-w-lg text-center space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto h-20 w-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <span className="text-3xl font-extrabold text-emerald-400">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            The property listing, stay record, or page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/discover" className="w-full sm:w-auto">
            <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-2 text-xs">
              <Search className="h-4 w-4" />
              <span>Browse Properties</span>
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs gap-2">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
