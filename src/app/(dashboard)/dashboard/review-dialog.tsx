"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { parseApiError } from "@/lib/errors";
import type { BookingEntry } from "@/types/api";

export function ReviewDialog({
  booking,
  open,
  onOpenChange,
  onSubmitted,
}: {
  booking: BookingEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!booking || rating === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/reviews", {
        bookingId: booking.id,
        rating,
        comment: comment.trim() || undefined,
      });
      onOpenChange(false);
      setRating(0);
      setComment("");
      onSubmitted();
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Rate your session
            {booking ? ` for ${booking.skill.name}` : ""}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="rounded p-1 transition-colors hover:bg-muted"
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`size-6 ${
                      value <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review-comment">Comment (optional)</Label>
            <textarea
              id="review-comment"
              value={comment}
              maxLength={500}
              rows={3}
              onChange={(e) => setComment(e.target.value)}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              placeholder="How was the session?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
