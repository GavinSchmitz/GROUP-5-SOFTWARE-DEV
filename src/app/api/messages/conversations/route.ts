import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  const otherUserId = searchParams.get("userId");

  if (!otherUserId) {
    return NextResponse.json(
      { error: "userId query param is required" },
      { status: 400 }
    );
  }

  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, name: true, image: true },
  });

  if (!otherUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: {
      senderId: otherUserId,
      receiverId: userId,
      read: false,
    },
    data: { read: true },
  });

  return NextResponse.json({ user: otherUser, messages });
}
