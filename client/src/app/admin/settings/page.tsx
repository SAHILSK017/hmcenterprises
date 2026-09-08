"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SiteSettings = {
  yearsExperience: number;
  showPublicStats: boolean;
  workshopNote: string;
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SiteSettings>({
    yearsExperience: 0,
    showPublicStats: true,
    workshopNote: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<SiteSettings>("/api/site/settings")
      .then((d) =>
        setForm({
          yearsExperience: d.yearsExperience || 0,
          showPublicStats: d.showPublicStats !== false,
          workshopNote: d.workshopNote || "",
        })
      )
      .catch(() => {});
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await api("/api/site/settings", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      toast.success("Public site settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Public About-page stats and workshop copy. Secrets stay in environment variables.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About page stats</CardTitle>
          <CardDescription>
            Only real counts from repairs, orders, and product reviews are shown. Years of experience
            is admin-controlled — leave at 0 to hide that metric.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Years of experience</Label>
            <Input
              type="number"
              min={0}
              className="mt-1.5"
              value={form.yearsExperience}
              onChange={(e) =>
                setForm({ ...form, yearsExperience: Math.max(0, Number(e.target.value) || 0) })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.showPublicStats}
              onChange={(e) => setForm({ ...form, showPublicStats: e.target.checked })}
            />
            Show public statistics section
          </label>
          <div>
            <Label>Workshop note</Label>
            <Textarea
              className="mt-1.5"
              value={form.workshopNote}
              onChange={(e) => setForm({ ...form, workshopNote: e.target.value })}
            />
          </div>
          <Button onClick={save} disabled={busy}>
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <CardDescription>
            Secrets stay in <code className="text-xs">.env</code> — never in the client bundle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            ["MongoDB", "MONGODB_URI"],
            ["Auth", "AUTH_SECRET / JWT"],
            ["Cloudinary", "CLOUDINARY_*"],
            ["COD", "ENABLE_COD=true"],
          ].map(([label, env]) => (
            <div
              key={env}
              className="flex items-center justify-between gap-4 border-b border-border pb-2 last:border-0"
            >
              <span className="font-medium">{label}</span>
              <code className="text-xs text-muted-foreground">{env}</code>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
