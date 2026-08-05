import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const conversationMap = new Map<
    string,
    {
      otherUser: { id: string; name: string | null; image: string | null };
      lastMessage: (typeof messages)[number] | null;
      unreadCount: number;
    }
  >();

  for (const msg of messages) {
    const otherUser =
      msg.senderId === userId ? msg.receiver : msg.sender;
    const key = otherUser.id;

    if (!conversationMap.has(key)) {
      conversationMap.set(key, {
        otherUser,
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    const convo = conversationMap.get(key)!;
    if (msg.receiverId === userId && !msg.read) {
      convo.unreadCount++;
    }
  }

  const conversations = Array.from(conversationMap.values()).sort((a, b) => {
    if (!a.lastMessage || !b.lastMessage) return 0;
    return (
      new Date(b.lastMessage.createdAt).getTime() -
      new Date(a.lastMessage.createdAt).getTime()
    );
  });

  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { receiverId, content } = parsed.data;

  if (receiverId === userId) {
    return NextResponse.json(
      { error: "You cannot message yourself" },
      { status: 400 }
    );
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId,
      content,
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "MESSAGE_RECEIVED",
      title: "New Message",
      body: `${sender?.name ?? "Someone"} sent you a message.`,
      link: `/messages?userId=${userId}`,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
