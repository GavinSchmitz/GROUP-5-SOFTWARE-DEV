"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { SkillsListResponse } from "@/types/api";

function SkillsPageInner() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const [data, setData] = useState<SkillsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<SkillsListResponse>("/skills", {
        params: { q: q || undefined, category: category || undefined, page: 1, limit: 100 },
      })
      .then((response) => {
        setError(null);
        setData(response);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load skills. Please try again.");
        setLoading(false);
      });
  }, [q, category]);

  const skills = data?.skills ?? [];
  const allCategories = data?.categories ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Browse Skills</h1>
        <p className="mt-2 text-muted-foreground">
          Find community members who can teach you something new.
        </p>
      </div>

      <form className="mb-6" action="/skills" method="GET">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            name="q"
            placeholder="Search skills..."
            defaultValue={q}
            className="pl-9"
          />
        </div>
        {category && <input type="hidden" name="category" value={category} />}
      </form>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/skills"
          className={`inline-flex h-8 items-center rounded-lg border px-2.5 text-sm font-medium transition-colors ${
            !category
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          All
        </Link>
        {allCategories.map((cat) => (
          <Link
            key={cat}
            href={`/skills?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`inline-flex h-8 items-center rounded-lg border px-2.5 text-sm font-medium transition-colors ${
              category === cat
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Loading skills…
        </div>
      ) : error ? (
        <p className="py-12 text-center text-destructive">{error}</p>
      ) : skills.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No skills found. Try a different search or category.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{skill.name}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {skill.category}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {skill.description}
                  </CardDescription>
                </CardHeader>
                <CardDescription className="flex items-center gap-1.5 px-(--card-spacing) text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {skill._count.userSkills}{" "}
                  {skill._count.userSkills === 1 ? "provider" : "providers"}
                </CardDescription>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SkillsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-40 rounded-xl bg-muted" />
          </div>
        </div>
      }
    >
      <SkillsPageInner />
    </Suspense>
  );
}
