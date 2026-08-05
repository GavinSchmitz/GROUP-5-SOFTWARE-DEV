"use client";

import { useCallback, useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { RequireAuth } from "@/components/auth/require-auth";
import { Card, CardContent } from "@/components/ui/card";
import { MarkAsReadButton, MarkAllAsReadButton } from "./buttons";
import type { NotificationsResponse, NotificationEntry } from "@/types/api";

const typeIcons: Record<string, React.ElementType> = {
  BOOKING_REQUEST: CalendarCheck,
  BOOKING_ACCEPTED: CheckCircle,
  BOOKING_DECLINED: CalendarX,
  BOOKING_COMPLETED: Clock,
  REVIEW_RECEIVED: Star,
  MESSAGE_RECEIVED: MessageCircle,
  CREDIT_EARNED: Coins,
};

function NotificationsContent() {
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    return api
      .get<NotificationsResponse>("/notifications", { params: { limit: 50 } })
      .then((res) => {
        setNotifications(res.notifications);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAsRead(id: number) {
    try {
      await api.patch("/notifications", { id });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // ignore
    }
  }

  async function markAllAsRead() {
    try {
      await api.patch("/notifications", { markAllRead: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        <span>Loading…</span>
      </div>
    );
  }

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
        <MarkAllAsReadButton
          unreadCount={unreadCount}
          onMarkAllRead={markAllAsRead}
        />
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
                            onMarkRead={markAsRead}
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground/60">
                        {formatDistanceToNow(
                          new Date(notification.createdAt),
                          { addSuffix: true }
                        )}
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

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsContent />
    </RequireAuth>
  );
}
