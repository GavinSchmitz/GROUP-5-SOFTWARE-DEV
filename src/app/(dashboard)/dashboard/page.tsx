"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  User,
  Star,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuth } from "@/components/auth/use-auth";
import { api } from "@/lib/api-client";
import { ReviewDialog } from "./review-dialog";
import type {
  BookingsListResponse,
  CreditsResponse,
  NotificationsResponse,
  BookingEntry,
  BookingStatus,
  CreditTransaction,
} from "@/types/api";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  DISPUTED: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={statusStyles[status] ?? ""}>
      {status.replace("_", " ")}
    </Badge>
  );
}

function getBookingActions(
  booking: BookingEntry,
  userId: number | undefined
): BookingStatus[] {
  if (!userId) return [];
  const isProvider = booking.provider.id === userId;
  const isRequester = booking.requester.id === userId;
  if (!isProvider && !isRequester) return [];
  const role = isProvider ? "provider" : "requester";

  const matrix: Record<string, Record<string, BookingStatus[]>> = {
    PENDING: {
      provider: ["ACCEPTED", "CANCELLED"],
      requester: ["CANCELLED"],
    },
    ACCEPTED: {
      provider: ["IN_PROGRESS", "CANCELLED"],
      requester: ["IN_PROGRESS"],
    },
    IN_PROGRESS: {
      provider: ["COMPLETED", "DISPUTED"],
      requester: ["COMPLETED"],
    },
  };

  return matrix[booking.status]?.[role] ?? [];
}

function DashboardContent() {
  const { user } = useAuth();
  const userId = user?.id;

  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [credits, setCredits] = useState<CreditTransaction[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actingBooking, setActingBooking] = useState<number | null>(null);
  const [reviewBooking, setReviewBooking] = useState<BookingEntry | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const load = useCallback(() => {
    if (!userId) return Promise.resolve();
    return Promise.all([
      api.get<BookingsListResponse>("/bookings", { params: { limit: 100 } }),
      api.get<CreditsResponse>("/credits"),
      api.get<NotificationsResponse>("/notifications"),
    ])
      .then(([bookingsRes, creditsRes, notificationsRes]) => {
        setBookings(bookingsRes.bookings);
        setBalance(creditsRes.balance);
        setCredits(creditsRes.transactions);
        setUnreadCount(notificationsRes.unreadCount);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const activeBookings = bookings.filter((b) =>
    ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(b.status)
  );
  const closedBookings = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED", "DISPUTED"].includes(b.status)
  );

  async function updateStatus(booking: BookingEntry, status: BookingStatus) {
    setActingBooking(booking.id);
    try {
      await api.patch(`/bookings/${booking.id}`, { status });
      await load();
    } catch {
      // ignore — keep list unchanged
    } finally {
      setActingBooking(null);
    }
  }

  function openReview(booking: BookingEntry) {
    setReviewBooking(booking);
    setReviewOpen(true);
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
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Balance Card */}
      <Card className="mb-8 border-amber-200 bg-gradient-to-r from-amber-50 to-white">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name ?? "there"}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {balance ?? 0}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  credits
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mb-8 flex gap-3">
        <Link
          href="/skills"
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 bg-amber-600 hover:bg-amber-700 text-white h-8 gap-1.5 px-2.5"
        >
          <Plus className="h-4 w-4" />
          Find Skills
        </Link>
        {userId && (
          <Link
            href={`/profile/${userId}`}
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 border-border bg-background hover:bg-muted hover:text-foreground h-8 gap-1.5 px-2.5"
          >
            <User className="h-4 w-4" />
            View Profile
          </Link>
        )}
        {unreadCount > 0 && (
          <Link
            href="/notifications"
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 hover:bg-muted hover:text-foreground h-8 gap-1.5 px-2.5"
          >
            {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
          </Link>
        )}
      </div>

      {/* Active Bookings */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Active Bookings
        </h2>
        {activeBookings.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                No active bookings. Browse skills to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeBookings.map((booking) => {
              const actions = getBookingActions(booking, userId);
              const isProvider = booking.provider.id === userId;
              const otherParty = isProvider
                ? booking.requester
                : booking.provider;
              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{booking.skill.name}</CardTitle>
                        <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                          <User className="h-3 w-3" />
                          {otherParty.name ?? "Unknown"}
                          <span className="text-muted-foreground/60">|</span>
                          <Calendar className="h-3 w-3" />
                          {booking.scheduledAt
                            ? new Date(booking.scheduledAt).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "No date set"}
                          <span className="text-muted-foreground/60">|</span>
                          {booking.durationMinutes} min
                        </CardDescription>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </CardHeader>
                  {actions.length > 0 && (
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {actions.includes("ACCEPTED") && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={actingBooking === booking.id}
                            onClick={() => updateStatus(booking, "ACCEPTED")}
                          >
                            Accept
                          </Button>
                        )}
                        {actions.includes("IN_PROGRESS") && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actingBooking === booking.id}
                            onClick={() => updateStatus(booking, "IN_PROGRESS")}
                          >
                            Start Session
                          </Button>
                        )}
                        {actions.includes("COMPLETED") && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={actingBooking === booking.id}
                            onClick={() => updateStatus(booking, "COMPLETED")}
                          >
                            Complete
                          </Button>
                        )}
                        {actions.includes("DISPUTED") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actingBooking === booking.id}
                            onClick={() => updateStatus(booking, "DISPUTED")}
                          >
                            Dispute
                          </Button>
                        )}
                        {actions.includes("CANCELLED") && (
                          <Button
                            size="sm"
                            variant={
                              isProvider && booking.status === "PENDING"
                                ? "destructive"
                                : "outline"
                            }
                            disabled={actingBooking === booking.id}
                            onClick={() => updateStatus(booking, "CANCELLED")}
                          >
                            {isProvider && booking.status === "PENDING"
                              ? "Decline"
                              : "Cancel"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed & Closed */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Completed &amp; Closed
        </h2>
        {closedBookings.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                No completed or cancelled bookings yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {closedBookings.map((booking) => {
              const isProvider = booking.provider.id === userId;
              const otherParty = isProvider
                ? booking.requester
                : booking.provider;
              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{booking.skill.name}</CardTitle>
                        <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                          <User className="h-3 w-3" />
                          {otherParty.name ?? "Unknown"}
                          <span className="text-muted-foreground/60">|</span>
                          <Calendar className="h-3 w-3" />
                          {booking.scheduledAt
                            ? new Date(booking.scheduledAt).toLocaleDateString()
                            : "No date set"}
                        </CardDescription>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </CardHeader>
                  {booking.status === "COMPLETED" && (
                    <CardContent>
                      <Button size="sm" variant="outline" onClick={() => openReview(booking)}>
                        <Star className="size-3.5" />
                        Leave a Review
                      </Button>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Recent Activity
        </h2>
        <Card>
          <CardContent>
            {credits.length === 0 ? (
              <p className="text-muted-foreground">No recent activity yet.</p>
            ) : (
              <div className="space-y-0">
                {credits.map((credit, index) => (
                  <div key={credit.id}>
                    <div className="flex items-center gap-3 py-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          credit.amount >= 0
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {credit.amount >= 0 ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {credit.description ?? credit.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(credit.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          credit.amount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {credit.amount >= 0 ? "+" : ""}
                        {credit.amount}
                      </span>
                    </div>
                    {index < credits.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <ReviewDialog
        booking={reviewBooking}
        open={reviewOpen}
        onOpenChange={(open) => {
          setReviewOpen(open);
          if (!open) setReviewBooking(null);
        }}
        onSubmitted={() => load()}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
