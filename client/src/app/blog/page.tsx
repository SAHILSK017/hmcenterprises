import type { Metadata } from "next";
import BlogPageClient from "./blog-page-client";

export const metadata: Metadata = {
  title: "HMC Journal — Mobile Tips & Guides | HMC Mobile",
  description:
    "Guides for repairing, buying, and selling mobile phones from HMC Mobile.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
