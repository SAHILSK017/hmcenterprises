"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { PhoneMode } from "./phone-scene";

const PhoneScene = dynamic(
  () => import("./phone-scene").then((m) => m.PhoneScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-48 w-24 animate-pulse rounded-[2rem] bg-white/5" />
      </div>
    ),
  }
);

const MICRO_TAGS: Record<PhoneMode, { label: string; color: string }[]> = {
  idle: [
    { label: "Grade A Refurbished", color: "emerald" },
    { label: "Same-day diagnosis", color: "slate" },
  ],
  repair: [
    { label: "Diagnostic complete", color: "emerald" },
    { label: "Genuine parts", color: "slate" },
  ],
  sell: [
    { label: "Instant Cash Offer", color: "emerald" },
    { label: "Free pickup", color: "slate" },
  ],
  shop: [
    { label: "Warranty included", color: "emerald" },
    { label: "Certified devices", color: "slate" },
  ],
};

const STEPS = ["Received", "Diagnosed", "Repairing", "Ready"];
const ACTIVE_STEP = 2;

interface HeroStageProps {
  mode: PhoneMode;
  scrollProgress: number;
}

export function HeroStage({ mode, scrollProgress }: HeroStageProps) {
  const tags = MICRO_TAGS[mode];

  return (
    <div className="relative h-[min(72vh,640px)] w-full lg:h-[min(85vh,720px)]">
      {/* Ambient glows */}
      <div
        className="ambient-glow -left-20 top-1/4 h-64 w-64 bg-emerald-500/30"
        aria-hidden
      />
      <div
        className="ambient-glow -right-10 bottom-1/4 h-48 w-48 bg-teal-400/20"
        aria-hidden
      />

      {/* 3D viewport */}
      <div className="absolute inset-0 z-0">
        <PhoneScene mode={mode} scrollProgress={scrollProgress} className="h-full w-full" />
      </div>

      {/* Floating micro-tags */}
      {tags.map((tag, i) => (
        <motion.div
          key={tag.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 120 }}
          className={`glass-panel absolute z-10 rounded-full px-4 py-2 text-xs font-medium tracking-wide ${
            i === 0 ? "left-4 top-[18%] sm:left-8" : "right-4 top-[32%] sm:right-12"
          } ${tag.color === "emerald" ? "text-emerald-400" : "text-foreground-muted"}`}
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-neon" />
          {tag.label}
        </motion.div>
      ))}

      {/* HUD tracker */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="glass-panel absolute bottom-6 left-1/2 z-20 w-[min(100%,22rem)] -translate-x-1/2 rounded-2xl p-5 sm:bottom-10"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
              Live tracker
            </p>
            <p className="font-display text-lg font-bold tracking-tight text-foreground">
              REP-A3F9K
            </p>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Repairing
          </span>
        </div>

        <div className="neon-line mb-4" />

        <div className="flex justify-between gap-1">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={`relative h-2.5 w-2.5 rounded-full ${
                  i <= ACTIVE_STEP
                    ? "bg-emerald-400 pulse-neon"
                    : "bg-white/10 dark:bg-white/10"
                }`}
              >
                {i === ACTIVE_STEP && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />
                )}
              </div>
              <span
                className={`text-center text-[9px] font-medium leading-tight sm:text-[10px] ${
                  i <= ACTIVE_STEP ? "text-foreground" : "text-foreground-muted"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
