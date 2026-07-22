import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { addCredits, deductCredits, durationToCredits } from "@/lib/credits";

const updateBookingSchema = z.object({
  status: z.enum([
    "ACCEPTED",
    "CANCELLED",
    "IN_PROGRESS",
    "COMPLETED",
    "DISPUTED",
  ]),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      skill: true,
      requester: { select: { id: true, name: true, image: true } },
      provider: { select: { id: true, name: true, image: true } },
      reviews: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const userId = session.user.id;
  if (booking.requesterId !== userId && booking.providerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(booking);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const parsed = updateBookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { status } = parsed.data;

  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.requesterId !== userId && booking.providerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isProvider = booking.providerId === userId;
  const isRequester = booking.requesterId === userId;

  if (
    (status === "ACCEPTED" || status === "CANCELLED" || status === "DISPUTED") &&
    !isProvider
  ) {
    return NextResponse.json(
      { error: "Only the provider can accept, decline, or dispute a booking" },
      { status: 403 }
    );
  }

  if (status === "CANCELLED" && !isProvider && !isRequester) {
    return NextResponse.json(
      { error: "Only the requester can cancel" },
      { status: 403 }
    );
  }

  if (status === "IN_PROGRESS" && !isProvider && !isRequester) {
    return NextResponse.json(
      { error: "Only the involved parties can start this booking" },
      { status: 403 }
    );
  }

  if (status === "COMPLETED" && booking.status !== "IN_PROGRESS") {
    return NextResponse.json(
      { error: "Booking must be in progress before it can be completed" },
      { status: 400 }
    );
  }

  if (status === "IN_PROGRESS" && booking.status !== "ACCEPTED") {
    return NextResponse.json(
      { error: "Booking must be accepted before it can be started" },
      { status: 400 }
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: { status },
    include: {
      skill: true,
      requester: { select: { id: true, name: true, image: true } },
      provider: { select: { id: true, name: true, image: true } },
      reviews: {
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (status === "COMPLETED") {
    const credits = durationToCredits(booking.durationMinutes);

    await addCredits(
      booking.providerId,
      credits,
      "EARNED",
      `Earned ${credits} credit(s) for completing a ${booking.durationMinutes}-min session`,
      booking.id
    );

    await deductCredits(
      booking.requesterId,
      credits,
      "SPENT",
      `Spent ${credits} credit(s) for a ${booking.durationMinutes}-min session`,
      booking.id
    );

    const skill = await prisma.skill.findUnique({
      where: { id: booking.skillId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        userId: booking.providerId,
        type: "BOOKING_COMPLETED",
        title: "Booking Completed",
        body: `Your session for ${skill?.name ?? "a skill"} has been completed. You earned ${credits} credit(s)!`,
        link: `/bookings/${booking.id}`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: booking.requesterId,
        type: "CREDIT_EARNED",
        title: "Session Completed",
        body: `Your ${booking.durationMinutes}-min session for ${skill?.name ?? "a skill"} is complete.`,
        link: `/bookings/${booking.id}`,
      },
    });
  } else if (status === "ACCEPTED") {
    const skill = await prisma.skill.findUnique({
      where: { id: booking.skillId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        userId: booking.requesterId,
        type: "BOOKING_ACCEPTED",
        title: "Booking Accepted",
        body: `Your booking for ${skill?.name ?? "a skill"} has been accepted!`,
        link: `/bookings/${booking.id}`,
      },
    });
  } else if (status === "CANCELLED") {
    const notifyUserId = isProvider ? booking.requesterId : booking.providerId;

    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: "BOOKING_DECLINED",
        title: "Booking Cancelled",
        body: `A booking has been cancelled.`,
        link: `/bookings/${booking.id}`,
      },
    });
  }

  return NextResponse.json(updatedBooking);
}
