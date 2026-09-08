"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type Post = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  status: string;
  publishedAt?: string;
  authorName?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
};

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  category: "Mobile Tips",
  status: "draft",
  authorName: "HMC Mobile",
  seoTitle: "",
  seoDescription: "",
  tags: "",
  publishedAt: "",
};

export default function AdminBlogPage() {
  const [items, setItems] = useState<Post[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api<{ items: Post[] }>("/api/blog/admin/all?limit=48")
      .then((d) => setItems(d.items || []))
      .catch((e) => toast.error(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        featuredImage: form.featuredImage || undefined,
        category: form.category,
        status: form.status,
        authorName: form.authorName,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        seoTitle: form.seoTitle || form.title,
        seoDescription: form.seoDescription || form.excerpt,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : "",
      };
      if (editingId) {
        await api(`/api/blog/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) });
        toast.success("Article updated");
      } else {
        await api("/api/blog", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Article created");
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try {
      await api(`/api/blog/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Blog</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create, edit, publish and archive journal articles.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit article" : "New article"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Title</Label>
            <Input
              className="mt-1.5"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              className="mt-1.5"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {[
                "Mobile Tips",
                "Repair Guides",
                "Battery Care",
                "Buying Guide",
                "Used Phone Guide",
                "Sell Your Phone",
                "Troubleshooting",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              className="mt-1.5"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <div>
            <Label>Publish / schedule date</Label>
            <Input
              type="datetime-local"
              className="mt-1.5"
              value={form.publishedAt}
              onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Excerpt</Label>
            <Textarea
              className="mt-1.5"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Content</Label>
            <Textarea
              className="mt-1.5 min-h-[160px]"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div>
            <Label>Featured image URL</Label>
            <Input
              className="mt-1.5"
              value={form.featuredImage}
              onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
            />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input
              className="mt-1.5"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
          <div>
            <Label>SEO title</Label>
            <Input
              className="mt-1.5"
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
            />
          </div>
          <div>
            <Label>SEO description</Label>
            <Input
              className="mt-1.5"
              value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={save} disabled={busy}>
              {editingId ? "Update" : "Create"} article
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.map((post) => (
          <Card key={post._id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-semibold">{post.title}</p>
                <p className="text-xs text-muted-foreground">
                  {post.status} · {post.category} ·{" "}
                  {post.publishedAt ? formatDate(post.publishedAt) : "Not published"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(post._id);
                    setForm({
                      title: post.title,
                      excerpt: post.excerpt,
                      content: post.content,
                      featuredImage: post.featuredImage || "",
                      category: post.category,
                      status: post.status,
                      authorName: post.authorName || "HMC Mobile",
                      seoTitle: post.seoTitle || "",
                      seoDescription: post.seoDescription || "",
                      tags: (post.tags || []).join(", "),
                      publishedAt: post.publishedAt
                        ? new Date(post.publishedAt).toISOString().slice(0, 16)
                        : "",
                    });
                  }}
                >
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => remove(post._id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
