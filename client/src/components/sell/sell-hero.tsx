"use client";

import { motion } from "framer-motion";

export function SellHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      className="max-w-3xl"
    >
      <div className="sell-live-badge">
        <span className="sell-live-dot" aria-hidden />
        Live instant valuation engine
      </div>
      <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem]">
        <span className="sell-gradient-text">Sell your old phone</span>
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--sell-text-muted)] sm:text-lg">
        Share your device details in a few steps. We evaluate honestly and send a transparent offer
        — usually the same day.
      </p>
    </motion.div>
  );
}
