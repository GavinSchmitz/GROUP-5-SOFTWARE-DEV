"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Coins, Shield, XCircle } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { api } from "@/lib/api-client";
import { AdminSearch } from "./admin-search";
import { CreditAdjustDialog } from "./credit-adjust-dialog";
import { useAuth } from "@/components/auth/use-auth";
import type {
  AdminStatsResponse,
  AdminUsersResponse,
  AdminBookingsResponse,
  AdminSkillsResponse,
  AdminUser,
  BookingEntry,
} from "@/types/api";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  DISPUTED: "bg-red-100 text-red-800",
};

function AdminContent() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [users, setUsers] = useState<AdminUsersResponse | null>(null);
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [skills, setSkills] = useState<AdminSkillsResponse | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actingUserId, setActingUserId] = useState<number | null>(null);
  const [actingBookingId, setActingBookingId] = useState<number | null>(null);
  const [adjustingUser, setAdjustingUser] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    try {
      const [statsRes, usersRes, bookingsRes, skillsRes] = await Promise.all([
        api.get<AdminStatsResponse>("/admin"),
        api.get<AdminUsersResponse>("/admin/users", {
          params: { page: 1, limit: 50, search: search || undefined },
        }),
        api.get<AdminBookingsResponse>("/admin/bookings", {
          params: { page: 1, limit: 20 },
        }),
        api.get<AdminSkillsResponse>("/admin/skills"),
      ]);
      setStats(statsRes);
      setUsers(usersRes);
      setBookings(bookingsRes.bookings);
      setSkills(skillsRes);
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [load, search]);

  async function toggleRole(user: AdminUser) {
    setActingUserId(user.id);
    try {
      await api.patch("/admin/users", {
        userId: user.id,
        role: user.role === "ADMIN" ? "USER" : "ADMIN",
      });
      await load();
    } catch {
      // ignore
    } finally {
      setActingUserId(null);
    }
  }

  async function cancelBooking(booking: BookingEntry) {
    setActingBookingId(booking.id);
    try {
      await api.delete(`/admin/bookings/${booking.id}`);
      await load();
    } catch {
      // ignore
    } finally {
      setActingBookingId(null);
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Admin Dashboard
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalBookings ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.activeBookings ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Credits Circulated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.totalCreditsCirculated ?? 0).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminSearch value={search} onChange={setSearch} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(users?.users ?? []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name ?? "—"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.creditBalance.toFixed(1)}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1.5">
                        {user.id !== currentUser?.id && (
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={actingUserId === user.id}
                            onClick={() => toggleRole(user)}
                            title={
                              user.role === "ADMIN"
                                ? "Revoke admin role"
                                : "Grant admin role"
                            }
                          >
                            <Shield className="size-3" />
                            {user.role === "ADMIN" ? "Revoke" : "Make Admin"}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => setAdjustingUser(user)}
                          title="Adjust credits"
                        >
                          <Coins className="size-3" />
                          Credits
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(users?.users ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.requester.name ?? "—"}</TableCell>
                    <TableCell>{booking.provider.name ?? "—"}</TableCell>
                    <TableCell>{booking.skill.name}</TableCell>
                    <TableCell>
                      <Badge
                        className={statusColors[booking.status] ?? ""}
                        variant="outline"
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{booking.durationMinutes}m</TableCell>
                    <TableCell>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        {!["COMPLETED", "CANCELLED", "DISPUTED"].includes(
                          booking.status
                        ) && (
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={actingBookingId === booking.id}
                            onClick={() => cancelBooking(booking)}
                            title="Cancel this booking"
                          >
                            <XCircle className="size-3" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {bookings.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No bookings yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Providers</TableHead>
                  <TableHead>Bookings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(skills?.skills ?? []).map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>{skill.category}</TableCell>
                    <TableCell>{skill.slug}</TableCell>
                    <TableCell>{skill._count.userSkills}</TableCell>
                    <TableCell>{skill._count.bookings}</TableCell>
                  </TableRow>
                ))}
                {(skills?.skills ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No skills yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {adjustingUser && (
        <CreditAdjustDialog
          user={adjustingUser}
          onClose={() => setAdjustingUser(null)}
          onAdjusted={() => load()}
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth adminOnly>
      <AdminContent />
    </RequireAuth>
  );
}
