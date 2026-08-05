"use client";

import { useRouter } from "next/navigation";
import { CheckCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarkAsReadButton({
  notificationId,
  isRead,
}: {
  notificationId: string;
  isRead: boolean;
}) {
  const router = useRouter();

  if (isRead) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: notificationId }),
    });
    router.refresh();
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

export function MarkAllAsReadButton() {
  const router = useRouter();

  const handleClick = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <CheckCheck className="h-4 w-4" />
      Mark All as Read
    </Button>
  );
}
