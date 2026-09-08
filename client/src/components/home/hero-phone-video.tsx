"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-motion-preference";
import { cn } from "@/lib/utils";

const HERO_VIDEO_SRC = "/videos/phone-hero.mp4?v=2";

export function HeroPhoneVideo({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;

    const play = () => {
      video.play().catch(() => {
        /* autoplay blocked until user interaction */
      });
    };

    if (video.readyState >= 2) {
      play();
    } else {
      video.addEventListener("canplay", play, { once: true });
    }

    return () => {
      video.removeEventListener("canplay", play);
    };
  }, [reducedMotion]);

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-end justify-end overflow-hidden bg-transparent",
        className
      )}
      aria-hidden
    >
      <div className="relative h-[108%] w-[115%] min-h-[480px] sm:min-h-[540px] lg:min-h-full lg:pb-0">
        <video
          ref={videoRef}
          className="hero-phone-video relative h-full w-full opacity-100 transition-opacity duration-300"
          src={HERO_VIDEO_SRC}
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controls={false}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[24%] bg-gradient-to-r from-[#E4E9ED] via-[#E4E9ED]/50 to-transparent z-10"
          aria-hidden
        />
      </div>
    </div>
  );
}
