"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./use-auth";

export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (adminOnly && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [loading, user, adminOnly, router]);

  if (loading || !user || (adminOnly && user.role !== "ADMIN")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        <span>Loading…</span>
      </div>
    );
  }

  return <>{children}</>;
}
