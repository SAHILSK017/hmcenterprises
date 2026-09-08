"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import {
  SCROLL_NARRATIVE,
  scrollToExplode,
  type PhoneComponentId,
} from "@/lib/phone-components";
import { useReducedMotion, useWebGLSupport } from "@/hooks/use-motion-preference";
import { ComponentPanel } from "./component-panel";
import { useGlbAvailable } from "./phone-glb-model";
import { DEFAULT_PHONE_GLB } from "@/lib/phone-glb";
import { PhoneFallbackVisual } from "./exploded-phone";

const ExplodedPhoneCanvas = dynamic(
  () => import("./exploded-phone").then((m) => m.ExplodedPhoneCanvas),
  { ssr: false, loading: () => <PhoneFallbackVisual className="h-full w-full" /> }
);

export function CinematicScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedId, setSelectedId] = useState<PhoneComponentId | null>(null);
  const reducedMotion = useReducedMotion();
  const webgl = useWebGLSupport();
  const use3D = webgl && !reducedMotion;
  const glbAvailable = useGlbAvailable(DEFAULT_PHONE_GLB);
  const glbUrl = glbAvailable ? DEFAULT_PHONE_GLB : null;

  const explode = scrollToExplode(scrollProgress);
  const narrative =
    SCROLL_NARRATIVE.find((n) => scrollProgress >= n.start && scrollProgress < n.end) ??
    SCROLL_NARRATIVE[SCROLL_NARRATIVE.length - 1];

  const onSelect = useCallback((id: PhoneComponentId | null) => {
    setSelectedId(id);
  }, []);

  useEffect(() => {
    if (reducedMotion || !containerRef.current || !pinRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: pinRef.current,
        scrub: 0.8,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Reduced motion: static mid-explode state
  const displayExplode = reducedMotion ? 0.5 : explode;

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: reducedMotion ? "auto" : "400vh" }}
      aria-label="Interactive phone repair experience"
    >
      <div
        ref={pinRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--canvas)] py-24 lg:flex-row lg:gap-8"
      >
        <div className="ambient-glow left-1/3 top-1/4 h-96 w-96 -translate-x-1/2 bg-emerald-600/15" aria-hidden />

        {/* Narrative */}
        <div className="container-page relative z-10 flex flex-1 flex-col justify-center px-4 lg:max-w-md lg:pl-8">
          <motion.div
            key={narrative.headline}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400/80">
              Inside your device
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
              {narrative.headline}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-foreground-muted">{narrative.sub}</p>
          </motion.div>

          {!reducedMotion && (
            <div className="mt-8 hidden lg:block">
              <div className="h-1 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${scrollProgress * 100}%` }}
                />
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-widest text-foreground-muted">
                Scroll to explore · Tap parts on mobile
              </p>
            </div>
          )}
        </div>

        {/* 3D viewport */}
        <div className="relative h-[min(55vh,520px)] w-full max-w-lg flex-1 lg:h-[min(75vh,640px)]">
          {use3D ? (
            <ExplodedPhoneCanvas
              explode={displayExplode}
              selectedId={selectedId}
              onSelect={onSelect}
              autoRotate={scrollProgress < 0.1 || scrollProgress > 0.9}
              reducedMotion={reducedMotion}
              glbUrl={glbUrl}
              className="h-full w-full"
            />
          ) : (
            <PhoneFallbackVisual className="h-full w-full" />
          )}
          <ComponentPanel componentId={selectedId} onClose={() => onSelect(null)} />
        </div>
      </div>
    </section>
  );
}
