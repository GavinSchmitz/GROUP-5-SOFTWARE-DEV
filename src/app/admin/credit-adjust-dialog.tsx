"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { parseApiError } from "@/lib/errors";
import type { AdminUser } from "@/types/api";

export function CreditAdjustDialog({
  user,
  onClose,
  onAdjusted,
}: {
  user: AdminUser;
  onClose: () => void;
  onAdjusted: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value === 0 || !reason.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/credits/adjust", {
        userId: user.id,
        amount: value,
        reason: reason.trim(),
      });
      onClose();
      onAdjusted();
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message || "Failed to adjust credits.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Adjust Credits — {user.name ?? user.email}
          </DialogTitle>
          <DialogDescription>
            Add or deduct credits from this user&apos;s balance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="adjust-amount">Amount</Label>
            <Input
              id="adjust-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5 to add, -3 to deduct"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adjust-reason">Reason</Label>
            <Input
              id="adjust-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Community bonus"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !Number.isFinite(Number(amount)) ||
              Number(amount) === 0 ||
              !reason.trim()
            }
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Adjusting…
              </>
            ) : (
              "Adjust Credits"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
