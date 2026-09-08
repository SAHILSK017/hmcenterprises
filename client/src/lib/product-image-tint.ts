import React from "react";

/**
 * Safe helper to extract string values from primitives or populated object fields (e.g. { name, title, slug })
 */
function safeString(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (typeof obj.name === "string") return obj.name;
    if (typeof obj.title === "string") return obj.title;
    if (typeof obj.label === "string") return obj.label;
    if (typeof obj.slug === "string") return obj.slug;
    if (typeof obj.value === "string") return obj.value;
  }
  return "";
}

/**
 * Returns a subtle background tint class and inline background style for a product image container
 * based on product color, brand, or category without modifying the product image itself.
 */
export function getProductImageBgStyle(product?: {
  name?: unknown;
  brand?: unknown;
  category?: unknown;
  specifications?: { color?: unknown };
  availableColors?: unknown[];
} | null): { className: string; style?: React.CSSProperties } {
  if (!product) {
    return { className: "bg-[#FFF7ED] border-[#FFEDD5]" };
  }

  const specColor = safeString(product.specifications?.color);
  const availColor = Array.isArray(product.availableColors) ? safeString(product.availableColors[0]) : "";
  const nameStr = safeString(product.name);

  const colorStr = (specColor || availColor || nameStr).toLowerCase();
  const brandStr = safeString(product.brand).toLowerCase();
  const categoryStr = safeString(product.category).toLowerCase();

  // Teal Green / Mint / Cyan / Blue
  if (colorStr.includes("blue") || colorStr.includes("cyan") || colorStr.includes("teal") || colorStr.includes("mint") || colorStr.includes("green")) {
    return { className: "bg-[#F0FDFA] border-[#CCFBF1]" }; // Teal Green tint
  }

  // Orange / Gold / Yellow / Warm / Bronze / Amber
  if (colorStr.includes("orange") || colorStr.includes("gold") || colorStr.includes("yellow") || colorStr.includes("cream") || colorStr.includes("warm") || colorStr.includes("bronze") || colorStr.includes("desert") || colorStr.includes("starlight")) {
    return { className: "bg-[#FFF7ED] border-[#FFEDD5]" }; // Orange warm tint
  }

  // Indigo / Dark / Black / Graphite
  if (colorStr.includes("black") || colorStr.includes("graphite") || colorStr.includes("dark") || colorStr.includes("space") || colorStr.includes("midnight") || colorStr.includes("titanium")) {
    return { className: "bg-[#F8FAFC] border-[#E2E8F0]" }; // Neutral dark tint
  }

  // Violet / Purple / Lavender
  if (colorStr.includes("purple") || colorStr.includes("violet") || colorStr.includes("lavender") || colorStr.includes("plum") || categoryStr.includes("refurbished")) {
    return { className: "bg-[#F5F3FF] border-[#DDD6FE]" }; // Violet tint
  }

  // Red / Rose / Coral / Pink
  if (colorStr.includes("red") || colorStr.includes("pink") || colorStr.includes("rose") || colorStr.includes("coral")) {
    return { className: "bg-[#FEF2F2] border-[#FECACA]" }; // Rose tint
  }

  // Brand-based defaults
  if (brandStr.includes("apple")) {
    return { className: "bg-[#FFF7ED] border-[#FFEDD5]" }; // Soft Orange tint
  }

  if (brandStr.includes("samsung")) {
    return { className: "bg-[#F0FDFA] border-[#CCFBF1]" }; // Soft Teal tint
  }

  // Default clean soft orange tint
  return { className: "bg-[#FFF7ED] border-[#FFEDD5]" };
}

