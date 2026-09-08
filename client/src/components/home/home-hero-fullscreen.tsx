"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Wrench,
  Smartphone,
  Store,
  Battery,
  Monitor,
  Camera,
  ShieldCheck,
  Truck,
  BadgeIndianRupee,
  MessageCircle,
  RefreshCw,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { SectionShell } from "./section-background-art";
import { HeroPhoneVideo } from "./hero-phone-video";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const REPAIR_FEATURES = [
  { icon: Monitor, label: "Display & touch replacement" },
  { icon: Battery, label: "Battery health & replacement" },
  { icon: Camera, label: "Camera & lens repair" },
  { icon: Wrench, label: "Charging port & speaker fix" },
];

const BUY_FEATURES = [
  "New phones with manufacturer warranty",
  "Certified used & refurbished devices",
  "IMEI-verified stock & clear pricing",
  "Easy checkout with order tracking",
];

const SELL_STEPS = [
  { step: "01", title: "Share device details", desc: "Tell us your brand, model, condition, and upload photos." },
  { step: "02", title: "Get a fair offer", desc: "We evaluate your phone and send a transparent price on WhatsApp." },
  { step: "03", title: "Accept & get paid", desc: "Confirm the offer, hand over the device, and receive payment quickly." },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, title: "Genuine parts", desc: "Original and high-grade compatible components for every repair." },
  { icon: RefreshCw, title: "Live tracking", desc: "Track repairs and orders from start to finish in real time." },
  { icon: BadgeIndianRupee, title: "Honest pricing", desc: "No hidden fees — clear quotes before any work begins." },
  { icon: MessageCircle, title: "WhatsApp support", desc: "Quick updates and offers delivered straight to your phone." },
];

function SectionIntro({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      className="max-w-2xl"
    >
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand">{label}</p>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[17px] font-medium leading-relaxed text-foreground/70">
        {children}
      </div>
    </motion.div>
  );
}

