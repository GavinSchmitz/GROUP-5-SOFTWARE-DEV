import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CalendarCheck,
  CalendarX,
  CheckCircle,
  Star,
  MessageCircle,
  Coins,
  Clock,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { MarkAsReadButton, MarkAllAsReadButton } from "./buttons";

const typeIcons: Record<string, React.ElementType> = {
  BOOKING_REQUEST: CalendarCheck,
  BOOKING_ACCEPTED: CheckCircle,
  BOOKING_DECLINED: CalendarX,
  BOOKING_COMPLETED: Clock,
  REVIEW_RECEIVED: Star,
  MESSAGE_RECEIVED: MessageCircle,
  CREDIT_EARNED: Coins,
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllAsReadButton />}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-sm text-muted-foreground/60">
                You&apos;ll see notifications here when activity happens.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] ?? Bell;
            const content = (
              <Card
                key={notification.id}
                className={notification.read ? "opacity-60" : ""}
              >
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        notification.read
                          ? "bg-muted"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900">
                            {notification.title}
                          </p>
                          {notification.body && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {notification.body}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                          )}
                          <MarkAsReadButton
                            notificationId={notification.id}
                            isRead={notification.read}
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground/60">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            if (notification.link) {
              return (
                <Link
                  key={notification.id}
                  href={notification.link}
                  className="block hover:opacity-90"
                >
                  {content}
                </Link>
              );
            }

            return content;
          })}
        </div>
      )}
    </div>
  );
}
