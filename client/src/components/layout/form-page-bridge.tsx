"use client";

import { useLayoutEffect } from "react";

/** Resets scroll on service form pages (sell, repair) and prevents horizontal overflow. */
export function FormPageBridge() {
  useLayoutEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const scrollTop = () => window.scrollTo(0, 0);
    scrollTop();
    requestAnimationFrame(scrollTop);

    document.documentElement.classList.add("service-page-active");
    document.body.classList.add("overflow-x-hidden");

    return () => {
      history.scrollRestoration = previous;
      document.documentElement.classList.remove("service-page-active");
      document.body.classList.remove("overflow-x-hidden");
    };
  }, []);

  return null;
}