export function HomeHeroFullscreen() {
  return (
    <>
      {/* Hero */}
      <section className="section-screen relative w-full overflow-hidden bg-[#E4E9ED] border-b border-[#E2E8F0]">
        <div className="container-page relative z-10 w-full">
          <div className="relative grid min-h-[calc(100dvh-5rem)] items-center gap-8 py-20 lg:grid-cols-[minmax(0,44%)_1fr] lg:gap-10 xl:gap-12">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="relative z-20 pt-4 text-left lg:max-w-xl lg:pt-0"
            >
              <motion.div variants={fadeInUp}>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FED7AA] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#F97316] shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-[#F97316] animate-pulse" />
                  HMC Mobile Marketplace
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-display text-[clamp(2.1rem,4.2vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-[#0F172A]"
              >
                <span className="block">We Know What's</span>
                <span className="block">Inside Your Phone.</span>
                <span className="mt-1 block text-[#0D9488]">
                  And What Comes Next.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="mt-5 max-w-xl text-[17px] font-semibold leading-relaxed text-[#F97316] sm:text-[18px]"
              >
                From component-level repair to quality-checked phones, HMC Mobile takes care of every step.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="mt-9 flex flex-wrap items-center justify-start gap-3"
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/mobile-repair">
                    <span className="pill-cta-primary shadow-xs">Book a Repair</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/sell-your-phone">
                    <span className="pill-cta bg-white border-[#0D9488] text-[#0D9488] hover:bg-[#F0FDFA] shadow-xs">
                      Sell Your Phone
                    </span>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Reserves space on mobile; desktop video is absolutely positioned */}
            <div
              className="min-h-[min(560px,72vh)] w-full lg:min-h-0"
              aria-hidden
            />
          </div>
        </div>

        {/* One video instance only — avoids downloading the file twice */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[min(560px,72vh)] overflow-hidden lg:inset-y-0 lg:left-auto lg:right-0 lg:top-20 lg:h-auto lg:w-[min(58vw,920px)]">
          <HeroPhoneVideo className="h-full w-full" />
        </div>
      </section>

      {/* Introduction */}
      <SectionShell variant="intro" className="bg-[#F7F9FC]" artPosition="right" artOpacity={0.08}>
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Left Column: Intro text + reduced size cards */}
          <div className="flex flex-col">
            <SectionIntro label="Introduction" title="Your trusted mobile partner in one place.">
              <p>
                HMC Mobile is built for people who want their phone handled professionally — whether
                it needs a repair, you want to sell it, or you are looking for your next device.
              </p>
              <p>
                From cracked screens to battery issues, from buying a certified second-hand iPhone to
                selling your old Samsung for the best price — we make every step simple, fast, and
                transparent.
              </p>
            </SectionIntro>

            {/* Reduced size cards shifted into left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={staggerContainer}
              className="mt-8 grid grid-cols-3 gap-3 max-w-xl"
            >
              {[
                { stat: "5000+", label: "Repairs completed", color: "text-[#1473EA]", bg: "bg-[#EFF6FF] border-[#BFDBFE]" },
                { stat: "1200+", label: "Phones sold", color: "text-[#16A34A]", bg: "bg-[#F0FDF4] border-[#BBF7D0]" },
                { stat: "98%", label: "Satisfaction", color: "text-[#7C3AED]", bg: "bg-[#F5F3FF] border-[#DDD6FE]" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={scaleIn}
                  whileHover={{ y: -3, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={cn("pro-card px-3.5 py-4 text-center border cursor-default shadow-xs rounded-2xl", item.bg)}
                >
                  <p className={cn("font-display text-2xl font-bold tracking-tight sm:text-2.5xl", item.color)}>{item.stat}</p>
                  <p className="mt-1 text-[11px] sm:text-xs font-semibold text-[#64748B] leading-tight">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Mac Repairing Image Blended with Website Theme */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Ambient theme glow behind the image */}
            <div className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#0D9488]/15 via-[#1473EA]/10 to-[#F97316]/10 blur-xl" />

            <div className="pro-card relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[0_16px_36px_-12px_rgba(15,23,42,0.12)] group">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src="/images/mac-repair.jpg"
                  alt="Precision Mac & Hardware Repair Workshop"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  priority={false}
                />

                {/* Soft gradient overlay blending with theme */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-black/10" />

                {/* Top Badge */}
                <div className="absolute top-3.5 left-3.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/92 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-[#0F172A] shadow-xs border border-white/80">
                    <span className="h-2 w-2 rounded-full bg-[#0D9488] animate-pulse" />
                    Chip-Level Diagnosis Lab
                  </span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-3.5 inset-x-3.5 flex items-center justify-between text-white drop-shadow-sm">
                  <div>
                    <p className="text-xs font-medium text-white/80">Certified Technicians</p>
                    <p className="text-sm font-bold tracking-tight text-white">Apple Mac & Board-Level Repair</p>
                  </div>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white border border-white/30">
                    <Wrench className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionShell>

      {/* Mobile Repair */}
      <SectionShell variant="repair" className="bg-gradient-to-br from-[#EFF6FF] to-[#ECFEFF]" artPosition="right" artOpacity={0.16}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionIntro label="Mobile Repair" title="Expert repair. Genuine care.">
            <p>
              We fix all major brands — Apple, Samsung, Xiaomi, OnePlus, Vivo, Oppo, and more.
              Every repair starts with a proper diagnosis, so you only pay for what your phone
              actually needs.
            </p>
            <p>
              Submit a request online, upload photos of the issue, and track your repair ID from
              pickup to delivery. Our technicians use quality parts and test every device before
              handover.
            </p>
          </SectionIntro>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={slideInRight}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="pro-card relative overflow-hidden p-8 sm:p-10 bg-white border-[#BFDBFE] shadow-md group"
          >
            {/* Transparent thematic watermark art blended with card */}
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-72 w-72 sm:h-88 sm:w-88 opacity-[0.22] mix-blend-multiply transition-opacity duration-500 group-hover:opacity-[0.34]">
              <Image
                src="/images/repair-card-art.jpg"
                alt=""
                fill
                className="object-contain object-bottom-right"
              />
            </div>
            {/* Soft gradient mask preserving 100% text contrast & clarity */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10" />

            <div className="relative z-10">
              <h3 className="font-display text-lg font-bold text-[#111827] flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1473EA]">
                  <Wrench className="h-4 w-4" />
                </span>
                What we repair
              </h3>

              <motion.ul
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="mt-6 space-y-4"
              >
                {REPAIR_FEATURES.map(({ icon: Icon, label }) => (
                  <motion.li
                    key={label}
                    variants={fadeInUp}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 text-[15px] font-semibold text-[#111827] transition-transform"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] shadow-xs">
                      <Icon className="h-5 w-5 text-[#1473EA]" strokeWidth={1.75} />
                    </span>
                    {label}
                  </motion.li>
                ))}
              </motion.ul>

              <ul className="mt-6 space-y-2 border-t border-[#E2E8F0] pt-6 text-sm font-medium text-[#64748B]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> Water damage & software issues
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> Motherboard-level diagnosis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> 90-day warranty on eligible repairs
                </li>
              </ul>

              <div className="mt-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                  <Link href="/mobile-repair">
                    <span className="pill-cta-primary">Book a repair</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionShell>

      {/* Mobile Buying */}
      <SectionShell variant="buy" className="bg-[#F7F9FC]" artPosition="left" artOpacity={0.15}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={slideInLeft}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="order-2 lg:order-1 pro-card relative overflow-hidden p-8 sm:p-10 border-[#E2E8F0] bg-white shadow-sm group"
          >
            {/* Transparent thematic watermark art blended with card */}
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-72 w-72 sm:h-88 sm:w-88 opacity-[0.22] mix-blend-multiply transition-opacity duration-500 group-hover:opacity-[0.34]">
              <Image
                src="/images/shop-card-art.jpg"
                alt=""
                fill
                className="object-contain object-bottom-right"
              />
            </div>
            {/* Soft gradient mask preserving 100% text contrast & clarity */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10" />

            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE]">
                  <Store className="h-6 w-6 text-[#7C3AED]" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-lg font-bold text-[#111827]">Shop categories</h3>
              </div>

              <div className="space-y-3">
                {[
                  { name: "New Phones", color: "text-[#1473EA] bg-[#EFF6FF] border-[#BFDBFE] hover:border-[#1473EA]" },
                  { name: "Refurbished Phones", color: "text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE] hover:border-[#7C3AED]" },
                  { name: "Used Phones", color: "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0] hover:border-[#16A34A]" },
                  { name: "Accessories", color: "text-[#00B8D9] bg-[#ECFEFF] border-[#CFFAFE] hover:border-[#00B8D9]" },
                ].map((cat) => (
                  <Link href="/shop" key={cat.name} className="block">
                    <motion.div
                      whileHover={{ x: 6 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-4 py-3 transition-colors backdrop-blur-[2px]",
                        cat.color
                      )}
                    >
                      <span className="text-[15px] font-semibold">{cat.name}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                    </motion.div>
                  </Link>
                ))}
              </div>

              <ul className="mt-8 space-y-3">
                {BUY_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-medium text-[#64748B]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                  <Link href="/shop">
                    <span className="pill-cta-primary">Browse phones</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <SectionIntro label="Mobile Buying" title="Buy your next phone with confidence.">
              <p>
                Whether you want the latest flagship or a budget-friendly used device, HMC Mobile
                offers a curated selection of phones you can trust — each listed with clear specs,
                condition, battery health, and warranty details.
              </p>
              <p>
                Filter by brand, price, RAM, and storage. Add to cart, checkout securely, and
                track your order until it reaches your door. Every used phone is IMEI-checked and
                quality-tested before sale.
              </p>
            </SectionIntro>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="mt-8 flex items-center gap-3 text-sm font-semibold text-[#64748B]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1473EA] border border-[#BFDBFE]">
                <Truck className="h-5 w-5" strokeWidth={1.5} />
              </span>
              Fast delivery across India · COD & online payment available
            </motion.div>
          </div>
        </div>
      </SectionShell>

      {/* Mobile Selling */}
      <SectionShell variant="sell" className="bg-gradient-to-br from-[#F0FDF4] via-[#F7F9FC] to-[#ECFEFF]" artPosition="right" artOpacity={0.16}>
        <SectionIntro label="Mobile Selling" title="Turn your old phone into cash.">
          <p>
            Upgrading to a new device? We offer fair, market-based prices for your old phone —
            no lowballing, no confusing terms. Tell us about your device, share a few photos,
            and receive an offer directly on WhatsApp.
          </p>
          <p>
            We buy phones in all conditions — like new, good, average, or even damaged. The
            process is quick, transparent, and designed to get you the best value with zero
            hassle.
          </p>
        </SectionIntro>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {SELL_STEPS.map((s, idx) => (
            <motion.div
              key={s.step}
              variants={fadeInUp}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="pro-card p-8 bg-white border-[#BBF7D0] relative overflow-hidden group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-4xl font-bold text-[#16A34A]">{s.step}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A] text-xs font-bold">
                  0{idx + 1}
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-[#111827]">{s.title}</h3>
              <p className="mt-2 text-[15px] font-medium leading-relaxed text-[#64748B]">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mt-10 text-center"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Link href="/sell-your-phone">
              <span className="pill-cta-primary bg-[#16A34A] hover:bg-[#15803D] shadow-[0_4px_14px_rgba(22,163,74,0.3)]">
                Get your phone valued
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </SectionShell>

      {/* Service Cards Overview - Distinct Colors */}
      <SectionShell variant="services" className="bg-[#EEF3F8]" artPosition="right" artOpacity={0.13}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeInUp}
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-[2.5rem]">
            Explore our services
          </h2>
          <p className="mt-3 max-w-lg text-[17px] font-medium text-[#64748B]">
            Everything you need for your mobile — in one place.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {/* REPAIR CARD - Light Blue */}
          <motion.div variants={fadeInUp} whileHover={{ y: -6 }}>
            <Link
              href="/mobile-repair"
              className="pro-card group block overflow-hidden bg-white border-[#BFDBFE] hover:border-[#F97316] transition-colors"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <Image
                  src="/images/home-service-repair.jpg"
                  alt="Mobile Repair"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="absolute bottom-3 left-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 backdrop-blur-md shadow-sm"
                >
                  <Wrench className="h-5 w-5 text-[#F97316]" strokeWidth={1.75} />
                </motion.div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                  Mobile Repair
                </h3>
                <p className="mt-2 text-[15px] font-medium leading-relaxed text-[#64748B]">
                  Display, battery, charging, camera & board-level repair with live tracking.
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-bold text-[#F97316]">
                  Learn more{" "}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5"
                    strokeWidth={2}
                  />
                </span>
              </div>
            </Link>
          </motion.div>

          {/* SELL CARD - Light Green */}
          <motion.div variants={fadeInUp} whileHover={{ y: -6 }}>
            <Link
              href="/sell-your-phone"
              className="pro-card group block overflow-hidden bg-white border-[#CCFBF1] hover:border-[#0D9488] transition-colors"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <Image
                  src="/images/home-service-sell.jpg"
                  alt="Sell Your Phone"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <motion.div
                  whileHover={{ rotate: -15 }}
                  className="absolute bottom-3 left-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 backdrop-blur-md shadow-sm"
                >
                  <Smartphone className="h-5 w-5 text-[#0D9488]" strokeWidth={1.75} />
                </motion.div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-[#0F172A] group-hover:text-[#0D9488] transition-colors">
                  Sell Your Phone
                </h3>
                <p className="mt-2 text-[15px] font-medium leading-relaxed text-[#64748B]">
                  Instant valuation, transparent offers, WhatsApp offer delivery.
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-bold text-[#0D9488]">
                  Learn more{" "}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5"
                    strokeWidth={2}
                  />
                </span>
              </div>
            </Link>
          </motion.div>

          {/* SHOP CARD - Light Orange */}
          <motion.div variants={fadeInUp} whileHover={{ y: -6 }}>
            <Link
              href="/shop"
              className="pro-card group block overflow-hidden bg-white border-[#FED7AA] hover:border-[#F97316] transition-colors"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <Image
                  src="/images/home-service-shop.jpg"
                  alt="Shop Phones"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute bottom-3 left-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 backdrop-blur-md shadow-sm"
                >
                  <Store className="h-5 w-5 text-[#F97316]" strokeWidth={1.75} />
                </motion.div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                  Shop Phones
                </h3>
                <p className="mt-2 text-[15px] font-medium leading-relaxed text-[#64748B]">
                  New, used & refurbished devices plus accessories with clear warranty.
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-bold text-[#F97316]">
                  Learn more{" "}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5"
                    strokeWidth={2}
                  />
                </span>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </SectionShell>

      {/* Why HMC */}
      <SectionShell variant="trust" className="bg-[#F7F9FC]" artPosition="center" artOpacity={0.1}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeInUp}
          className="text-center"
        >
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#1473EA]">Why HMC Mobile</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
            Built on trust. Designed for you.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TRUST_POINTS.map(({ icon: Icon, title, desc }, idx) => {
            const tints = [
              { bg: "bg-[#EFF6FF]", icon: "text-[#1473EA]", border: "border-[#BFDBFE]" },
              { bg: "bg-[#ECFEFF]", icon: "text-[#00B8D9]", border: "border-[#CFFAFE]" },
              { bg: "bg-[#F0FDF4]", icon: "text-[#16A34A]", border: "border-[#BBF7D0]" },
              { bg: "bg-[#F5F3FF]", icon: "text-[#7C3AED]", border: "border-[#DDD6FE]" },
            ];
            const t = tints[idx % tints.length];
            return (
              <motion.div
                key={title}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={cn("pro-card p-6 border bg-white shadow-xs group", t.border)}
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 6 }}
                  className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform", t.bg)}
                >
                  <Icon className={cn("h-5 w-5", t.icon)} strokeWidth={1.75} />
                </motion.div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#111827]">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#64748B]">{desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </SectionShell>

      {/* CTA Gradient Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1473EA] via-[#3B82F6] to-[#4F46E5] text-white py-14 sm:py-16">
        {/* Animated ambient glow orb */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="container-page relative z-10 w-full">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
            className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <motion.div variants={fadeInUp} className="text-left max-w-xl">
              <h2 className="font-display text-2xl font-bold sm:text-3xl text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-300 shrink-0" />
                Ready to upgrade or repair your device?
              </h2>
              <p className="mt-2 text-sm font-medium text-white/85 sm:text-base">
                Book a repair, sell your old phone, or shop our latest devices today with full confidence.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Link href="/mobile-repair">
                  <span className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-bold text-[#1473EA] shadow-md hover:bg-[#EFF6FF] transition-all">
                    Repair now
                  </span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Link href="/contact">
                  <span className="inline-flex h-11 items-center rounded-full border-2 border-white/70 bg-transparent px-6 text-sm font-bold text-white hover:bg-white/10 transition-all">
                    Contact us
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
