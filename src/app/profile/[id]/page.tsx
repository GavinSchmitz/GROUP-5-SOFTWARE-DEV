"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Star,
  MessageSquare,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuth } from "@/components/auth/use-auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EditProfileDialog } from "./edit-profile-dialog";
import type {
  UserProfile,
  ReviewsResponse,
  ReviewEntry,
} from "@/types/api";

const proficiencyColors: Record<string, string> = {
  BEGINNER: "bg-blue-100 text-blue-800",
  INTERMEDIATE: "bg-green-100 text-green-800",
  ADVANCED: "bg-purple-100 text-purple-800",
  EXPERT: "bg-amber-100 text-amber-800",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function formatProficiency(p: string) {
  return p.charAt(0) + p.slice(1).toLowerCase();
}

function getInitials(name: string | null) {
  return name
    ? name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";
}

function ProfileContent() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { user: currentUser, refreshUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [removingSkill, setRemovingSkill] = useState<number | null>(null);

  const load = useCallback(async () => {
    return Promise.all([
      api.get<UserProfile>(`/users/${id}`),
      api.get<ReviewsResponse>("/reviews", { params: { userId: id } }),
    ])
      .then(([profileRes, reviewsRes]) => {
        setNotFound(false);
        setProfile(profileRes);
        setReviews(reviewsRes.reviews);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleProfileSaved(updated: UserProfile) {
    setProfile(updated);
    if (currentUser) {
      refreshUser({ ...currentUser, name: updated.name });
    }
  }

  async function removeUserSkill(userSkillId: number) {
    setRemovingSkill(userSkillId);
    try {
      await api.delete(`/user-skills/${userSkillId}`);
      await load();
    } catch {
      // ignore — keep list unchanged
    } finally {
      setRemovingSkill(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        <span>Loading…</span>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="py-12 text-center text-muted-foreground">User not found.</p>
      </div>
    );
  }

  const user = profile;
  const isOwnProfile = currentUser?.id === id;

  const skillsOffered = user.userSkills.filter((us) => us.is_offered);
  const skillsWanted = user.userSkills.filter((us) => !us.is_offered);
  const totalBookings =
    user._count.providedBookings + user._count.requestedBookings;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar size="lg" className="size-24 text-lg">
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name ?? "User"}
          />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">{user.name ?? "Unnamed User"}</h1>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground sm:justify-start">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {user.bio && (
            <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge variant="default" className="text-sm">
              {user.creditBalance} credits
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {totalBookings} sessions
            </Badge>
          </div>

          {isOwnProfile && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" />
                Edit Profile
              </Button>
            </div>
          )}

          {!isOwnProfile && currentUser && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Link
                href={`/messages?userId=${user.id}`}
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/80 h-8 gap-1.5 px-2.5"
              >
                <MessageSquare className="size-4" />
                Send Message
              </Link>
              {skillsOffered.length > 0 && (
                <Button
                  variant="outline"
                  render={<Link href={`/bookings/new?providerId=${user.id}`} />}
                >
                  Request Session
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Skills Offered */}
      {skillsOffered.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Skills Offered</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {skillsOffered.map((us) => (
              <Card key={us.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{us.skill.name}</CardTitle>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={removingSkill === us.id}
                        onClick={() => removeUserSkill(us.id)}
                        title="Remove skill"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge className={proficiencyColors[us.proficiency]}>
                      {formatProficiency(us.proficiency)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {us.skill.category}
                    </span>
                  </div>
                  {us.note && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {us.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Skills Wanted */}
      {skillsWanted.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Skills Wanted</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {skillsWanted.map((us) => (
              <Card key={us.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{us.skill.name}</CardTitle>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={removingSkill === us.id}
                        onClick={() => removeUserSkill(us.id)}
                        title="Remove skill"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {formatProficiency(us.proficiency)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {us.skill.category}
                    </span>
                  </div>
                  {us.note && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {us.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={review.author.image ?? undefined}
                        alt={review.author.name ?? "Reviewer"}
                      />
                      <AvatarFallback>
                        {getInitials(review.author.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${review.author.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {review.author.name ?? "Anonymous"}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <StarRating rating={review.rating} />
                      {review.comment && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {editOpen && profile && (
        <EditProfileDialog
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={handleProfileSaved}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
