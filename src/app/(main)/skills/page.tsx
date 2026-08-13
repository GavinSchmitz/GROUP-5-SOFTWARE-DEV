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
import { Search, Users, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import { getCategoryStyle } from "@/lib/category-style";
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
      {/* ─── Vibrant banner ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 px-6 py-14 sm:px-12 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/95 to-amber-900/50" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #f59e0b 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-amber-500/20 blur-[110px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-orange-500/20 blur-[110px]" />
        <div className="pointer-events-none absolute right-1/4 top-1/4 h-44 w-44 rounded-full bg-pink-500/10 blur-[90px]" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            Discover
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Browse{" "}
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Skills
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-300">
            Find community members who can teach you something new — from
            guitar to gardening, no cash needed.
          </p>

          <form
            className="relative mt-8 max-w-xl"
            action="/skills"
            method="GET"
          >
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-400" />
            <Input
              type="text"
              name="q"
              placeholder="Search skills..."
              defaultValue={q}
              className="h-12 rounded-xl border-white/20 bg-white/10 pl-11 text-base text-white placeholder:text-gray-400 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/30"
            />
            {category && (
              <input type="hidden" name="category" value={category} />
            )}
          </form>
        </div>
      </section>

      {/* ─── Category filters ─── */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href={`/skills${q ? `?q=${encodeURIComponent(q)}` : ""}`}
          className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-all ${
            !category
              ? "border-transparent bg-gray-900 text-white shadow-md"
              : "border-border bg-background text-foreground hover:border-amber-300 hover:text-amber-700"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          All
        </Link>
        {allCategories.map((cat) => {
          const style = getCategoryStyle(cat);
          return (
            <Link
              key={cat}
              href={`/skills?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-all ${
                category === cat
                  ? `border-transparent text-white shadow-md ${style.chip}`
                  : `border-border bg-background text-foreground ${style.text} hover:bg-gray-50`
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full bg-gradient-to-br ${style.gradient}`}
              />
              {cat}
            </Link>
          );
        })}
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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => {
            const style = getCategoryStyle(skill.category);
            return (
              <Link
                key={skill.id}
                href={`/skills/${skill.slug}`}
                className="group"
              >
                <Card className="h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl hover:shadow-xl group-hover:ring-foreground/20">
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${style.gradient}`}
                  />
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} text-white shadow-md`}
                      >
                        <style.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {skill.name}
                        </CardTitle>
                        <div className="mt-1.5">
                          <Badge
                            className={`border-0 ${style.bg} ${style.text}`}
                          >
                            {skill.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {skill.description}
                    </CardDescription>
                  </CardHeader>
                  <CardDescription className="mt-auto flex items-center gap-1.5 border-t border-foreground/10 px-(--card-spacing) pt-3 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {skill._count.userSkills}{" "}
                    {skill._count.userSkills === 1 ? "provider" : "providers"}
                  </CardDescription>
                </Card>
              </Link>
            );
          })}
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
