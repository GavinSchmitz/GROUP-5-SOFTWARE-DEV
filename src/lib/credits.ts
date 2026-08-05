import { prisma } from "@/lib/prisma";

export const STARTER_CREDITS = 3;
export const CREDITS_PER_HOUR = 1;

export async function getUserBalance(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditBalance: true },
  });
  return user?.creditBalance ?? 0;
}

export async function addCredits(
  userId: string,
  amount: number,
  type: string,
  description: string,
  relatedBookingId?: string
) {
  const [credit, updatedUser] = await prisma.$transaction([
    prisma.timeCredit.create({
      data: {
        userId,
        amount,
        type,
        description,
        relatedBookingId,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { creditBalance: { increment: amount } },
    }),
  ]);

  return { credit, newBalance: updatedUser.creditBalance };
}

export async function deductCredits(
  userId: string,
  amount: number,
  type: string,
  description: string,
  relatedBookingId?: string
) {
  const balance = await getUserBalance(userId);
  if (balance < amount) {
    throw new Error("Insufficient credits");
  }

  const [credit, updatedUser] = await prisma.$transaction([
    prisma.timeCredit.create({
      data: {
        userId,
        amount: -amount,
        type,
        description,
        relatedBookingId,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { creditBalance: { decrement: amount } },
    }),
  ]);

  return { credit, newBalance: updatedUser.creditBalance };
}

export async function getCreditHistory(userId: string, limit = 50) {
  return prisma.timeCredit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      booking: {
        include: {
          skill: true,
          requester: { select: { id: true, name: true, image: true } },
          provider: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });
}

export function durationToCredits(durationMinutes: number): number {
  return Math.ceil(durationMinutes / 60);
}
