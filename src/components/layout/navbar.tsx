"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  LogOut,
  User,
  LayoutDashboard,
  MessageSquare,
  Bell,
  Shield,
} from "lucide-react";
import { useAuth } from "@/components/auth/use-auth";
import { api } from "@/lib/api-client";
import type { NotificationsResponse } from "@/types/api";

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchUnread = () => {
      api
        .get<NotificationsResponse>("/notifications")
        .then((res) => {
          if (!cancelled) setUnreadCount(res.unreadCount);
        })
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Clock className="h-6 w-6 text-amber-600" />
          <span className="text-amber-600">Hour</span>
          <span>Bank</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/skills"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse Skills
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/messages"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Messages
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading && (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          )}

          {user && (
            <Link
              href="/notifications"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="hidden sm:flex gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100"
              >
                <Clock className="h-3 w-3" />
                {user.creditBalance ?? 0} credits
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    />
                  }
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? ""} alt="" />
                    <AvatarFallback>
                      {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2"
                      />
                    }
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={
                      <Link
                        href={`/profile/${user.id}`}
                        className="flex items-center gap-2"
                      />
                    }
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={
                      <Link href="/messages" className="flex items-center gap-2" />
                    }
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem
                      render={
                        <Link href="/admin" className="flex items-center gap-2" />
                      }
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            !loading && (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-amber-600 px-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
