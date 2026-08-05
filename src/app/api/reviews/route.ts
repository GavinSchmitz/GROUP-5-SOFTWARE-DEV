import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId query param required" },
      { status: 400 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      booking: {
        select: { id: true, skill: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const parsed = createReviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { bookingId, rating, comment } = parsed.data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { skill: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Can only review completed bookings" },
      { status: 400 }
    );
  }

  if (booking.requesterId !== userId && booking.providerId !== userId) {
    return NextResponse.json(
      { error: "You are not part of this booking" },
      { status: 403 }
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: { bookingId_authorId: { bookingId, authorId: userId } },
  });

  if (existingReview) {
    return NextResponse.json(
      { error: "You have already reviewed this booking" },
      { status: 400 }
    );
  }

  const revieweeId =
    booking.requesterId === userId
      ? booking.providerId
      : booking.requesterId;

  const review = await prisma.review.create({
    data: {
      bookingId,
      authorId: userId,
      revieweeId,
      rating,
      comment: comment ?? null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      reviewee: { select: { id: true, name: true } },
    },
  });

  await createNotification(
    revieweeId,
    "REVIEW_RECEIVED",
    "New Review Received",
    `${review.author.name ?? "Someone"} left you a ${rating}-star review for ${booking.skill.name}.`,
    `/profile/${review.authorId}`
  );

  return NextResponse.json(review, { status: 201 });
}
