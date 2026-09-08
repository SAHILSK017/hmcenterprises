"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Wrench,
  Smartphone,
  Store,
  BadgeIndianRupee,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  ClipboardList,
  Search,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  Building2,
} from "lucide-react";
import { RealWhatsAppIcon, WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { motion, type Variants } from "framer-motion";
import { api } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import type { PhoneComponentId } from "@/lib/phone-components";
import { useReducedMotion, useWebGLSupport } from "@/hooks/use-motion-preference";
import { DEFAULT_PHONE_GLB } from "@/lib/phone-glb";
import { useGlbAvailable } from "@/components/home/phone-glb-model";
import { PhoneFallbackVisual } from "@/components/home/exploded-phone";
import { ComponentPanel } from "@/components/home/component-panel";

const ExplodedPhoneCanvas = dynamic(
  () => import("@/components/home/exploded-phone").then((m) => m.ExplodedPhoneCanvas),
  { ssr: false, loading: () => <PhoneFallbackVisual className="h-full w-full" /> }
);

const WHATSAPP =
  "https://wa.me/918130155540?text=" +
  encodeURIComponent("Hi HMC Mobile, I need help with my phone.");

const SERVICES = [
  {
    num: "01",
    title: "EXPERT REPAIR.",
    label: "Mobile Repair",
    desc: "From broken displays and weak batteries to charging, camera and motherboard issues, our technicians diagnose devices carefully before recommending a repair.",
    href: "/mobile-repair",
    cta: "EXPLORE REPAIR",
    icon: Wrench,
  },
  {
    num: "02",
    title: "TURN YOUR OLD PHONE INTO CASH.",
    label: "Sell Your Phone",
    desc: "Submit your phone details, upload photos and receive an evaluation and offer through WhatsApp.",
    href: "/sell-your-phone",
    cta: "SELL YOUR PHONE",
    icon: Smartphone,
  },
  {
    num: "03",
    title: "BUY WITH CONFIDENCE.",
    label: "Buy a Phone",
    desc: "Explore new, used and refurbished phones with transparent specifications, condition information, warranty and seller details.",
    href: "/shop",
    cta: "SHOP PHONES",
    icon: Store,
  },
];

const PROCESS = [
  { step: "01", title: "SUBMIT", desc: "Tell us what you need." },
  { step: "02", title: "INSPECT", desc: "We inspect the device and problem." },
  { step: "03", title: "QUOTE", desc: "You receive a clear price/offer." },
  { step: "04", title: "APPROVE", desc: "You approve the repair or phone offer." },
  { step: "05", title: "COMPLETE", desc: "Repair, purchase or delivery is completed." },
];

const WHY = [
  { icon: BadgeIndianRupee, title: "Transparent pricing", desc: "Clear quotes and offers — no confusing pricing." },
  { icon: Search, title: "Quality-checked devices", desc: "Used and refurbished phones are inspected before listing." },
  { icon: Wrench, title: "Professional repair", desc: "Device-level diagnosis before any repair begins." },
  { icon: MessageCircle, title: "WhatsApp support", desc: "Easy communication throughout the process." },
  { icon: ClipboardList, title: "Trackable requests", desc: "Follow repair and sell requests online." },
  { icon: ShieldCheck, title: "Clear warranty info", desc: "Warranty details shown for eligible services and products." },
];

type BlogCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  publishedAt?: string;
};

type ReviewItem = {
  name: string;
  rating: number;
  title?: string;
  text: string;
  verified?: boolean;
  createdAt?: string;
  productName?: string;
};

function HeroPhoneVisual() {
  const reducedMotion = useReducedMotion();
  const webgl = useWebGLSupport();
  const glbAvailable = useGlbAvailable(DEFAULT_PHONE_GLB);
  const glbUrl = glbAvailable ? DEFAULT_PHONE_GLB : null;

  if (!webgl || reducedMotion) {
    return <PhoneFallbackVisual className="h-full w-full" variant="hero" />;
  }

  return (
    <ExplodedPhoneCanvas
      explode={0}
      selectedId={null}
      onSelect={() => {}}
      autoRotate={!reducedMotion}
      reducedMotion={reducedMotion}
      glbUrl={glbUrl}
      variant="hero"
      className="h-full w-full"
    />
  );
}

