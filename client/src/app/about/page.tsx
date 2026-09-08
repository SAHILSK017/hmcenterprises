import type { Metadata } from "next";
import { AboutPageContent } from "@/components/about/about-page-content";

export const metadata: Metadata = {
  title: "HMC Mobile — Mobile Repair, Buy & Sell",
  description:
    "Professional mobile repair, trusted phone buyback and new & refurbished mobile phones from HMC Mobile.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
