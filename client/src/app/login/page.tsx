"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { AuthField, AuthPasswordField, AuthShell, AuthSubmitButton } from "@/components/auth/auth-shell";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = new FormData(e.currentTarget);
    try {
      const user = await login(String(data.get("email")), String(data.get("password")));
      toast.success("Welcome back");
      const callback =
        searchParams.get("callbackUrl") || searchParams.get("next") || null;
      if (callback) router.push(callback);
      else router.push(user.role === "admin" ? "/admin" : "/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      mode="login"
      title="Welcome back"
      subtitle="Access repairs, sell requests, and orders."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-semibold text-[#F97316] hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          placeholder="you@email.com"
        />
        <AuthPasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          minLength={6}
          placeholder="Enter your password"
        />
        <AuthSubmitButton busy={busy} busyLabel="Signing in…">
          Sign in
        </AuthSubmitButton>
      </form>

      <OAuthButtons mode="login" />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f5f7fb]">
          <div className="h-80 w-full max-w-md animate-pulse rounded-[28px] bg-white" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
