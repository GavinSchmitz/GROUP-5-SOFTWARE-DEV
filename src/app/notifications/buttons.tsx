"use client";

import { CheckCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkAsReadButton({
  notificationId,
  isRead,
  onMarkRead,
}: {
  notificationId: number;
  isRead: boolean;
  onMarkRead: (id: number) => void;
}) {
  if (isRead) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkRead(notificationId);
  };

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={handleClick}
      title="Mark as read"
    >
      <Check className="h-3 w-3" />
    </Button>
  );
}

export function MarkAllAsReadButton({
  unreadCount,
  onMarkAllRead,
}: {
  unreadCount: number;
  onMarkAllRead: () => void;
}) {
  if (unreadCount === 0) return null;

  return (
    <Button variant="outline" size="sm" onClick={onMarkAllRead}>
      <CheckCheck className="h-4 w-4" />
      Mark All as Read
    </Button>
  );
}
