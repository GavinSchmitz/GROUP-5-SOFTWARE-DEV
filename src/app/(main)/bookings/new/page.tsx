"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Coins } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/components/auth/use-auth";
import type {
  BookingDetailResponse,
  SkillDetailResponse,
  UserProfile,
} from "@/types/api";

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

const bookingSchema = z.object({
  description: z.string().optional(),
  scheduledAt: z.string().optional(),
  durationMinutes: z.number()
    .int()
    .min(30, "Minimum duration is 30 minutes")
    .max(480, "Maximum duration is 8 hours"),
  location: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface Skill {
  id: number;
  name: string;
  category: string;
  description: string | null;
}

interface Provider {
  id: number;
  name: string | null;
  image: string | null;
  location: string | null;
}

function NewBookingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const skillId = searchParams.get("skillId");
  const providerId = searchParams.get("providerId");

  const [skill, setSkill] = useState<Skill | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { durationMinutes: 60 },
  });

  const durationMinutes = watch("durationMinutes");
  const creditCost = Math.ceil(durationMinutes / 60);
  const balance = user?.creditBalance ?? null;

  useEffect(() => {
    if (!providerId) {
      Promise.resolve().then(() => {
        setLoading(false);
        setError("Missing provider information");
      });
      return;
    }

    api
      .get<UserProfile>(`/users/${providerId}`)
      .then((providerRes) => {
        setProvider(providerRes);

        if (!skillId) {
          const offered = providerRes.userSkills.find((us) => us.is_offered);
          if (!offered) {
            setError("This user does not offer any skills to book.");
            setLoading(false);
            return null;
          }
          setSkill({
            id: offered.skill.id,
            name: offered.skill.name,
            category: offered.skill.category,
            description: null,
          });
          setLoading(false);
          return null;
        }

        return api.get<SkillDetailResponse>(`/skills/${skillId}`);
      })
      .then((skillRes) => {
        if (skillRes) {
          setSkill(skillRes);
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Failed to load booking details");
        setLoading(false);
      });
  }, [skillId, providerId]);

  const onSubmit = async (values: BookingFormValues) => {
    if (!providerId || !skill) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.post<BookingDetailResponse>("/bookings", {
        skillId: skill.id,
        providerId: Number(providerId),
        durationMinutes: values.durationMinutes,
        description: values.description || undefined,
        scheduledAt: values.scheduledAt
          ? new Date(values.scheduledAt).toISOString()
          : undefined,
        location: values.location || undefined,
      });
      router.push("/dashboard");
    } catch {
      setError("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-40 rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error && !skill) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Request a Session
      </h1>

      {skill && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{skill.name}</CardTitle>
            <CardDescription>{skill.category}</CardDescription>
          </CardHeader>
          {skill.description && (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {skill.description}
              </p>
            </CardContent>
          )}
        </Card>
      )}

      {provider && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {provider.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={provider.image}
                  alt={provider.name ?? ""}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  {provider.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
              )}
              <div>
                <p className="font-medium">{provider.name ?? "Anonymous"}</p>
                {provider.location && (
                  <p className="text-xs text-muted-foreground">
                    {provider.location}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <Coins className="h-4 w-4 shrink-0" />
        <span>
          This session will cost <strong>{creditCost} credit{creditCost !== 1 ? "s" : ""}</strong>
          {balance !== null && (
            <>
              {" "}(your balance: {balance})
            </>
          )}
        </span>
      </div>

      {balance !== null && balance < creditCost && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          You don&apos;t have enough credits. You need {creditCost} but only have {balance}.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <textarea
            id="description"
            {...register("description")}
            placeholder="What would you like to learn or accomplish?"
            rows={3}
            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Date & time</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              {...register("scheduledAt")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationMinutes">Duration</Label>
            <select
              id="durationMinutes"
              {...register("durationMinutes", { valueAsNumber: true })}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (optional)</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="Where will this take place?"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={
              submitting || (balance !== null && balance < creditCost)
            }
          >
            {submitting ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              `Request Session (${creditCost} credit${creditCost !== 1 ? "s" : ""})`
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-40 rounded-xl bg-muted" />
          </div>
        </div>
      }
    >
      <NewBookingPageInner />
    </Suspense>
  );
}
