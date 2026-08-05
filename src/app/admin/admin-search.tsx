"use client";

import { Input } from "@/components/ui/input";

export function AdminSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-4">
      <Input
        placeholder="Search users by name or email…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
