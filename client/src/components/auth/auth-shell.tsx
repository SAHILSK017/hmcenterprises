"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

const POINTS = [
  { label: "01", title: "Track repairs", desc: "Live status on every device" },
  { label: "02", title: "Sell requests", desc: "Offers and updates in one place" },
  { label: "03", title: "Orders & shop", desc: "Checkout history, secured" },
];

type AuthShellProps = {
  mode: "login" | "register";
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({ mode, title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#F8FAFC]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(rgba(13,148,136,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13,148,136,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 30% 40%, black 20%, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-16 h-[380px] w-[380px] rounded-full bg-[#0D9488]/10 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-[#14B8A6]/10 blur-[100px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0D9488]/35 to-transparent" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl lg:grid-cols-2">
        <aside className="relative hidden flex-col justify-between px-10 py-12 lg:flex xl:px-14">
          <div>
            <Link href="/" className="inline-flex opacity-95 transition hover:opacity-100">
              <BrandLogo linked={false} className="h-8 w-[160px]" />
            </Link>
            <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0D9488]">
              HMC Secure Access
            </p>
            <h1 className="mt-4 max-w-md font-display text-4xl font-bold leading-[1.08] tracking-tight text-[#0F172A] xl:text-5xl">
              Your mobile world.
              <span className="mt-1 block text-[#0D9488]">One account.</span>
            </h1>
            <p className="mt-5 max-w-sm text-[15px] font-medium leading-relaxed text-[#64748B]">
              Repair tracking, buyback requests, and shop orders — built for speed and clarity.
            </p>
          </div>

          <ul className="space-y-4">
            {POINTS.map((p) => (
              <li
                key={p.label}
                className="flex items-start gap-4 rounded-2xl border border-black/[0.06] bg-white/80 px-4 py-3.5 shadow-xs backdrop-blur-sm"
              >
                <span className="font-display text-sm font-bold text-[#0D9488]">{p.label}</span>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{p.title}</p>
                  <p className="mt-0.5 text-xs text-[#64748B]">{p.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#94A3B8]">
            Encrypted session · HMC Mobile
          </p>
        </aside>

        <section className="relative flex items-center justify-center px-4 py-12 sm:px-8">
          <div
            className={cn(
              "w-full max-w-[420px] overflow-hidden rounded-[28px] border border-black/[0.06]",
              "bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
            )}
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#0D9488] via-[#14B8A6] to-[#0F766E]" />

            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <div className="mb-8 lg:hidden">
                <Link href="/">
                  <BrandLogo linked={false} className="h-7 w-[140px]" />
                </Link>
              </div>

              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0D9488] shadow-[0_0_10px_#0D9488]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0D9488]">
                  {mode === "login" ? "Sign in" : "Create account"}
                </p>
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#0F172A]">{title}</h2>
              <p className="mt-2 text-sm font-medium text-[#64748B]">{subtitle}</p>

              <div className="mt-8">{children}</div>
              <div className="mt-6 text-center text-sm text-[#64748B]">{footer}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AuthField({
  id,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B] transition-colors group-focus-within:text-[#0D9488]"
      >
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "h-12 w-full rounded-xl border border-black/10 bg-[#F8FAFC] px-4 text-sm text-[#0F172A]",
          "placeholder:text-[#94A3B8] outline-none transition-all duration-200",
          "hover:border-black/20 focus:border-[#0D9488]/70 focus:bg-white",
          "focus:shadow-[0_0_0_3px_rgba(13,148,136,0.15)]"
        )}
        {...props}
      />
    </div>
  );
}

export function AuthPasswordField({
  id = "password",
  name = "password",
  label = "Password",
  autoComplete,
  required = true,
  placeholder = "6+ characters",
  showValidation = false,
  value,
  onChange,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  showValidation?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [internalVal, setInternalVal] = useState("");
  const currentVal = value !== undefined ? String(value) : internalVal;
  const len = currentVal.length;
  const isValid = len >= 6;

  const hasNumOrSym = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(currentVal);
  const hasUpper = /[A-Z]/.test(currentVal);
  let strengthScore = 0;
  if (len >= 6) strengthScore = 1;
  if (len >= 6 && hasNumOrSym) strengthScore = 2;
  if (len >= 8 && hasNumOrSym && hasUpper) strengthScore = 3;

  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B] transition-colors group-focus-within:text-[#0D9488]"
        >
          {label}
        </label>
        {showValidation && len > 0 && (
          <span
            className={cn(
              "text-[11px] font-bold transition-colors",
              isValid ? "text-[#16A34A]" : "text-[#EF4444]"
            )}
          >
            {isValid ? "✓ Meets 6 character minimum" : `${6 - len} more char${6 - len === 1 ? "" : "s"} needed`}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          minLength={6}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => {
            setInternalVal(e.target.value);
            onChange?.(e);
          }}
          className={cn(
            "h-12 w-full rounded-xl border border-black/10 bg-[#F8FAFC] pl-4 pr-11 text-sm text-[#0F172A]",
            "placeholder:text-[#94A3B8] outline-none transition-all duration-200",
            "hover:border-black/20 focus:border-[#0D9488]/70 focus:bg-white",
            "focus:shadow-[0_0_0_3px_rgba(13,148,136,0.15)]",
            className
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors hover:text-slate-700"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {showValidation && len > 0 && (
        <div className="mt-2 space-y-1">
          <div className="flex h-1.5 w-full gap-1">
            <div
              className={cn(
                "h-full flex-1 rounded-full transition-all duration-300",
                len < 6 ? "bg-red-400" : "bg-[#16A34A]"
              )}
            />
            <div
              className={cn(
                "h-full flex-1 rounded-full transition-all duration-300",
                strengthScore >= 2 ? "bg-[#16A34A]" : "bg-slate-200"
              )}
            />
            <div
              className={cn(
                "h-full flex-1 rounded-full transition-all duration-300",
                strengthScore >= 3 ? "bg-[#16A34A]" : "bg-slate-200"
              )}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {strengthScore === 0 && "Minimum 6 characters required"}
            {strengthScore === 1 && "Basic password (6+ chars)"}
            {strengthScore === 2 && "Good password (contains numbers or symbols)"}
            {strengthScore === 3 && "Strong password"}
          </p>
        </div>
      )}
    </div>
  );
}

export function AuthSubmitButton({
  busy,
  busyLabel,
  children,
}: {
  busy: boolean;
  busyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={cn(
        "relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-full cursor-pointer",
        "bg-[#0D9488] text-sm font-bold tracking-wide text-white",
        "transition-all duration-200 hover:bg-[#0F766E] hover:shadow-[0_8px_28px_rgba(13,148,136,0.35)]",
        "disabled:cursor-not-allowed disabled:opacity-60"
      )}
    >
      {busy ? busyLabel : children}
    </button>
  );
}
