import type { Metadata } from "next";
import { BlogArticleContent } from "@/components/blog/blog-article-content";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Props = { params: Promise<{ slug: string }> };

async function fetchPost(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/blog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.post as {
      title: string;
      slug: string;
      excerpt: string;
      seoTitle?: string;
      seoDescription?: string;
      featuredImage?: string;
      authorName?: string;
      publishedAt?: string;
      category: string;
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) {
    return { title: "Article | HMC Mobile" };
  }
  const title = post.seoTitle || `${post.title} | HMC Mobile`;
  const description = post.seoDescription || post.excerpt;
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPost(slug);

  const jsonLd =
    post &&
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.seoDescription || post.excerpt,
      image: post.featuredImage || undefined,
      author: { "@type": "Organization", name: post.authorName || "HMC Mobile" },
      datePublished: post.publishedAt,
      articleSection: post.category,
      mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogArticleContent />
    </>
  );
}