/** Smoothly animate explode 0 ↔ 1 when opened toggles */
function useTapExplode(opened: boolean, reducedMotion: boolean) {
  const [explode, setExplode] = useState(0);
  const valueRef = useRef(0);

  useEffect(() => {
    const target = opened ? 1 : 0;
    if (reducedMotion) {
      valueRef.current = target;
      setExplode(target);
      return;
    }
    let raf = 0;
    let lastTime = performance.now();
    const step = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const diff = target - valueRef.current;
      if (Math.abs(diff) < 0.005) {
        valueRef.current = target;
        setExplode(target);
      } else {
        valueRef.current += diff * Math.min(1, delta * 18);
        setExplode(valueRef.current);
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [opened, reducedMotion]);

  return explode;
}

function WorkshopSection() {
  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<PhoneComponentId | null>(null);
  const reducedMotion = useReducedMotion();
  const webgl = useWebGLSupport();
  const explode = useTapExplode(opened, reducedMotion);
  const isOpen = explode > 0.22;

  const openPhone = () => {
    setOpened(true);
  };

  const closePhone = () => {
    setSelected(null);
    setOpened(false);
  };

  const handleSelect = (id: PhoneComponentId | null) => {
    if (!isOpen) {
      openPhone();
      return;
    }
    setSelected(id);
  };

  return (
    <section className="relative overflow-hidden border-y border-[#E2E8F0] bg-gradient-to-br from-[#EEF2FF] via-[#F8FAFC] to-[#ECFEFF]">
      <div className="container-page py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#1473EA] shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#1473EA] animate-pulse" />
              Inside your phone
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-5xl">
              EVERY COMPONENT MATTERS.
            </h2>
            <p className="mt-4 text-[17px] font-medium text-[#64748B]">
              {opened
                ? "Drag to rotate 360°. Tap any part for repair details."
                : "Tap the phone to open every component. Drag anytime to rotate."}
            </p>
          </div>
          <div className="flex gap-2">
            {!opened ? (
              <button type="button" onClick={openPhone} className="pill-cta-primary text-sm">
                Open phone
              </button>
            ) : (
              <button type="button" onClick={closePhone} className="pill-cta text-sm">
                Close phone
              </button>
            )}
          </div>
        </div>

        <div className="relative mt-10 h-[min(680px,82vh)] w-full">
          {webgl ? (
            <ExplodedPhoneCanvas
              explode={explode}
              selectedId={selected}
              onSelect={handleSelect}
              onActivatePhone={openPhone}
              autoRotate={false}
              reducedMotion={reducedMotion}
              glbUrl={null}
              freeOrbit
              className="h-full w-full"
            />
          ) : (
            <PhoneFallbackVisual className="h-full w-full" />
          )}
          {!opened && (
            <button
              type="button"
              onClick={openPhone}
              className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto w-fit rounded-full bg-[#111827]/80 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-md"
            >
              Tap phone to open · Drag to rotate
            </button>
          )}
          <ComponentPanel componentId={selected} onClose={() => setSelected(null)} />
        </div>
      </div>
    </section>
  );
}

export function AboutPageContent() {
  const [posts, setPosts] = useState<BlogCard[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<{ show: boolean; items: { value: string; label: string }[]; workshopNote?: string }>({
    show: false,
    items: [],
  });

  useEffect(() => {
    api<{ items: BlogCard[] }>("/api/blog?limit=4")
      .then((d) => setPosts(d.items || []))
      .catch(() => setPosts([]));
    api<{ items: ReviewItem[] }>("/api/site/reviews")
      .then((d) => setReviews(d.items || []))
      .catch(() => setReviews([]));
    api<{ show: boolean; items: { value: string; label: string }[]; workshopNote?: string }>("/api/site/stats")
      .then(setStats)
      .catch(() => setStats({ show: false, items: [] }));
  }, []);

  return (
    <div className="bg-[var(--canvas)]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">About HMC Mobile</p>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.2rem)] font-bold leading-[1.02] tracking-tight">
              WE KEEP YOUR
              <span className="block text-brand">MOBILE MOVING.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-foreground/60">
              HMC Mobile brings professional mobile repair, trusted phone buyback, and quality new &
              refurbished devices together in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/mobile-repair"><span className="pill-cta-primary">REPAIR YOUR PHONE</span></Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/shop"><span className="pill-cta">SHOP PHONES</span></Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/sell-your-phone"><span className="pill-cta">SELL YOUR PHONE</span></Link>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[min(480px,60vh)] overflow-hidden rounded-3xl bg-[#eceef2]"
          >
            <HeroPhoneVisual />
          </motion.div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="section-page bg-background">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Who we are</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
              MORE THAN A MOBILE SHOP.
            </h2>
            <p className="mt-5 text-lg font-medium text-foreground/65">
              HMC Mobile is built around three things:
            </p>
            <ul className="mt-6 space-y-3 text-[17px] font-semibold text-foreground/80">
              <li className="flex gap-3"><CheckCircle2 className="mt-1 h-5 w-5 text-brand shrink-0" /> Repairing phones properly.</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-1 h-5 w-5 text-brand shrink-0" /> Giving customers a fair way to sell old devices.</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-1 h-5 w-5 text-brand shrink-0" /> Making quality phones easier to buy.</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { t: "Repair desk", d: "Diagnosis-first workflow" },
              { t: "Buyback", d: "WhatsApp offers" },
              { t: "Store", d: "Checked inventory" },
              { t: "Tracking", d: "Live request status" },
            ].map((x) => (
              <motion.div
                key={x.t}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7] p-6 shadow-xs cursor-default"
              >
                <p className="font-display text-lg font-bold">{x.t}</p>
                <p className="mt-1 text-sm text-foreground/55">{x.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section-page bg-muted/30">
        <div className="container-page space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">What we do</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Repair · Sell · Buy</h2>
          </motion.div>
          {SERVICES.map(({ num, title, label, desc, href, cta, icon: Icon }) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid items-center gap-8 rounded-3xl border border-black/[0.06] bg-white p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] shadow-xs group"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground/40">{num} — {label}</p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h3>
                <p className="mt-4 text-[16px] font-medium leading-relaxed text-foreground/60">{desc}</p>
                <div className="mt-6">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
                    <Link href={href}>
                      <span className="pill-cta-primary">{cta}</span>
                    </Link>
                  </motion.div>
                </div>
              </div>
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-[#f5f5f7] overflow-hidden group-hover:bg-[#f0f4f8] transition-colors">
                <Icon className="h-20 w-20 text-foreground/20 group-hover:scale-110 group-hover:text-brand/40 transition-all duration-300" strokeWidth={1} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3D WORKSHOP */}
      <WorkshopSection />

      {/* PROCESS */}
      <section className="section-page bg-background">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Process</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              HOW HMC MOBILE WORKS
            </h2>
          </motion.div>
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {PROCESS.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative rounded-2xl border border-black/[0.06] bg-white p-5 shadow-xs"
              >
                <p className="font-display text-3xl font-bold text-brand/35">{p.step}</p>
                <h3 className="mt-3 text-sm font-bold tracking-wide">{p.title}</h3>
                <p className="mt-2 text-sm text-foreground/60">{p.desc}</p>
                {i < PROCESS.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-brand/40 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HMC */}
      <section className="section-page bg-muted/30">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Why choose HMC?</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Built for clarity.</h2>
          </motion.div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-xs group"
              >
                <p className="text-xs font-bold text-foreground/35">0{i + 1}</p>
                <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-brand/10 transition-colors">
                  <Icon className="h-5 w-5 text-foreground group-hover:text-brand transition-colors" strokeWidth={1.75} />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold uppercase tracking-wide">{title}</h3>
                <p className="mt-2 text-sm font-medium text-foreground/60">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKSHOP */}
      <section className="section-page bg-background">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Workshop</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              BUILT AROUND YOUR DEVICE
            </h2>
            <p className="mt-4 text-lg font-medium text-foreground/60">
              {stats.workshopNote ||
                "Our technicians diagnose carefully, use quality parts, and test every device before return."}
            </p>
            <ul className="mt-6 space-y-2 text-sm font-semibold text-foreground/70">
              {["Repair workstation", "Component testing", "Quality inspection", "Clear documentation"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-brand" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Diagnose", image: "/images/workshop-diagnose.jpg" },
              { label: "Repair", image: "/images/workshop-repair.jpg" },
              { label: "Test", image: "/images/workshop-test.jpg" },
              { label: "Return", image: "/images/workshop-return.jpg" },
            ].map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  "group relative flex aspect-square items-end overflow-hidden rounded-2xl border border-black/[0.08] bg-[#f5f5f7] p-5 shadow-xs transition-all hover:shadow-md",
                  i % 2 === 1 && "mt-6"
                )}
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <p className="relative z-10 font-display text-xl font-bold text-white drop-shadow-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS — only if DB has real values */}
      {stats.show && stats.items.length > 0 && (
        <section className="section-page border-y border-border bg-[#f5f5f7]">
          <div className="container-page">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.items.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <p className="font-display text-3xl font-bold sm:text-4xl">{s.value}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-foreground/45">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REVIEWS — from DB */}
      <section className="section-page bg-background">
        <div className="container-page">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">Reviews</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            WHAT OUR CUSTOMERS SAY
          </h2>
          {reviews.length ? (
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {reviews.map((r, i) => (
                <article key={`${r.name}-${i}`} className="rounded-2xl border border-black/[0.06] bg-white p-6">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: Math.round(r.rating) }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
                  <p className="mt-2 text-sm leading-relaxed text-foreground/65">“{r.text}”</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-foreground/45">
                    <span className="font-bold text-foreground/70">{r.name}</span>
                    {r.verified && <span className="text-emerald-600">Verified</span>}
                  </div>
                  {r.createdAt && (
                    <p className="mt-1 text-[11px] text-foreground/40">{formatDate(r.createdAt)}</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-foreground/50">
              Customer reviews will appear here as they are collected from completed services and
              purchases.
            </p>
          )}
        </div>
      </section>

      {/* BLOG */}
      <section className="section-page bg-[#F5F3FF] border-y border-[#DDD6FE]">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DDD6FE] bg-white px-3 py-0.5 text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">
                HMC Journal
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
                FROM THE HMC JOURNAL
              </h2>
              <p className="mt-2 text-[#64748B] font-medium">
                Useful guides for repairing, buying and selling mobile phones.
              </p>
            </div>
            <Link href="/blog" className="text-sm font-bold text-[#7C3AED] hover:underline">
              VIEW ALL ARTICLES →
            </Link>
          </div>
          {posts.length ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {posts.map((post) => {
                const getBlogBadge = (cat: string) => {
                  const c = cat.toLowerCase();
                  if (c.includes("repair")) return "bg-[#EFF6FF] text-[#1473EA] border-[#BFDBFE]";
                  if (c.includes("battery")) return "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]";
                  if (c.includes("buy") || c.includes("guide")) return "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]";
                  if (c.includes("used") || c.includes("phone")) return "bg-[#ECFEFF] text-[#00B8D9] border-[#CFFAFE]";
                  return "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]";
                };

                return (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug}`}
                    className="group overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#7C3AED]/40 hover:shadow-md"
                  >
                    <div className="aspect-[16/10] bg-[#EEF3F8] overflow-hidden">
                      {post.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.featuredImage}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      ) : null}
                    </div>
                    <div className="p-5">
                      <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", getBlogBadge(post.category))}>
                        {post.category}
                      </span>
                      <h3 className="mt-2.5 line-clamp-2 font-display text-lg font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-[#64748B]">{post.excerpt}</p>
                      <p className="mt-4 text-xs font-semibold text-[#94A3B8]">
                        {post.publishedAt ? formatDate(post.publishedAt) : ""} · Read article
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 text-sm font-medium text-[#64748B]">
              Journal articles will appear here once published from the admin dashboard.
            </p>
          )}
        </div>
      </section>

      {/* ABOUT COMPANY & OFFICIAL REGISTRATION */}
      <section className="section-page bg-white border-t border-[#E2E8F0]">
        <div className="container-page">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#CFFAFE] bg-[#ECFEFF] px-3 py-0.5 text-xs font-bold uppercase tracking-[0.18em] text-[#00B8D9]">
              Legal Entity & Store
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
              ABOUT HMC ENTERPRISES
            </h2>
            <p className="mt-2 text-[#64748B] font-medium leading-relaxed">
              Operating under Government of India GST Registration (Form GST REG-06). We provide certified mobile device sales, trade-ins, and high-precision component-level electronics repair from our registered store and service center in Hisar, Haryana.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* CARD 1: BUSINESS REGISTRATION */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700 mb-4">
                <ShieldCheck className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-display text-base font-bold text-[#111827]">
                Government GST Registration
              </h3>
              <div className="mt-3 space-y-2 text-xs text-[#475569]">
                <div>
                  <span className="text-[#94A3B8] font-medium block">Registration No. (GSTIN):</span>
                  <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mt-0.5">
                    06EFBPK5242G1ZO
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] font-medium block">Legal Trade Name:</span>
                  <span className="font-semibold text-[#111827]">HMC ENTERPRISES</span>
                </div>
                <div>
                  <span className="text-[#94A3B8] font-medium block">Proprietor Name:</span>
                  <span className="font-semibold text-[#111827]">RAJ KUMAR</span>
                </div>
                <div className="text-[11px] text-[#94A3B8] pt-1">
                  Verified under Rule 10(1) · Govt. of India
                </div>
              </div>
            </div>

            {/* CARD 2: PHYSICAL STORE & WORKSHOP */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 shadow-xs">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-700 mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-display text-base font-bold text-[#111827]">
                Store & Service Center Address
              </h3>
              <address className="not-italic mt-3 text-xs leading-relaxed text-[#475569]">
                <strong className="text-sm font-bold text-[#111827] block">
                  Shop No, ALG-II, Pushpa Complex
                </strong>
                Road / Street: Pushpa Complex
                <br />
                City / District: Hisar
                <br />
                State: Haryana – PIN 125001
              </address>
              <div className="mt-4 pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B]">
                <span className="font-semibold text-[#111827]">Walk-in Hours:</span> Mon–Sat 10 AM–8 PM · Sun 11 AM–5 PM
              </div>
            </div>

            {/* CARD 3: DIRECT WHATSAPP & SUPPORT */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-6 shadow-xs md:col-span-2 lg:col-span-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366]/20 text-[#25D366] mb-4">
                <RealWhatsAppIcon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-base font-bold text-[#111827]">
                Direct WhatsApp Support
              </h3>
              <p className="mt-2 text-xs text-[#475569] leading-relaxed">
                Connect directly with our Hisar store team for instant repair cost estimates, sell quotes, and order inquiries.
              </p>
              <div className="mt-4 space-y-2">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#20BE5C] transition-colors"
                >
                  <WhatsAppIcon className="h-4 w-4 fill-white text-white" />
                  Chat on WhatsApp (8130155540)
                </a>
                <a
                  href="tel:+918130155540"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs font-semibold text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-[#64748B]" />
                  Call: +91 81301 55540
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-[#1473EA] via-[#3B82F6] to-[#4F46E5] text-white">
        <div className="container-page py-16 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            NEED HELP WITH YOUR PHONE?
          </h2>
          <p className="mt-3 text-lg font-medium text-white/85">Repair it. Sell it. Replace it.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/mobile-repair">
              <span className="inline-flex h-12 items-center rounded-full bg-white px-7 text-sm font-bold text-[#1473EA] shadow-md hover:bg-[#EFF6FF]">
                REPAIR YOUR PHONE
              </span>
            </Link>
            <Link href="/sell-your-phone">
              <span className="inline-flex h-12 items-center rounded-full border-2 border-white/60 bg-transparent px-7 text-sm font-bold text-white hover:bg-white/10">
                SELL YOUR PHONE
              </span>
            </Link>
            <Link href="/shop">
              <span className="inline-flex h-12 items-center rounded-full border-2 border-white/60 bg-transparent px-7 text-sm font-bold text-white hover:bg-white/10">
                SHOP PHONES
              </span>
            </Link>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#25D366] px-7 text-sm font-bold text-white shadow-md hover:bg-[#20BE5C]"
            >
              <WhatsAppIcon className="h-5 w-5 fill-white text-white" /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
