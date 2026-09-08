"use client";

import { BadgeIndianRupee, MessageCircle, ShieldCheck, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const PERKS = [
  {
    icon: BadgeIndianRupee,
    title: "Fair market price",
    desc: "Transparent valuation based on real condition — no hidden deductions.",
    accent: "from-cyan-500/20 to-blue-500/10",
  },
  {
    icon: MessageCircle,
    title: "Offer on WhatsApp",
    desc: "Receive your quote directly on WhatsApp within hours.",
    accent: "from-emerald-500/15 to-cyan-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Secure & simple",
    desc: "IMEI-checked process with clear steps from quote to payment.",
    accent: "from-blue-500/20 to-indigo-500/10",
  },
] as const;

export function SellPerksPanel() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="lg:sticky lg:top-28"
    >
      <div className="sell-glass-panel sell-glass-panel-hover p-6 sm:p-7">
        <div className="sell-holo-icon mb-5">
          <Smartphone className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <p className="font-mono-label text-[10px] font-semibold uppercase text-[var(--sell-cyan)]">
          Telemetry · Buyback
        </p>
        <h2 className="mt-2 font-display text-lg font-bold tracking-tight text-[var(--sell-text)]">
          Why sell with HMC?
        </h2>
        <ul className="mt-6 space-y-5">
          {PERKS.map(({ icon: Icon, title, desc, accent }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              className="group flex gap-3.5"
            >
              <span
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br ${accent} shadow-[0_0_20px_rgba(0,240,255,0.08)] transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon className="h-4 w-4 text-[var(--sell-cyan)]" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[var(--sell-text)]">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--sell-text-muted)]">{desc}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
      <p className="mt-4 px-1 font-mono-label text-[10px] leading-relaxed text-[var(--sell-text-muted)]">
        {/* accepts all conditions — like new · good · damaged */}
      </p>
    </motion.aside>
  );
}
