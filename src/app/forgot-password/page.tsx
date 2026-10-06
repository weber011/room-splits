"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Building2, Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleForgotPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await forgotPasswordAction(formData);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-12 relative overflow-hidden">
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
          <p className="text-xs text-slate-400">Reset your password via email recovery link.</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl">Forgot Password?</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered email address below and we will send you a password reset link.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && <Alert variant="destructive">{errorMsg}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}

            <form onSubmit={handleForgotPassword} className="space-y-4">
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

              <Button type="submit" className="w-full gap-2" size="lg" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Password Reset Link
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-slate-800/80">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
