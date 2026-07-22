"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function AdminSearch() {
  const router = useRouter();

  return (
    <div className="mb-4">
      <Input
        placeholder="Search users by name or email…"
        onChange={(e) => {
          const value = e.target.value;
          const params = new URLSearchParams(window.location.search);
          if (value) {
            params.set("search", value);
          } else {
            params.delete("search");
          }
          router.push(`/admin?${params.toString()}`);
        }}
      />
    </div>
  );
}
