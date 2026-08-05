"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
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
import type { Session } from "next-auth";

export function Navbar() {
  const { data: session, status } = useSession();
  const s = session as Session | null;
  const u = s?.user as (Session["user"] & { role?: string; creditBalance?: number }) | undefined;

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
          {session && (
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
          {status === "loading" && (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          )}

          {session && (
            <Link
              href="/notifications"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
            </Link>
          )}

          {session ? (
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="hidden sm:flex gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100"
              >
                <Clock className="h-3 w-3" />
                {u?.creditBalance ?? 0}{" "}
                credits
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image ?? ""} alt="" />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/dashboard" className="flex items-center gap-2" />}>
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href={`/profile/${session.user?.id}`} className="flex items-center gap-2" />}>
                      <User className="h-4 w-4" />
                      My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/messages" className="flex items-center gap-2" />}>
                      <MessageSquare className="h-4 w-4" />
                      Messages
                  </DropdownMenuItem>
                  {u?.role === "ADMIN" && (
                    <DropdownMenuItem render={<Link href="/admin" className="flex items-center gap-2" />}>
                        <Shield className="h-4 w-4" />
                        Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            status !== "loading" && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" render={<Link href="/auth/signin" />}>Sign In</Button>
                <Button render={<Link href="/auth/signup" />} className="bg-amber-600 hover:bg-amber-700">Sign Up</Button>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
}
