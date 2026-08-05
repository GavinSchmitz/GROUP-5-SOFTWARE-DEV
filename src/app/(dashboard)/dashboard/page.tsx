import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  User,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  const [user, upcomingBookings, pendingRequests, recentCredits, unreadCount] =
    await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { name: true, creditBalance: true },
      }),
      prisma.booking.findMany({
        where: {
          OR: [{ requesterId: userId }, { providerId: userId }],
          status: { in: ["ACCEPTED", "IN_PROGRESS"] },
        },
        include: {
          skill: { select: { name: true } },
          requester: { select: { id: true, name: true } },
          provider: { select: { id: true, name: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
      prisma.booking.findMany({
        where: { providerId: userId, status: "PENDING" },
        include: {
          skill: { select: { name: true } },
          requester: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.timeCredit.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

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
                Welcome back, {user.name ?? "there"}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {user.creditBalance}{" "}
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
        <Button render={<Link href="/skills" />} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4" />
          Find Skills
        </Button>
        <Button render={<Link href={`/profile/${userId}`} />} variant="outline">
          <User className="h-4 w-4" />
          View Profile
        </Button>
        {unreadCount > 0 && (
          <Button render={<Link href="/notifications" />} variant="ghost">
            {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
          </Button>
        )}
      </div>

      {/* Upcoming Bookings */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Upcoming Bookings
        </h2>
        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                No upcoming bookings. Browse skills to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingBookings.map((booking) => {
              const otherParty =
                booking.requesterId === userId
                  ? booking.provider
                  : booking.requester;
              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{booking.skill.name}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {otherParty.name ?? "Unknown"}
                          <span className="text-muted-foreground/60">|</span>
                          <Calendar className="h-3 w-3" />
                          {booking.scheduledAt
                            ? new Date(
                                booking.scheduledAt
                              ).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "No date set"}
                          <span className="text-muted-foreground/60">|</span>
                          {booking.durationMinutes} min
                        </CardDescription>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Pending Requests */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Pending Requests
        </h2>
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                No pending requests at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{booking.skill.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {booking.requester.name ?? "Unknown"}
                        <span className="text-muted-foreground/60">|</span>
                        {booking.durationMinutes} min
                        <span className="text-muted-foreground/60">|</span>
                        Requested{" "}
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Accept
                    </Button>
                    <Button size="sm" variant="destructive">
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            {recentCredits.length === 0 ? (
              <p className="text-muted-foreground">
                No recent activity yet.
              </p>
            ) : (
              <div className="space-y-0">
                {recentCredits.map((credit, index) => (
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
                    {index < recentCredits.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
