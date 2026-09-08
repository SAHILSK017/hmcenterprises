"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import type { PhoneComponentId } from "@/lib/phone-components";
import { PHONE_COMPONENTS } from "@/lib/phone-components";

interface ComponentPanelProps {
  componentId: PhoneComponentId | null;
  onClose: () => void;
}

export function ComponentPanel({ componentId, onClose }: ComponentPanelProps) {
  const meta = componentId ? PHONE_COMPONENTS[componentId] : null;

  return (
    <AnimatePresence>
      {meta && (
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="glass-panel absolute bottom-6 left-4 right-4 z-30 max-w-sm rounded-2xl p-6 sm:left-auto sm:right-6 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-foreground-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Component
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold tracking-tight">{meta.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{meta.description}</p>
          <ul className="mt-4 space-y-2">
            {meta.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                {b}
              </li>
            ))}
          </ul>
          <Link href={meta.repairHref} className="mt-6 inline-block">
            <span className="pill-cta-primary text-sm">{meta.repairLabel}</span>
          </Link>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
