import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalBookings, activeBookings, creditResult] =
    await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: { in: ["PENDING", "ACCEPTED", "IN_PROGRESS"] } },
      }),
      prisma.timeCredit.aggregate({
        where: { type: { in: ["EARNED", "SPENT"] } },
        _sum: { amount: true },
      }),
    ]);

  return NextResponse.json({
    totalUsers,
    totalBookings,
    activeBookings,
    totalCreditsCirculated: Math.abs(creditResult._sum.amount ?? 0),
  });
}
