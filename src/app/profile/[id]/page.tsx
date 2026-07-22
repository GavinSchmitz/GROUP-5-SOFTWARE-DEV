export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Star, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
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

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userSkills: {
        include: { skill: true },
      },
      reviewsReceived: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { requestedBookings: true, providedBookings: true },
      },
    },
  });

  if (!user) notFound();

  const session = await auth();
  const currentUserId = session?.user?.id;
  const isOwnProfile = currentUserId === user.id;

  const skillsOffered = user.userSkills.filter((us) => us.isOffered);
  const skillsWanted = user.userSkills.filter((us) => !us.isOffered);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

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
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold">
            {user.name ?? "Unnamed User"}
          </h1>

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
              {user.createdAt.toLocaleDateString("en-US", {
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

          {!isOwnProfile && currentUserId && (
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
                  render={
                    <Link href={`/bookings/new?provider=${user.id}`} />
                  }
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
                  <CardTitle>{us.skill.name}</CardTitle>
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
                  <CardTitle>{us.skill.name}</CardTitle>
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
          Reviews ({user.reviewsReceived.length})
        </h2>

        {user.reviewsReceived.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {user.reviewsReceived.map((review) => (
              <Card key={review.id}>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={review.author.image ?? undefined}
                        alt={review.author.name ?? "Reviewer"}
                      />
                      <AvatarFallback>
                        {review.author.name
                          ? review.author.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "??"}
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
                          {review.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
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
    </div>
  );
}
