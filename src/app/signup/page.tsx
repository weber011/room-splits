"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Building2, User, Loader2, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [role, setRole] = useState<"tenant" | "owner">("tenant");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    startTransition(async () => {
      const res = await signUpAction(formData);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (role === "owner") {
            router.push("/owner/dashboard");
          } else {
            router.push("/account");
          }
        }, 1200);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-radial-glow pointer-events-none opacity-60" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Room<span className="text-emerald-400">Splits</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400">Create your account to discover PGs or list your property.</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-4 text-center">
            <CardTitle className="text-xl">Create Your Account</CardTitle>
            <CardDescription className="text-xs">
              Select your account type to get started
            </CardDescription>

            {/* Role Selection Toggle */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  role === "tenant"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <User className="h-4 w-4" />
                Student / Resident
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  role === "owner"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Property Owner
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && <Alert variant="destructive">{errorMsg}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <Input
                  name="fullName"
                  placeholder="e.g. Aarav Sharma"
                  required
                  disabled={isPending}
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  disabled={isPending}
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone Number (Optional)</label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  disabled={isPending}
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  disabled={isPending}
                  className="bg-slate-950 border-slate-800"
                />
              </div>

              <Button type="submit" className="w-full gap-2" size="lg" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering Account...
                  </>
                ) : (
                  <>
                    Create {role === "owner" ? "Owner Account" : "Student Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              Already have a RoomSplits account?{" "}
              <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
