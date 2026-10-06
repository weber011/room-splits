"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Tabs } from "@/components/ui/tabs";
import { Building2, Shield, User, Loader2, ArrowRight } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [activeRole, setActiveRole] = useState("tenant");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);
    formData.set("role", activeRole);

    startTransition(async () => {
      const res = await signInAction(formData);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (activeRole === "admin") {
            router.push("/admin/dashboard");
          } else if (activeRole === "owner") {
            router.push("/owner/dashboard");
          } else {
            router.push(redirectTo);
          }
        }, 500);
      }
    });
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
      <CardHeader className="space-y-4">
        <div className="flex justify-center">
          <Tabs
            tabs={[
              { id: "tenant", label: "Student / Resident", icon: User },
              { id: "owner", label: "Property Owner", icon: Building2 },
              { id: "admin", label: "Admin", icon: Shield },
            ]}
            activeTab={activeRole}
            onChange={setActiveRole}
          />
        </div>
        <div className="text-center pt-2">
          <CardTitle className="text-xl">
            {activeRole === "admin"
              ? "Admin Super Portal Login"
              : activeRole === "owner"
              ? "Property Owner Dashboard Login"
              : "Resident & Student Login"}
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your registered credentials below
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMsg && <Alert variant="destructive">{errorMsg}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        <form onSubmit={handleLogin} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-emerald-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isPending}
              className="bg-slate-950 border-slate-800"
            />
          </div>

          <Button type="submit" className="w-full gap-2" size="lg" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          Don&apos;t have a RoomSplits account?{" "}
          <Link href="/signup" className="text-emerald-400 font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
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
          <p className="text-xs text-slate-400">Sign in to your account to manage visits, stays, and rent.</p>
        </div>

        <Suspense fallback={
          <div className="p-8 text-center text-slate-400 glass-panel rounded-3xl">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-emerald-400" />
            Loading authentication form...
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
