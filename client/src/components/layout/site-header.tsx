"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Wrench,
  Smartphone,
  Store,
  Info,
  Sparkles,
  MapPin,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/shop/cart-context";
import { useAuth } from "@/components/auth-provider";
import { AnimatePresence, motion } from "framer-motion";
import { RealWhatsAppIcon } from "@/components/ui/whatsapp-icon";

const NAV = [
  { href: "/mobile-repair", label: "Repair", icon: Wrench },
  { href: "/sell-your-phone", label: "Sell", icon: Smartphone },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/about", label: "About", icon: Info },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleLogout = () => {
    setAccountOpen(false);
    setOpen(false);
    logout();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "relative z-50 w-full transition-all duration-300",
        isHome ? "fixed top-0 left-0 right-0" : "sticky top-0",
        scrolled
          ? "border-b border-[#E2E8F0] bg-white/96 backdrop-blur-xl shadow-[0_8px_24px_-6px_rgba(15,23,42,0.1)] py-1.5 sm:py-2"
          : "border-b border-[#E2E8F0]/80 bg-white/92 backdrop-blur-md shadow-[0_2px_16px_rgba(17,24,39,0.03)] py-2 sm:py-2.5 lg:py-3"
      )}
    >
      {/* Top glowing ambient line */}
      <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-[#F97316] via-[#0D9488] to-[#F97316] opacity-90 shadow-xs" />

      <div className="flex h-12 sm:h-14 lg:h-16 w-full items-center justify-between gap-4 px-5 sm:px-8 lg:px-12 transition-all duration-300">
        {/* BRAND LOGO */}
        <BrandLogo />

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden flex-1 items-center justify-center gap-2 lg:gap-4 md:flex">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2 rounded-full px-4.5 py-2 text-base lg:text-[17px] font-extrabold tracking-tight transition-all duration-200",
                  active
                    ? "text-[#0D9488]"
                    : "text-[#1E293B] hover:text-[#0D9488]"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="activeHeaderPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F0FDFA] via-[#CCFBF1] to-[#F0FDFA] border border-[#99F6E4]/60 shadow-[0_2px_10px_rgba(13,148,136,0.12)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 lg:h-5 lg:w-5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6",
                      active ? "text-[#0D9488]" : "text-[#0D9488]"
                    )}
                  />
                  <span className="text-base lg:text-[17px] font-black">{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS RIGHT */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* SHOPPING CART */}
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] transition-all duration-200 hover:bg-[#F0FDFA] hover:border-[#99F6E4] hover:text-[#0D9488] hover:scale-105 shadow-xs"
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0.7, 1.28, 1] }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-[#0D9488] to-[#0F766E] px-1 text-[10px] font-extrabold text-white shadow-md border-2 border-white"
                >
                  {count}
                </motion.span>
              )}
            </Button>
          </Link>

          {/* ACCOUNT / SIGN IN */}
          {user ? (
            <div className="relative hidden sm:block" ref={accountRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] transition-all duration-200 hover:bg-[#F0FDFA] hover:border-[#99F6E4] hover:text-[#0D9488] hover:scale-105 shadow-xs"
                aria-label="Account menu"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
              >
                <User className="h-4 w-4" strokeWidth={2} />
              </Button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-[calc(100%+12px)] z-50 w-60 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl"
                  >
                    <div className="border-b border-[#E2E8F0] bg-gradient-to-r from-[#F0FDFA] to-[#F8FAFC] px-4 py-3.5">
                      <p className="truncate text-sm font-extrabold text-[#0F172A]">{user.name}</p>
                      <p className="truncate text-xs font-semibold text-[#64748B]">{user.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F0FDFA] hover:text-[#0D9488]"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[#0D9488]" />
                        My Account
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#0D9488] transition-colors hover:bg-[#F0FDFA]"
                        >
                          <Sparkles className="h-4 w-4 text-[#0D9488]" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-2 border-[#0D9488] bg-gradient-to-r from-[#0D9488] to-[#0F766E] px-5 text-xs sm:text-sm font-extrabold text-white shadow-[0_3px_12px_rgba(13,148,136,0.28)] transition-all duration-300 hover:shadow-[0_5px_18px_rgba(13,148,136,0.4)] hover:scale-[1.03] active:scale-[0.98]"
              >
                Sign in
              </Button>
            </Link>
          )}

          {/* MOBILE MENU TOGGLE */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
          </Button>
        </div>
      </div>

      {/* MOBILE NAV DRAWER */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-[#E2E8F0] bg-white/98 backdrop-blur-xl md:hidden shadow-xl"
          >
            <nav className="flex flex-col gap-1.5 px-6 py-5">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 rounded-2xl px-4.5 py-4 text-lg font-black transition-all",
                      active
                        ? "bg-[#F0FDFA] text-[#0D9488] border border-[#99F6E4]/60"
                        : "text-[#1E293B] hover:bg-[#F8FAFC] hover:text-[#0D9488]"
                    )}
                  >
                    <Icon className={cn("h-5.5 w-5.5", active ? "text-[#0D9488]" : "text-[#0D9488]")} />
                    {item.label}
                  </Link>
                );
              })}
              {user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-extrabold text-[#334155] hover:bg-[#F8FAFC]"
                  >
                    <LayoutDashboard className="h-5 w-5 text-[#F97316]" />
                    My Account
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-base font-extrabold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] px-5 py-3.5 text-base font-extrabold text-white shadow-md"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SiteFooter() {
  const WHATSAPP_URL =
    "https://wa.me/918130155540?text=" +
    encodeURIComponent("Hi HMC Mobile, I have a question about your repair and phone services.");

  return (
    <footer className="mt-auto w-full border-t border-border bg-[var(--canvas-elevated)] text-[13px]">
      <div className="container-page w-full py-10 sm:py-12">
        <div className="grid w-full gap-10 text-left sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12 xl:gap-x-20">
          {/* COL 1: BRAND & COMPANY ENTITY */}
          <div className="max-w-xs sm:col-span-2 lg:col-span-1">
            <div className="mb-3">
              <BrandLogo variant="footer" />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Precision repair, effortless trade-in, and certified pre-owned devices.
            </p>
            <div className="mt-3 rounded-lg border border-border/80 bg-muted/40 p-2.5 text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground">HMC ENTERPRISES</div>
              <div className="font-mono text-[11px]">GSTIN: 06EFBPK5242G1ZO</div>
              <div className="text-[11px] text-muted-foreground/90">Govt. of India Registered Enterprise</div>
            </div>
          </div>

          {/* COL 2: SERVICES & COMPANY */}
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Services & Info</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/repair" className="transition-colors hover:text-brand">Book a Repair</Link></li>
              <li><Link href="/sell" className="transition-colors hover:text-brand">Sell Your Phone</Link></li>
              <li><Link href="/shop" className="transition-colors hover:text-brand">Buy Phones</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-brand">About Company</Link></li>
              <li><Link href="/track" className="transition-colors hover:text-brand">Track Request</Link></li>
            </ul>
          </div>

          {/* COL 3: WHATSAPP & SUPPORT */}
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Contact & Support</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-[#25D366] hover:underline"
                >
                  <RealWhatsAppIcon className="h-4 w-4 shrink-0" />
                  <span>WhatsApp: 8130155540</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+918130155540"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-brand font-medium"
                >
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>+91 81301 55540</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@hmcmobile.in"
                  className="transition-colors hover:text-brand text-xs"
                >
                  hello@hmcmobile.in
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-xs transition-colors hover:text-brand">
                  Contact Form & Map →
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 4: STORE ADDRESS & HOURS */}
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand" /> Store Address
            </h4>
            <address className="not-italic text-sm leading-relaxed text-muted-foreground">
              Shop No, ALG-II, Pushpa Complex,
              <br />
              Hisar, Haryana – 125001
            </address>
            <div className="mt-3 pt-3 border-t border-border/60">
              <div className="text-xs font-semibold text-foreground">Business Hours:</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mon – Sat: 10:00 AM – 8:00 PM
                <br />
                Sunday: 11:00 AM – 5:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} <span className="font-semibold text-foreground">HMC ENTERPRISES</span> (HMC Mobile). All rights reserved.
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Reg No: 06EFBPK5242G1ZO</span>
            <span>·</span>
            <span>Hisar, Haryana – 125001</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
