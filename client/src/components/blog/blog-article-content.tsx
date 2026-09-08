"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

type Post = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  authorName?: string;
  publishedAt?: string;
  readingMinutes?: number;
};

export function BlogArticleContent() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    api<{ post: Post; related: Post[] }>(`/api/blog/${slug}`)
      .then((d) => {
        setPost(d.post);
        setRelated(d.related || []);
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <div className="container-page py-20 text-center">
        <p>{error}</p>
        <Link href="/blog" className="mt-4 inline-block text-brand">
          Back to blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page py-20">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <article className="bg-[var(--canvas)]">
      <div className="container-page py-8 sm:py-12">
        <nav className="flex flex-wrap items-center gap-1 text-xs text-foreground/50">
          <Link href="/" className="hover:text-brand">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="hover:text-brand">
            Blog
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/70">{post.title}</span>
        </nav>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-brand">{post.category}</p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-foreground/50">
          {post.authorName || "HMC Mobile"} ·{" "}
          {post.publishedAt ? formatDate(post.publishedAt) : ""} · {post.readingMinutes || 4} min
          read
        </p>

        {post.featuredImage && (
          <div className="mt-8 overflow-hidden rounded-3xl bg-[#eceef2]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.featuredImage} alt="" className="max-h-[480px] w-full object-cover" />
          </div>
        )}

        <div className="prose prose-neutral mx-auto mt-10 max-w-3xl whitespace-pre-wrap text-[17px] leading-relaxed text-foreground/75">
          {post.content}
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="font-display text-2xl font-bold">Related articles</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="rounded-2xl border bg-white p-5">
                  <p className="text-[11px] font-bold uppercase text-brand">{r.category}</p>
                  <p className="mt-2 font-semibold">{r.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 rounded-3xl bg-foreground px-6 py-12 text-center text-background sm:px-10">
          <h2 className="font-display text-3xl font-bold">NEED MOBILE HELP?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/mobile-repair">
              <span className="inline-flex h-11 items-center rounded-full bg-background px-5 text-sm font-bold text-foreground">
                REPAIR YOUR PHONE
              </span>
            </Link>
            <Link href="/sell-your-phone">
              <span className="inline-flex h-11 items-center rounded-full border border-background/30 px-5 text-sm font-bold">
                SELL YOUR PHONE
              </span>
            </Link>
            <Link href="/shop">
              <span className="inline-flex h-11 items-center rounded-full border border-background/30 px-5 text-sm font-bold">
                SHOP PHONES
              </span>
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
