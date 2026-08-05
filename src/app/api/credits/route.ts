import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [user, transactions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { creditBalance: true },
    }),
    prisma.timeCredit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
        relatedBookingId: true,
      },
    }),
  ]);

  return NextResponse.json({
    balance: user.creditBalance,
    transactions,
  });
}
