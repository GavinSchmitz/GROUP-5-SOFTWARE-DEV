"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { SkillsListResponse } from "@/types/api";

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const category = decodeURIComponent(params.category);

  const [data, setData] = useState<SkillsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<SkillsListResponse>("/skills", {
        params: { category, page: 1, limit: 100 },
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
  }, [category]);

  const skills = data?.skills ?? [];
  const count = skills.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/skills"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All skills
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{category}</h1>
        <p className="mt-2 text-muted-foreground">
          {count} {count === 1 ? "skill" : "skills"} in this category
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Loading skills…
        </div>
      ) : error ? (
        <p className="py-12 text-center text-destructive">{error}</p>
      ) : count === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No skills found in this category yet.
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
