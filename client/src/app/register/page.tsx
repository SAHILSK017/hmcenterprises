"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { AuthField, AuthPasswordField, AuthShell, AuthSubmitButton } from "@/components/auth/auth-shell";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.trim().length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await register({
        name: String(fd.get("name")),
        phone: String(fd.get("phone")),
        email: String(fd.get("email")),
        password,
      });
      toast.success("Account created successfully!");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      mode="register"
      title="Join HMC Mobile"
      subtitle="Create your account to track repairs, sell phones, and shop."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-[#0F766E] hover:text-[#06B6D4] hover:underline transition-colors">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        <AuthField
          id="name"
          name="name"
          type="text"
          label="Full name"
          autoComplete="name"
          required
          placeholder="Your name"
        />
        <AuthField
          id="phone"
          name="phone"
          type="tel"
          label="Mobile number"
          autoComplete="tel"
          required
          placeholder="10-digit mobile"
        />
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
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="At least 6 characters"
          showValidation={true}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AuthSubmitButton busy={busy} busyLabel="Creating account…">
          Create account
        </AuthSubmitButton>
      </form>

      <OAuthButtons mode="register" />
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f5f7fb]">
          <div className="h-80 w-full max-w-md animate-pulse rounded-[28px] bg-white" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
