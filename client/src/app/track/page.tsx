"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { PageSection } from "@/components/layout/page-section";

export default function TrackPage() {
  const router = useRouter();
  const [id, setId] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = id.trim().toUpperCase();
    if (/^(REP|SELL|ORD)-[A-Z0-9]+$/.test(value)) router.push(`/track/${value}`);
  };

  return (
    <PageSection innerClassName="flex justify-center">
      <Card className="mx-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle>Track your request</CardTitle>
          <CardDescription>Enter the Order, Repair, or Sell ID from your confirmation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="id">Request ID</Label>
              <Input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="ORD-XXXXX, REP-XXXXX, or SELL-XXXXX"
                className="mt-1.5 uppercase"
              />
            </div>
            <Button type="submit" className="w-full">
              <Search className="h-4 w-4" /> Track request
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageSection>
  );
}
