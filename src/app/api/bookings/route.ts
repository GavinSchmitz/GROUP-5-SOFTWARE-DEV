import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { durationToCredits } from "@/lib/credits";

const createBookingSchema = z.object({
  skillId: z.string().min(1),
  providerId: z.string().min(1),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(30).max(480).default(60),
  location: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ requesterId: userId }, { providerId: userId }],
      ...(status ? { status } : {}),
    },
    include: {
      skill: true,
      requester: {
        select: { id: true, name: true, image: true },
      },
      provider: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const body = await request.json();
  const parsed = createBookingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { skillId, providerId, description, scheduledAt, durationMinutes, location } =
    parsed.data;

  if (providerId === userId) {
    return NextResponse.json(
      { error: "You cannot book yourself" },
      { status: 400 }
    );
  }

  const skill = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!skill) {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }

  const provider = await prisma.user.findUnique({ where: { id: providerId } });
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  const providerSkill = await prisma.userSkill.findFirst({
    where: { userId: providerId, skillId, isOffered: true },
  });
  if (!providerSkill) {
    return NextResponse.json(
      { error: "This provider does not offer this skill" },
      { status: 400 }
    );
  }

  const requester = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true },
  });
  const creditCost = durationToCredits(durationMinutes);

  if ((requester?.creditBalance ?? 0) < creditCost) {
    return NextResponse.json(
      {
        error: "Insufficient credits",
        required: creditCost,
        current: requester?.creditBalance ?? 0,
      },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      requesterId: userId,
      providerId,
      skillId,
      description: description ?? null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      durationMinutes,
      location: location ?? null,
    },
    include: {
      skill: true,
      requester: { select: { id: true, name: true, image: true } },
      provider: { select: { id: true, name: true, image: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: providerId,
      type: "BOOKING_REQUEST",
      title: "New Booking Request",
      body: `${booking.requester.name ?? "Someone"} requested a ${durationMinutes}-min session for ${skill.name}.`,
      link: `/bookings/${booking.id}`,
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
