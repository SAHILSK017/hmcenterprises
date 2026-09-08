"use client";

import { useLayoutEffect } from "react";

export function SellThemeBridge() {
  useLayoutEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const scrollTop = () => window.scrollTo(0, 0);
    scrollTop();
    requestAnimationFrame(scrollTop);

    document.documentElement.classList.add("sell-page-active");
    document.body.classList.add("overflow-x-hidden");

    return () => {
      history.scrollRestoration = previous;
      document.documentElement.classList.remove("sell-page-active");
      document.body.classList.remove("overflow-x-hidden");
    };
  }, []);

  return null;
}
