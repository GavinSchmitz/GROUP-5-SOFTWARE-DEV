"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MapPin, Loader2, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/components/auth/use-auth";
import { parseApiError } from "@/lib/errors";
import type {
  Proficiency,
  SkillsListResponse,
  SkillDetailResponse,
  UserSkillResponse,
} from "@/types/api";

const PROFICIENCY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

const PROFICIENCY_OPTIONS: Proficiency[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
];

const PROFICIENCY_VARIANTS: Record<
  string,
  "secondary" | "outline" | "default" | "destructive"
> = {
  BEGINNER: "outline",
  INTERMEDIATE: "secondary",
  ADVANCED: "default",
  EXPERT: "default",
};

export default function SkillDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { user } = useAuth();

  const [skill, setSkill] = useState<SkillDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isOffered, setIsOffered] = useState(true);
  const [proficiency, setProficiency] = useState<Proficiency>("INTERMEDIATE");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const load = useCallback(() => {
    return api
      .get<SkillsListResponse>("/skills", { params: { limit: 100 } })
      .then((list) => {
        const match = list.skills.find((s) => s.slug === slug);
        if (!match) return null;
        return api.get<SkillDetailResponse>(`/skills/${match.id}`);
      })
      .then((detail) => {
        if (detail) {
          setError(null);
          setSkill(detail);
        } else {
          setError("not_found");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("not_found");
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddToProfile() {
    if (!skill) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.post<UserSkillResponse>("/user-skills", {
        skillId: skill.id,
        isOffered,
        proficiency,
        note: note.trim() || undefined,
      });
      setFeedback({
        kind: "success",
        message: "Added to your profile.",
      });
      setPanelOpen(false);
      setNote("");
      load();
    } catch (err) {
      const parsed = parseApiError(err);
      setFeedback({
        kind: "error",
        message:
          parsed.status === 409
            ? "This skill is already on your profile."
            : parsed.message || "Failed to add skill. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/skills"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Skills
        </Link>
        <p className="py-12 text-center text-muted-foreground">
          Skill not found.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/skills"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Skills
      </Link>

      <div className="mb-8">
        <div className="flex items-start gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{skill.name}</h1>
          <Badge variant="secondary">{skill.category}</Badge>
        </div>
        {skill.description && (
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {skill.description}
          </p>
        )}
      </div>

      {user ? (
        panelOpen ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Add to your profile</CardTitle>
              <CardDescription>
                Tell the community whether you can teach this skill or want to
                learn it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedback && (
                <div
                  className={`rounded-lg border p-3 text-sm ${
                    feedback.kind === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={isOffered ? "default" : "outline"}
                  onClick={() => setIsOffered(true)}
                >
                  I can teach this
                </Button>
                <Button
                  type="button"
                  variant={!isOffered ? "default" : "outline"}
                  onClick={() => setIsOffered(false)}
                >
                  I want to learn
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Proficiency</Label>
                <Select
                  value={proficiency}
                  onValueChange={(value) =>
                    setProficiency(value as Proficiency)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {PROFICIENCY_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-skill-note">Note (optional)</Label>
                <Input
                  id="user-skill-note"
                  value={note}
                  maxLength={200}
                  placeholder="e.g. 5 years of experience"
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleAddToProfile}
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  {submitting ? "Adding…" : "Add to Profile"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPanelOpen(false);
                    setFeedback(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            type="button"
            className="mb-8"
            onClick={() => setPanelOpen(true)}
          >
            <Plus className="size-4" />
            Add to My Profile
          </Button>
        )
      ) : (
        <Link
          href="/signin"
          className={`${buttonVariants({ variant: "outline" })} mb-8`}
        >
          Sign in to add this skill to your profile
        </Link>
      )}

      <h2 className="mb-4 text-xl font-semibold">
        Providers ({skill.userSkills.length})
      </h2>

      {skill.userSkills.length === 0 ? (
        <p className="py-8 text-muted-foreground">
          No providers available for this skill yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skill.userSkills.map((us) => (
            <Card key={us.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={us.user.image ?? ""}
                      alt={us.user.name ?? ""}
                    />
                    <AvatarFallback>
                      {us.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">
                      <Link
                        href={`/profile/${us.user.id}`}
                        className="hover:underline"
                      >
                        {us.user.name ?? "Anonymous"}
                      </Link>
                    </CardTitle>
                    {"location" in us.user && us.user.location && (
                      <CardDescription className="mt-0.5 flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {us.user.location}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge
                  variant={PROFICIENCY_VARIANTS[us.proficiency] ?? "secondary"}
                >
                  {PROFICIENCY_LABELS[us.proficiency] ?? us.proficiency}
                </Badge>
                <Link
                  href={`/bookings/new?skillId=${skill.id}&providerId=${us.user.id}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  Request Session
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
