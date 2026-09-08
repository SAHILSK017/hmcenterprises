"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Smartphone,
  Package,
  MapPin,
  LogOut,
  ArrowUpRight,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const LINKS = [
  {
    href: "/account/repairs",
    label: "My repairs",
    icon: Wrench,
    desc: "Track repair requests",
    code: "01",
  },
  {
    href: "/account/sells",
    label: "My sell requests",
    icon: Smartphone,
    desc: "Buyback offers & status",
    code: "02",
  },
  {
    href: "/account/orders",
    label: "My orders",
    icon: Package,
    desc: "Shop order history",
    code: "03",
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: MapPin,
    desc: "Saved shipping addresses",
    code: "04",
  },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f5f7fb]">
        <div className="h-40 w-full max-w-3xl animate-pulse rounded-3xl bg-white" />
      </div>
    );
  }

  const initial = (user?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f5f7fb] text-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,113,227,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,113,227,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 75% 55% at 50% 0%, black 15%, transparent 72%)",
        }}
      />
      <div className="pointer-events-none absolute left-1/3 top-0 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-[#0071e3]/10 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-6 border-b border-black/[0.06] pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#0071e3]/20 bg-[#0071e3]/10 font-display text-2xl font-bold text-[#0071e3]">
              {initial}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0071e3] text-white shadow-sm">
                <Shield className="h-3 w-3" />
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#0071e3]">
                My account
              </p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-[#111] sm:text-4xl">
                {user?.name || "Account"}
              </h1>
              <p className="mt-1.5 text-sm font-medium text-foreground/50">{user?.email}</p>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="mt-3 inline-flex text-xs font-bold uppercase tracking-wider text-[#0071e3] hover:underline"
                >
                  Open admin dashboard →
                </Link>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10",
              "bg-white px-5 text-sm font-bold text-foreground/80 shadow-sm",
              "transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            )}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>

        <div className="mt-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/35">
            Control center
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#111]">
            Manage your HMC activity
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-black/[0.06]",
                  "bg-white p-5 shadow-sm transition-all duration-200",
                  "hover:border-[#0071e3]/35 hover:shadow-[0_12px_40px_rgba(0,113,227,0.1)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0071e3]/10 text-[#0071e3] transition-colors group-hover:bg-[#0071e3] group-hover:text-white">
                      <l.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground/30">{l.code}</p>
                      <h3 className="mt-0.5 font-display text-lg font-bold text-[#111]">{l.label}</h3>
                      <p className="mt-1 text-sm text-foreground/50">{l.desc}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-foreground/25 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0071e3]" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f7fb] text-foreground/45">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111]">Session active</p>
              <p className="text-xs text-foreground/45">Signed in securely on this device</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#111] px-5 text-sm font-bold text-white transition hover:bg-[#0071e3]"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
