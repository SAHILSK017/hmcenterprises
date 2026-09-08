import { Router } from "express";
import { z } from "zod";
import { connectDB } from "../lib/db";
import { BlogPost, BlogCategory } from "../models/Blog";
import { requireAdmin } from "../middleware/auth";
import { slugify } from "../lib/utils";

const router = Router();

const postSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().min(10),
  content: z.string().min(20),
  featuredImage: z.string().optional(),
  category: z.string().min(2),
  tags: z.array(z.string()).optional(),
  authorName: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  publishedAt: z.string().datetime().optional().or(z.literal("")),
  readingMinutes: z.number().int().positive().optional(),
});

router.get("/categories", async (_req, res) => {
  try {
    await connectDB();
    const items = await BlogCategory.find().sort({ name: 1 }).lean();
    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(48, Number(req.query.limit || 20));
    const status = String(req.query.status || "").trim();
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const [items, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);
    return res.json({ items, total, page, limit });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/", async (req, res) => {
  try {
    await connectDB();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(24, Number(req.query.limit || 9));
    const q = String(req.query.q || "").trim();
    const category = String(req.query.category || "").trim();

    const filter: Record<string, unknown> = {
      status: { $in: ["published", "scheduled"] },
      publishedAt: { $lte: new Date() },
    };
    if (category) filter.category = category;
    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { excerpt: new RegExp(q, "i") },
        { tags: new RegExp(q, "i") },
      ];
    }

    const [items, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);
    return res.json({ items, total, page, limit });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    await connectDB();
    const post = await BlogPost.findOne({
      slug: req.params.slug,
      status: { $in: ["published", "scheduled"] },
      publishedAt: { $lte: new Date() },
    }).lean();
    if (!post) return res.status(404).json({ error: "Article not found" });

    const related = await BlogPost.find({
      status: { $in: ["published", "scheduled"] },
      publishedAt: { $lte: new Date() },
      slug: { $ne: post.slug },
      category: post.category,
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    return res.json({ post, related });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch article" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = postSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }
    await connectDB();
    const data = parsed.data;
    const base = data.slug ? slugify(data.slug) : slugify(data.title);
    let slug = base;
    let n = 2;
    while (await BlogPost.exists({ slug })) slug = `${base}-${n++}`;

    const publishedAt =
      data.status === "published"
        ? data.publishedAt
          ? new Date(data.publishedAt)
          : new Date()
        : data.publishedAt
          ? new Date(data.publishedAt)
          : undefined;

    const post = await BlogPost.create({
      ...data,
      slug,
      publishedAt,
      readingMinutes: data.readingMinutes || Math.max(3, Math.ceil(data.content.split(/\s+/).length / 200)),
    });
    return res.status(201).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create post" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const parsed = postSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }
    await connectDB();
    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.slug) updates.slug = slugify(parsed.data.slug);
    if (parsed.data.publishedAt === "") updates.publishedAt = undefined;
    else if (parsed.data.publishedAt) updates.publishedAt = new Date(parsed.data.publishedAt);
    if (parsed.data.status === "published" && !parsed.data.publishedAt) {
      updates.publishedAt = new Date();
    }

    const post = await BlogPost.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await connectDB();
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete post" });
  }
});

export default router;
